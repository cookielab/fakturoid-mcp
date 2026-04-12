import type { CreateAttachment } from "../fakturoid/model/common.js";
import type { FileStaging } from "./storage.js";

const DATA_URI_REGEX = /^data:([^;]+);base64,(.+)$/;

interface FileSource {
	file_ref?: string;
	source_url?: string;
	file_path?: string;
	data?: string;
	filename?: string;
	mimeType?: string;
}

interface ResolvedFile {
	content: ArrayBuffer;
	filename: string;
	mimeType: string;
}

const resolveFileSource = async (source: FileSource, staging: FileStaging): Promise<ResolvedFile> => {
	const providedSources = [source.file_ref, source.source_url, source.file_path, source.data].filter((v) => v != null);

	if (providedSources.length !== 1) {
		throw new Error("Provide exactly one file source: file_ref, source_url, file_path, or data/attachment");
	}

	if (source.file_ref != null) {
		return await resolveFromStaging(source.file_ref, staging);
	}

	if (source.source_url != null) {
		return await resolveFromUrl(source.source_url);
	}

	if (source.file_path != null) {
		return await resolveFromFilePath(source.file_path);
	}

	// biome-ignore lint/style/noNonNullAssertion: data is guaranteed non-null here since providedSources.length === 1 and other branches already returned
	return resolveFromData(source.data!, source.filename, source.mimeType);
};

const resolveFromStaging = async (ref: string, staging: FileStaging): Promise<ResolvedFile> => {
	const file = await staging.retrieve(ref);
	if (file == null) {
		throw new Error("File reference not found or expired. Upload the file again at /upload");
	}
	return file;
};

const resolveFromUrl = async (url: string): Promise<ResolvedFile> => {
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Failed to fetch file from URL: HTTP ${response.status}`);
	}

	const content = await response.arrayBuffer();
	const mimeType = response.headers.get("Content-Type") ?? "application/octet-stream";
	const filename = extractFilenameFromUrl(url);

	return { content: content, filename: filename, mimeType: mimeType };
};

const resolveFromFilePath = async (filePath: string): Promise<ResolvedFile> => {
	try {
		const fs = await import("node:fs/promises");
		const path = await import("node:path");

		const buffer = await fs.readFile(filePath);
		const filename = path.basename(filePath);
		const mimeType = inferMimeType(filename);

		return { content: buffer.buffer as ArrayBuffer, filename: filename, mimeType: mimeType };
	} catch (error) {
		if (error instanceof TypeError || (error as NodeJS.ErrnoException).code === "MODULE_NOT_FOUND") {
			throw new Error(
				"file_path is not supported on the hosted deployment. Use the /upload page to get a file_ref instead.",
			);
		}
		throw new Error(`Failed to read file: ${(error as Error).message}`);
	}
};

const resolveFromData = (data: string, filename?: string, mimeType?: string): ResolvedFile => {
	const dataUriMatch = data.match(DATA_URI_REGEX);
	if (dataUriMatch != null) {
		const parsedMime = dataUriMatch[1] ?? "";
		const base64Content = dataUriMatch[2] ?? "";
		return {
			content: base64ToBuffer(base64Content),
			filename: filename ?? "attachment",
			mimeType: mimeType ?? parsedMime,
		};
	}

	// Raw base64
	return {
		content: base64ToBuffer(data),
		filename: filename ?? "attachment",
		mimeType: mimeType ?? "application/octet-stream",
	};
};

const extractFilenameFromUrl = (url: string): string => {
	try {
		const pathname = new URL(url).pathname;
		const lastSegment = pathname.split("/").pop() ?? "download";
		return lastSegment || "download";
	} catch {
		return "download";
	}
};

const inferMimeType = (filename: string): string => {
	const ext = filename.split(".").pop()?.toLowerCase();
	const mimeTypes: Record<string, string> = {
		pdf: "application/pdf",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		xml: "application/xml",
	};
	return mimeTypes[ext ?? ""] ?? "application/octet-stream";
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes.buffer as ArrayBuffer;
};

const bufferToBase64 = (buffer: ArrayBuffer): string => {
	const bytes = new Uint8Array(buffer);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
};

const bufferToDataUri = (buffer: ArrayBuffer, mimeType: string): string => {
	return `data:${mimeType};base64,${bufferToBase64(buffer)}`;
};

interface AttachmentToolInput {
	file_ref?: string | undefined;
	source_url?: string | undefined;
	file_path?: string | undefined;
	data_url?: string | undefined;
	filename?: string | undefined;
}

const resolveAttachments = async (
	attachments: AttachmentToolInput[] | undefined,
	staging: FileStaging,
): Promise<CreateAttachment[] | undefined> => {
	if (attachments == null || attachments.length === 0) {
		return;
	}

	return await Promise.all(
		attachments.map(async (att) => {
			const file = await resolveFileSource(
				{
					...(att.file_ref != null && { file_ref: att.file_ref }),
					...(att.source_url != null && { source_url: att.source_url }),
					...(att.file_path != null && { file_path: att.file_path }),
					...(att.data_url != null && { data: att.data_url }),
					...(att.filename != null && { filename: att.filename }),
				},
				staging,
			);

			return {
				data_url: bufferToDataUri(file.content, file.mimeType),
				filename: att.filename ?? file.filename,
			};
		}),
	);
};

export { resolveFileSource, bufferToBase64, bufferToDataUri, resolveAttachments };
export type { FileSource, ResolvedFile, AttachmentToolInput };
