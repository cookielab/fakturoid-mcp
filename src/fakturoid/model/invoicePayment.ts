import { z } from "zod/v3";

const InvoicePaymentSchema = z.object({
	/**
	 * Paid amount in document currency
	 * @default Remaining amount to pay
	 */
	amount: z.string(),
	/**
	 * Bank account ID
	 * @default Invoice bank account or default bank account
	 */
	bank_account_id: z.number().int(),
	/** The date and time of payment creation */
	created_at: z.string(),
	/** Currency ISO Code (same as invoice currency) */
	currency: z.string(),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),
	/**
	 * Mark document as paid?
	 * @default true if the total paid amount becomes greater or equal to remaining amount to pay
	 */
	mark_document_as_paid: z.boolean(),
	/**
	 * Paid amount in account currency
	 * @default Remaining amount to pay converted to account currency
	 */
	native_amount: z.string(),
	/**
	 * Payment date
	 * @default Today
	 */
	paid_on: z.string(),
	/**
	 * Issue a followup document with payment
	 * Only for proformas and `mark_document_as_paid` must be `true`.
	 * Values: `final_invoice_paid` (Invoice paid), `final_invoice` (Invoice with edit), `tax_document` (Document to payment), `none` (None)
	 */
	proforma_followup_document: z.enum(["final_invoice_paid", "final_invoice", "tax_document", "none"]),
	/**
	 * Send thank-you email?
	 * `mark_document_as_paid` must be `true`
	 * @default Inherit from account settings
	 */
	send_thank_you_email: z.boolean(),
	/** Tax document ID (if present) */
	tax_document_id: z.number().int().nullable(),
	/** The date and time of last payment update */
	updated_at: z.string(),
	/**
	 * Payment variable symbol
	 * @default Invoice variable symbol
	 */
	variable_symbol: z.string(),
});

const CreateInvoicePaymentSchema = InvoicePaymentSchema.pick({
	amount: true,
	bank_account_id: true,
	mark_document_as_paid: true,
	native_amount: true,
	paid_on: true,
	proforma_followup_document: true,
	send_thank_you_email: true,
	variable_symbol: true,
}).partial();

const UpdateInvoicePaymentSchema = InvoicePaymentSchema.pick({
	amount: true,
	bank_account_id: true,
	mark_document_as_paid: true,
	native_amount: true,
	paid_on: true,
	proforma_followup_document: true,
	send_thank_you_email: true,
	variable_symbol: true,
}).partial();

type InvoicePayment = z.infer<typeof InvoicePaymentSchema>;
type CreateInvoicePayment = z.infer<typeof CreateInvoicePaymentSchema>;
type UpdateInvoicePayment = z.infer<typeof UpdateInvoicePaymentSchema>;

export { InvoicePaymentSchema, CreateInvoicePaymentSchema, UpdateInvoicePaymentSchema };
export type { InvoicePayment, CreateInvoicePayment, UpdateInvoicePayment };
