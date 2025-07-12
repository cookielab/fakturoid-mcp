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

export { VatRatesSummarySchema, CreateAttachmentSchema, LegacyBankDetailsSchema };
export type { VatRatesSummary, CreateAttachment, LegacyBankDetails };
