import { z } from "zod/v3";

const NumberFormatSchema = z.object({
	/** Date and time of number format creation */
	created_at: z.coerce.date(),

	/** Default number format */
	default: z.boolean(),

	/** Format */
	format: z.string(),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),

	/** Preview of number format */
	preview: z.string(),

	/** Date and time of last number format update */
	updated_at: z.coerce.date(),
});

type NumberFormat = z.infer<typeof NumberFormatSchema>;

export type { NumberFormat };
export { NumberFormatSchema };
