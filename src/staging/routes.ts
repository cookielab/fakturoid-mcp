import type { FileStaging, StagedFile } from "./storage.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
	"application/pdf",
	"image/png",
	"image/jpeg",
	"image/gif",
	"text/xml",
	"application/xml",
]);

interface UploadInput {
	content: ArrayBuffer;
	filename: string;
	mimeType: string;
}

interface UploadResult {
	file_ref: string;
	filename: string;
	size: number;
	mime_type: string;
	expires_in_seconds: number;
}

const handleFileUpload = async (staging: FileStaging, input: UploadInput): Promise<UploadResult> => {
	if (input.content.byteLength > MAX_FILE_SIZE) {
		throw new Error("File exceeds maximum size of 10MB");
	}

	if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
		throw new Error(`Unsupported file type: ${input.mimeType}. Allowed: PDF, PNG, JPEG, GIF, XML`);
	}

	const ref = await staging.store({
		content: input.content,
		filename: input.filename,
		mimeType: input.mimeType,
	});

	return {
		file_ref: ref,
		filename: input.filename,
		size: input.content.byteLength,
		mime_type: input.mimeType,
		expires_in_seconds: 300,
	};
};

const handleFileDownload = async (staging: FileStaging, ref: string): Promise<StagedFile | null> => {
	return await staging.peek(ref);
};

export { handleFileUpload, handleFileDownload };
export type { UploadInput, UploadResult };
