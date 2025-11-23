import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { ServerContext } from "../server.js";
import type { FakturoidClient } from "./client.js";

type AttachmentInput =
	| { data_url: string; filename?: string }
	| { file_path: string; filename?: string }
	| { inbox_file_id: number }
	| { url: string; filename?: string };

type ProcessedAttachment = {
	data_url: string;
	filename: string | undefined;
};

// Private network ranges to block (SSRF protection)
const BLOCKED_HOST_PATTERNS = [
	/^localhost$/i,
	/^127\.\d+\.\d+\.\d+$/,
	/^0\.0\.0\.0$/,
	/^10\.\d+\.\d+\.\d+$/,
	/^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
	/^192\.168\.\d+\.\d+$/,
	/^169\.254\.\d+\.\d+$/,
	/^\[::1\]$/,
	/^\[::/,
];

const ALLOWED_PROTOCOLS = ["http:", "https:"];

/**
 * Validate URL to prevent SSRF attacks
 */
function validateUrl(urlString: string): URL {
	const url = new URL(urlString);

	if (!ALLOWED_PROTOCOLS.includes(url.protocol)) {
		throw new Error(
			`Protocol ${url.protocol} not allowed. Only http: and https: are supported. ` +
				"Please ensure the URL points to a publicly accessible resource.",
		);
	}

	const hostname = url.hostname.toLowerCase();
	for (const pattern of BLOCKED_HOST_PATTERNS) {
		if (pattern.test(hostname)) {
			throw new Error(
				`Access to ${hostname} is blocked for security reasons. ` +
					"Only publicly accessible URLs are allowed. " +
					"Private networks, localhost, and link-local addresses cannot be accessed.",
			);
		}
	}

	return url;
}

/**
 * Detect MIME type from file extension
 */
function detectMimeType(filename: string): string {
	const ext = filename.toLowerCase().split(".").pop();
	const mimeTypes: Record<string, string> = {
		pdf: "application/pdf",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		png: "image/png",
		gif: "image/gif",
		txt: "text/plain",
		csv: "text/csv",
		xls: "application/vnd.ms-excel",
		xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		doc: "application/msword",
		docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	};

	return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Download file from URL with size and timeout limits
 */
async function downloadFromUrl(url: string, context: ServerContext): Promise<{ buffer: Buffer; mimeType: string }> {
	const validatedUrl = validateUrl(url);
	const maxBytes = context.uploadConfig.maxDownloadSizeMB * 1024 * 1024;

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), context.uploadConfig.downloadTimeoutMs);

	try {
		const response = await fetch(validatedUrl.toString(), {
			redirect: "follow",
			signal: controller.signal,
		});

		if (!response.ok) {
			throw new Error(`Failed to download file: HTTP ${response.status} ${response.statusText}`);
		}

		const contentLength = response.headers.get("content-length");
		if (contentLength && Number.parseInt(contentLength) > maxBytes) {
			throw new Error(
				`File too large: ${contentLength} bytes exceeds maximum of ${context.uploadConfig.maxDownloadSizeMB}MB`,
			);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Failed to read response body");
		}

		const chunks: Uint8Array[] = [];
		let receivedBytes = 0;

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			receivedBytes += value.length;
			if (receivedBytes > maxBytes) {
				reader.cancel();
				throw new Error(`File exceeds maximum size of ${context.uploadConfig.maxDownloadSizeMB}MB`);
			}

			chunks.push(value);
		}

		const buffer = Buffer.concat(chunks);
		const mimeType = response.headers.get("content-type")?.split(";")[0] || "application/octet-stream";

		return { buffer: buffer, mimeType : mimeType };
	} finally {
		clearTimeout(timeout);
	}
}

/**
 * Process attachment input and convert to Fakturoid API format
 */
export async function processAttachment(
	input: AttachmentInput,
	context: ServerContext,
	client: FakturoidClient<object, any>,
): Promise<ProcessedAttachment> {
	// Strategy 1: Raw data_url - pass through as-is
	if ("data_url" in input) {
		return {
			data_url: input.data_url,
			filename: input.filename,
		};
	}

	// Strategy 2: Local file path - only available in stdio mode
	if ("file_path" in input) {
		if (!context.capabilities.fileSystemAccess) {
			throw new Error(
				"file_path strategy is only available in stdio transport mode. " +
					`Current transport: ${context.transport}. ` +
					"Please use url or inbox_file_id instead, or switch to stdio mode.",
			);
		}

		const content = await readFile(input.file_path);
		const filename = input.filename || basename(input.file_path);
		const mimeType = detectMimeType(filename);
		const base64 = content.toString("base64");

		return {
			data_url: `data:${mimeType};base64,${base64}`,
			filename: filename,
		};
	}

	// Strategy 3: Inbox file ID - download from Fakturoid
	if ("inbox_file_id" in input) {
		const inboxFiles = await client.getInboxFiles();
		if (inboxFiles instanceof Error) {
			throw inboxFiles;
		}

		const inboxFile = inboxFiles.find((f) => f.id === input.inbox_file_id);
		if (!inboxFile) {
			throw new Error(`Inbox file with ID ${input.inbox_file_id} not found`);
		}

		const blob = await client.downloadInboxFile(input.inbox_file_id);
		if (blob instanceof Error) {
			throw blob;
		}

		const arrayBuffer = await blob.arrayBuffer();
		const base64 = Buffer.from(arrayBuffer).toString("base64");
		const mimeType = blob.type || detectMimeType(inboxFile.filename);

		return {
			data_url: `data:${mimeType};base64,${base64}`,
			filename: inboxFile.filename,
		};
	}

	// Strategy 4: URL download - only if enabled
	if ("url" in input) {
		if (!context.uploadConfig.allowUrlDownloads) {
			throw new Error(
				"URL-based attachment downloads are disabled. " +
					"Please use data_url, file_path (stdio mode only), or inbox_file_id instead. " +
					"To enable URL downloads, set ALLOW_URL_DOWNLOADS=true in your environment configuration.",
			);
		}

		const { buffer, mimeType } = await downloadFromUrl(input.url, context);
		const base64 = buffer.toString("base64");
		const filename = input.filename || basename(new URL(input.url).pathname) || "attachment";

		return {
			data_url: `data:${mimeType};base64,${base64}`,
			filename: filename,
		};
	}

	throw new Error("Invalid attachment input: must provide data_url, file_path, inbox_file_id, or url");
}
