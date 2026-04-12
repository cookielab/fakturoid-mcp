import { z } from "zod/v3";

const InboxFileSchema = z.object({
	/** File size in bytes */
	bytesize: z.number().int(),

	/** The date and time of file creation */
	created_at: z.string(),

	/** URL to download the file */
	download_url: z.string(),

	/** File name (with extension) */
	filename: z.string(),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),

	/** The date and time the OCR file was completed */
	ocr_completed_at: z.string().nullable(),

	/**
	 * OCR file processing status
	 * Values: `created`, `processing`, `processing_failed`, `processing_rejected`, `processed`
	 * Note: `null` value is returned when the file is not sent to OCR
	 */
	ocr_status: z.enum(["created", "processing", "processing_failed", "processing_rejected", "processed"]).nullable(),

	/** The file will be sent to OCR */
	send_to_ocr: z.boolean(),

	/** The date and time the file was sent to OCR */
	sent_to_ocr_at: z.string().nullable(),

	/** The date and time of last file update */
	updated_at: z.string(),
});

const CreateInboxFileSchema = z.object({
	/** File content as Base64 encoded string */
	attachment: z.string(),
	/** File name (with extension) */
	filename: z.string().optional(),

	/** The file will be sent to OCR */
	send_to_ocr: z.boolean().optional(),
});

const CreateInboxFileToolSchema = z.object({
	/** Reference ID from the /upload page */
	file_ref: z.string().optional(),
	/** URL to fetch the file from */
	source_url: z.string().optional(),
	/** Local file path (only works when server runs locally) */
	file_path: z.string().optional(),
	/** File content as Base64 encoded string (fallback - prefer file_ref or source_url to avoid context exhaustion) */
	attachment: z.string().optional(),
	/** File name (with extension) */
	filename: z.string().optional(),
	/** The file will be sent to OCR */
	send_to_ocr: z.boolean().optional(),
});

type CreateInboxFileTool = z.infer<typeof CreateInboxFileToolSchema>;

const UpdateInboxFileSchema = z.object({
	/** File name (with extension) */
	filename: z.string().optional(),

	/** The file will be sent to OCR */
	send_to_ocr: z.boolean().optional(),
});

type InboxFile = z.infer<typeof InboxFileSchema>;
type CreateInboxFile = z.infer<typeof CreateInboxFileSchema>;
type UpdateInboxFile = z.infer<typeof UpdateInboxFileSchema>;

export { InboxFileSchema, CreateInboxFileSchema, CreateInboxFileToolSchema, UpdateInboxFileSchema };
export type { InboxFile, CreateInboxFile, CreateInboxFileTool, UpdateInboxFile };
