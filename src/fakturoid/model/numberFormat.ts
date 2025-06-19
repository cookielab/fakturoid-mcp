import { z } from "zod/v4";

const NumberFormatSchema = z.object({
	/** Date and time of number format creation */
	created_at: z.iso.datetime().readonly(),

	/** Default number format */
	default: z.boolean().readonly(),

	/** Format */
	format: z.string().readonly(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),

	/** Preview of number format */
	preview: z.string().readonly(),

	/** Date and time of last number format update */
	updated_at: z.iso.datetime().readonly(),
});

type NumberFormat = z.infer<typeof NumberFormatSchema>;

export type { NumberFormat };
export { NumberFormatSchema };
