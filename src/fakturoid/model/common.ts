import { z } from "zod/v3";
import type { ServerContext } from "../../server.js";

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

/**
 * Create attachment schema with strategies based on server context
 */
const createAttachmentSchema = (context: ServerContext) => {
	const strategies: z.ZodTypeAny[] = [
		// Strategy 1: Raw data_url (always available)
		z.object({
			/** Attachment contents in the form of a Data URI (e.g., "data:application/pdf;base64,xxx") */
			data_url: z.string(),
			/** Attachment file name */
			filename: z.string().optional(),
		}),

		// Strategy 3: Inbox file reference (always available)
		z.object({
			/** ID of an existing file in Fakturoid inbox */
			inbox_file_id: z.number(),
		}),
	];

	// Strategy 2: File path (only in stdio mode)
	if (context.capabilities.fileSystemAccess) {
		strategies.push(
			z.object({
				/** Local file system path (only available in stdio mode) */
				file_path: z.string(),
				/** Optional filename override */
				filename: z.string().optional(),
			}),
		);
	}

	// Strategy 4: URL download (only if enabled)
	if (context.uploadConfig.allowUrlDownloads) {
		strategies.push(
			z.object({
				/**
				 * URL to download the file from (must be publicly accessible, no authentication supported).
				 *
				 * IMPORTANT: Google Drive sharing URLs (https://drive.google.com/file/d/FILE_ID/...) are NOT supported.
				 * Convert them to direct download format first: https://drive.google.com/uc?export=download&id=FILE_ID
				 */
				url: z.string().url(),
				/** Optional filename override */
				filename: z.string().optional(),
			}),
		);
	}

	return z.union(strategies as [z.ZodTypeAny, z.ZodTypeAny, ...z.ZodTypeAny[]]);
};

const LegacyBankDetailsSchema = z.object({
	/** Bank account number */
	bank_account: z.string(),

	/** IBAN */
	iban: z.string(),

	/** BIC (for SWIFT payments) */
	swift_bic: z.string(),
});

type VatRatesSummary = z.infer<typeof VatRatesSummarySchema>;
type LegacyBankDetails = z.infer<typeof LegacyBankDetailsSchema>;

export { VatRatesSummarySchema, createAttachmentSchema, LegacyBankDetailsSchema };
export type { VatRatesSummary, LegacyBankDetails };
