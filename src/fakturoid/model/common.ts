import { z } from "zod/v4";

const VatRatesSummarySchema = z.object({
	/** Base total */
	base: z.string().readonly(),
	/** Currency */
	currency: z.string().readonly(),
	/** Base total in account currency */
	native_base: z.string().readonly(),
	/** Account currency */
	native_currency: z.string().readonly(),
	/** VAT total in account currency */
	native_vat: z.string().readonly(),
	/** VAT total */
	vat: z.string().readonly(),
	/** VAT rate */
	vat_rate: z.union([z.number(), z.string()]).readonly(),
});

const CreateAttachmentSchema = z.object({
	/** Attachment contents in the form of a Data URI */
	data_url: z.string(),
	/** Attachment file name */
	filename: z.string().optional().default("attachment.{extension}"),
});

const LegacyBankDetailsSchema = z.object({
	/** Bank account number */
	bank_account: z.string().readonly(),

	/** IBAN */
	iban: z.string().readonly(),

	/** BIC (for SWIFT payments) */
	swift_bic: z.string().readonly(),
});

type VatRatesSummary = z.infer<typeof VatRatesSummarySchema>;
type CreateAttachment = z.infer<typeof CreateAttachmentSchema>;
type LegacyBankDetails = z.infer<typeof LegacyBankDetailsSchema>;

export { VatRatesSummarySchema, CreateAttachmentSchema, LegacyBankDetailsSchema };
export type { VatRatesSummary, CreateAttachment, LegacyBankDetails };
