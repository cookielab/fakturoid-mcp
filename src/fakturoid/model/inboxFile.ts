import { z } from "zod/v4";

const InboxFileSchema = z.object({
	/** File size in bytes */
	bytesize: z.number().int().readonly(),

	/** The date and time of file creation */
	created_at: z.string().readonly(),

	/** URL to download the file */
	download_url: z.string().readonly(),

	/** File name (with extension) */
	filename: z.string(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),

	/** The date and time the OCR file was completed */
	ocr_completed_at: z.string().nullable().readonly(),

	/**
	 * OCR file processing status
	 * Values: `created`, `processing`, `processing_failed`, `processing_rejected`, `processed`
	 * Note: `null` value is returned when the file is not sent to OCR
	 */
	ocr_status: z
		.enum(["created", "processing", "processing_failed", "processing_rejected", "processed"])
		.nullable()
		.readonly(),

	/** The file will be sent to OCR */
	send_to_ocr: z.boolean(),

	/** The date and time the file was sent to OCR */
	sent_to_ocr_at: z.string().nullable().readonly(),

	/** The date and time of last file update */
	updated_at: z.string().readonly(),
});

const CreateInboxFileSchema = z.object({
	/** File content as Base64 encoded string */
	attachment: z.string(),
	/** File name (with extension) */
	filename: z.string().optional(),

	/** The file will be sent to OCR */
	send_to_ocr: z.boolean().optional(),
});

const UpdateInboxFileSchema = z.object({
	/** File name (with extension) */
	filename: z.string().optional(),

	/** The file will be sent to OCR */
	send_to_ocr: z.boolean().optional(),
});

type InboxFile = z.infer<typeof InboxFileSchema>;
type CreateInboxFile = z.infer<typeof CreateInboxFileSchema>;
type UpdateInboxFile = z.infer<typeof UpdateInboxFileSchema>;

export { InboxFileSchema, CreateInboxFileSchema, UpdateInboxFileSchema };
export type { InboxFile, CreateInboxFile, UpdateInboxFile };
