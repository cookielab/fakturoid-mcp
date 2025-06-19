import { z } from "zod/v4";

const BankAccountSchema = z.object({
	/** Date and time of bank account creation */
	created_at: z.iso.datetime().readonly(),

	/** Currency */
	currency: z.string().readonly(),

	/** Default bank account */
	default: z.boolean().readonly(),

	/** Pairing of outgoing payments */
	expense_pairing: z.boolean().readonly(),

	/** IBAN code */
	iban: z.string().nullable().readonly(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),

	/** Account name */
	name: z.string().readonly(),

	/** Account number */
	number: z.string().readonly(),

	/** Pairing of incoming payments */
	pairing: z.boolean().readonly(),

	/** Small amount settlement when matching payments */
	payment_adjustment: z.boolean().readonly(),

	/** BIC (for SWIFT payments) */
	swift_bic: z.string().nullable().readonly(),

	/** Date and time of last bank account update */
	updated_at: z.iso.datetime().readonly(),
});

type BankAccount = z.infer<typeof BankAccountSchema>;

export { BankAccountSchema };
export type { BankAccount };
