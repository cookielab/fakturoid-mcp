import { z } from "zod/v3";

const ExpensePaymentSchema = z.object({
	/** Paid amount in document currency */
	amount: z.string(),

	/** Bank account ID */
	bank_account_id: z.number().int(),

	/** The date and time of payment creation */
	created_at: z.coerce.date(),

	/** Currency ISO Code (same as expense currency) */
	currency: z.string(),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),

	/** Mark document as paid? */
	mark_document_as_paid: z.boolean(),

	/** Paid amount in account currency */
	native_amount: z.string(),

	/** Payment date */
	paid_on: z.coerce.date(),

	/** The date and time of last payment update */
	updated_at: z.coerce.date(),

	/** Payment variable symbol */
	variable_symbol: z.string(),
});

const CreateExpensePaymentSchema = ExpensePaymentSchema.pick({
	amount: true,
	bank_account_id: true,
	mark_document_as_paid: true,
	native_amount: true,
	paid_on: true,
	variable_symbol: true,
}).partial();

type ExpensePayment = z.infer<typeof ExpensePaymentSchema>;
type CreateExpensePayment = z.infer<typeof CreateExpensePaymentSchema>;

export { ExpensePaymentSchema, CreateExpensePaymentSchema };
export type { ExpensePayment, CreateExpensePayment };
