import { z } from "zod/v3";

const ACCOUNT_ESTIMATE = ["estimate", "quote"] as const;
const ACCOUNT_INVOICE_LANGUAGE = ["cz", "sk", "en", "de", "fr", "it", "es", "ru", "pl", "hu", "ro"] as const;
const ACCOUNT_PAYMENT_METHOD = ["bank", "card", "cash", "cod", "paypal"] as const;
const ACCOUNT_VAT_MODE = ["vat_payer", "non_vat_payer", "identified_person"] as const;
const ACCOUNT_VAT_PRICE_MODE = ["with_vat", "without_vat", "numerical_with_vat", "from_total_with_vat"] as const;

const AccountSchema = z.object({
	city: z.string(),

	/** Country (ISO Code) */
	country: z.string(),

	/** Account creation date */
	created_at: z.string(),

	/** Default currency (ISO Code) */
	currency: z.string(),

	/** Default estimate in English. When value is null, then 'estimate' is used */
	default_estimate_type: z.enum(ACCOUNT_ESTIMATE).nullable(),

	/** Digitoo service auto processing enabled */
	digitoo_auto_processing_enabled: z.boolean(),

	/** Digitoo service enabled? */
	digitoo_enabled: z.boolean(),

	/** Number of remaining extractions by Digitoo service */
	digitoo_extractions_remaining: z.number().int(),

	/** Invoice footer */
	displayed_note: z.string(),

	/** Default number of days until an invoice becomes overdue */
	due: z.number().int(),

	/** Fixed exchange rate */
	fixed_exchange_rate: z.boolean(),

	/** Name of the account holder */
	full_name: z.string().nullable(),

	/** Email for sending invoices */
	invoice_email: z.string(),

	/** GoPay enabled for all invoices? */
	invoice_gopay: z.boolean(),

	/** Hide bank account for payments */
	invoice_hide_bank_account_for_payments: z.array(z.enum(["card", "cash", "cod", "paypal"])).nullable(),

	/** Default invoice language */
	invoice_language: z.enum(ACCOUNT_INVOICE_LANGUAGE),

	/** Text before lines */
	invoice_note: z.string(),

	/** Default payment method. When value is null, then 'bank' method is used */
	invoice_payment_method: z.enum(ACCOUNT_PAYMENT_METHOD).nullable(),

	/** PayPal enabled for all invoices? */
	invoice_paypal: z.boolean(),

	/** Issue proforma by default */
	invoice_proforma: z.boolean(),

	/** Selfbilling enabled? */
	invoice_selfbilling: z.boolean(),

	/** Tax identification number for SK subject */
	local_vat_no: z.string().nullable(),

	/** The name of the company */
	name: z.string(),

	/** Days after the due date to send a automatic overdue reminder? */
	overdue_email_days: z.number().int(),

	/** Phone number */
	phone: z.string().nullable(),

	/** Subscription plan */
	plan: z.string(),

	/** Number of paid users */
	plan_paid_users: z.number().int(),

	/** Price of subscription plan */
	plan_price: z.number().int(),

	/** Registration number */
	registration_no: z.string(),

	/** Send email automatically when proforma is paid? */
	send_invoice_from_proforma_email: z.boolean(),

	/** Send overdue reminders automatically? */
	send_overdue_email: z.boolean(),

	/** Send automatic overdue reminders repeatedly? */
	send_repeated_reminders: z.boolean(),

	/** Send a thank you email when invoices is paid automatically? */
	send_thank_you_email: z.boolean(),

	street: z.string(),
	/** Name of the account */
	subdomain: z.string(),

	/** Default measurement unit */
	unit_name: z.string(),

	/** The date the account was last modified */
	updated_at: z.string(),

	/** VAT mode */
	vat_mode: z.enum(ACCOUNT_VAT_MODE),

	/** Tax identification number */
	vat_no: z.string(),

	/** VAT calculation mode */
	vat_price_mode: z.enum(ACCOUNT_VAT_PRICE_MODE),

	/** Default VAT rate */
	vat_rate: z.number().int(),

	/** Account owner's website */
	web: z.string().nullable(),

	/** Postal code */
	zip: z.string(),
});

type Account = z.infer<typeof AccountSchema>;

export type { Account };
export {
	AccountSchema,
	ACCOUNT_ESTIMATE,
	ACCOUNT_INVOICE_LANGUAGE,
	ACCOUNT_PAYMENT_METHOD,
	ACCOUNT_VAT_MODE,
	ACCOUNT_VAT_PRICE_MODE,
};
