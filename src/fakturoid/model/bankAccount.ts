import { z } from "zod/v3";

const BankAccountSchema = z.object({
	/** Date and time of bank account creation */
	created_at: z.coerce.date(),

	/** Currency */
	currency: z.string(),

	/** Default bank account */
	default: z.boolean(),

	/** Pairing of outgoing payments */
	expense_pairing: z.boolean(),

	/** IBAN code */
	iban: z.string().nullable(),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),

	/** Account name */
	name: z.string(),

	/** Account number */
	number: z.string(),

	/** Pairing of incoming payments */
	pairing: z.boolean(),

	/** Small amount settlement when matching payments */
	payment_adjustment: z.boolean(),

	/** BIC (for SWIFT payments) */
	swift_bic: z.string().nullable(),

	/** Date and time of last bank account update */
	updated_at: z.coerce.date(),
});

type BankAccount = z.infer<typeof BankAccountSchema>;

export { BankAccountSchema };
export type { BankAccount };
