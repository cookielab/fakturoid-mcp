import { z } from "zod/v3";

const VatRatesSummarySchema = z.object({
	/** Base total */
	base: z.string(),
	/** Currency */
	currency: z.string(),
	/** Base total in account currency */
	native_base: z.string(),
	/** Account currency */
	native_currency: z.string(),
	/** VAT total in account currency */
	native_vat: z.string(),
	/** VAT total */
	vat: z.string(),
	/** VAT rate */
	vat_rate: z.union([z.number(), z.string()]),
});

const CreateAttachmentSchema = z.object({
	/** Attachment contents in the form of a Data URI */
	data_url: z.string(),
	/** Attachment file name */
	filename: z.string().optional().default("attachment.{extension}"),
});

const CreateAttachmentToolSchema = z.object({
	/** Reference ID from the /upload page */
	file_ref: z.string().optional(),
	/** URL to fetch the file from */
	source_url: z.string().optional(),
	/** Local file path (only works when server runs locally) */
	file_path: z.string().optional(),
	/** Attachment contents in the form of a Data URI (fallback - prefer file_ref or source_url) */
	data_url: z.string().optional(),
	/** Attachment file name */
	filename: z.string().optional(),
});

type CreateAttachmentTool = z.infer<typeof CreateAttachmentToolSchema>;

const LegacyBankDetailsSchema = z.object({
	/** Bank account number */
	bank_account: z.string(),

	/** IBAN */
	iban: z.string(),

	/** BIC (for SWIFT payments) */
	swift_bic: z.string(),
});

type VatRatesSummary = z.infer<typeof VatRatesSummarySchema>;
type CreateAttachment = z.infer<typeof CreateAttachmentSchema>;
type LegacyBankDetails = z.infer<typeof LegacyBankDetailsSchema>;

export { VatRatesSummarySchema, CreateAttachmentSchema, CreateAttachmentToolSchema, LegacyBankDetailsSchema };
export type { VatRatesSummary, CreateAttachment, CreateAttachmentTool, LegacyBankDetails };
