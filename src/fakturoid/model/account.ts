import { z } from "zod/v4";

const AccountSchema = z.object({
	city: z.string().readonly(),

	/** Country (ISO Code) */
	country: z.string().readonly(),

	/** Account creation date */
	created_at: z.string().readonly(),

	/** Default currency (ISO Code) */
	currency: z.string().readonly(),

	/** Default estimate in English. When value is null, then 'estimate' is used */
	default_estimate_type: z.enum(["estimate", "quote"]).nullable().readonly(),

	/** Digitoo service auto processing enabled */
	digitoo_auto_processing_enabled: z.boolean().readonly(),

	/** Digitoo service enabled? */
	digitoo_enabled: z.boolean().readonly(),

	/** Number of remaining extractions by Digitoo service */
	digitoo_extractions_remaining: z.number().int().readonly(),

	/** Invoice footer */
	displayed_note: z.string().readonly(),

	/** Default number of days until an invoice becomes overdue */
	due: z.number().int().readonly(),

	/** Fixed exchange rate */
	fixed_exchange_rate: z.boolean().readonly(),

	/** Name of the account holder */
	full_name: z.string().nullable().readonly(),

	/** Email for sending invoices */
	invoice_email: z.string().readonly(),

	/** GoPay enabled for all invoices? */
	invoice_gopay: z.boolean().readonly(),

	/** Hide bank account for payments */
	invoice_hide_bank_account_for_payments: z
		.array(z.enum(["card", "cash", "cod", "paypal"]))
		.nullable()
		.readonly(),

	/** Default invoice language */
	invoice_language: z.enum(["cz", "sk", "en", "de", "fr", "it", "es", "ru", "pl", "hu", "ro"]).readonly(),

	/** Text before lines */
	invoice_note: z.string().readonly(),

	/** Default payment method. When value is null, then 'bank' method is used */
	invoice_payment_method: z.enum(["bank", "card", "cash", "cod", "paypal"]).nullable().readonly(),

	/** PayPal enabled for all invoices? */
	invoice_paypal: z.boolean().readonly(),

	/** Issue proforma by default */
	invoice_proforma: z.boolean().readonly(),

	/** Selfbilling enabled? */
	invoice_selfbilling: z.boolean().readonly(),

	/** Tax identification number for SK subject */
	local_vat_no: z.string().nullable().readonly(),

	/** The name of the company */
	name: z.string().readonly(),

	/** Days after the due date to send a automatic overdue reminder? */
	overdue_email_days: z.number().int().readonly(),

	/** Phone number */
	phone: z.string().nullable().readonly(),

	/** Subscription plan */
	plan: z.string().readonly(),

	/** Number of paid users */
	plan_paid_users: z.number().int().readonly(),

	/** Price of subscription plan */
	plan_price: z.number().int().readonly(),

	/** Registration number */
	registration_no: z.string().readonly(),

	/** Send email automatically when proforma is paid? */
	send_invoice_from_proforma_email: z.boolean().readonly(),

	/** Send overdue reminders automatically? */
	send_overdue_email: z.boolean().readonly(),

	/** Send automatic overdue reminders repeatedly? */
	send_repeated_reminders: z.boolean().readonly(),

	/** Send a thank you email when invoices is paid automatically? */
	send_thank_you_email: z.boolean().readonly(),

	street: z.string().readonly(),
	/** Name of the account */
	subdomain: z.string().readonly(),

	/** Default measurement unit */
	unit_name: z.string().readonly(),

	/** The date the account was last modified */
	updated_at: z.string().readonly(),

	/** VAT mode */
	vat_mode: z.enum(["vat_payer", "non_vat_payer", "identified_person"]).readonly(),

	/** Tax identification number */
	vat_no: z.string().readonly(),

	/** VAT calculation mode */
	vat_price_mode: z.enum(["with_vat", "without_vat", "numerical_with_vat", "from_total_with_vat"]).readonly(),

	/** Default VAT rate */
	vat_rate: z.number().int().readonly(),

	/** Account owner's website */
	web: z.string().nullable().readonly(),

	/** Postal code */
	zip: z.string().readonly(),
});

type Account = z.infer<typeof AccountSchema>;

export type { Account };
export { AccountSchema };
