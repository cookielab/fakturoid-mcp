import { z } from "zod/v4";

const SubjectSchema = z.object({
	/** Whether to update subject data from ARES. Used to override account settings.
	 *
	 * @deprecated in favor of `setting_update_from_ares`. Updating this will also update the new attribute.
	 */
	ares_update: z.boolean().default(true),

	/** Bank account number */
	bank_account: z.string().nullable(),

	/** City */
	city: z.string().nullable(),

	/** Country (ISO code) */
	country: z.string().nullable(),

	/** Date and time of subject creation */
	created_at: z.iso.datetime().readonly(),

	/** Currency (ISO code) */
	currency: z.string().nullable(),

	/** New invoice custom email text */
	custom_email_text: z.string().nullable(),

	/** Estimate custom email text */
	custom_estimate_email_text: z.string().nullable(),

	/** Identifier in your application */
	custom_id: z.string().nullable(),

	/** Delivery address city */
	delivery_city: z.string().nullable(),

	/** Delivery address country (ISO code) */
	delivery_country: z.string().nullable(),

	/** Delivery address name */
	delivery_name: z.string().nullable(),

	/** Delivery address street */
	delivery_street: z.string().nullable(),

	/** Delivery address ZIP or postal code */
	delivery_zip: z.string().nullable(),

	/** Number of days until an invoice is due for this subject */
	due: z.number().int().nullable(),

	/** Main email address receive invoice emails */
	email: z.email().nullable(),

	/** Email copy address to receive invoice emails */
	email_copy: z.email().nullable(),

	/** Contact person name */
	full_name: z.string().nullable(),

	/** Enable delivery address. To be able to set delivery address in the attributes below this must be set to `true`. Upon setting this to `false`, the delivery address below is cleared. */
	has_delivery_address: z.boolean().default(false),

	/** Subject HTML web address */
	html_url: z.url().readonly(),

	/** IBAN */
	iban: z.string().nullable(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),

	/** Proforma paid custom email text */
	invoice_from_proforma_email_text: z.string().nullable(),

	/** Invoice language */
	language: z.string().nullable(),

	/** A three-digit number (as a string). Describes whether subject is a physical/natural person or a company of some sort. For list of codes see a CSV file on the official Legal form page (corresponds to `chodnota` field). */
	legal_form: z.string().nullable(),

	/** SK DIČ (only in Slovakia, does not start with country code) */
	local_vat_no: z.string().nullable(),

	/** Name of the subject */
	name: z.string(),

	/** Overdue reminder custom email text */
	overdue_email_text: z.string().nullable(),

	/** Phone number */
	phone: z.string().nullable(),

	/** Private note */
	private_note: z.string().nullable(),

	/** Registration number (IČO) */
	registration_no: z.string().nullable(),

	/** Whether to attach estimate PDF in email. Used to override account settings */
	setting_estimate_pdf_attachments: z.enum(["inherit", "on", "off"]).default("inherit"),

	/** Whether to attach invoice PDF in email. Used to override account settings */
	setting_invoice_pdf_attachments: z.enum(["inherit", "on", "off"]).default("inherit"),

	/** Whether to send overdue invoice email reminders. Used to override account settings */
	setting_invoice_send_reminders: z.enum(["inherit", "on", "off"]).default("inherit"),

	/** Whether to update subject data from ARES. Used to override account settings. Updating this will also update the deprecated `ares_update` attribute. If both this and the deprecated attribute are present, the new one takes precedence. */
	setting_update_from_ares: z.enum(["inherit", "on", "off"]).default("inherit"),

	/** Street */
	street: z.string().nullable(),

	/** Suggest for documents */
	suggestion_enabled: z.boolean().default(true),

	/** SWIFT/BIC */
	swift_bic: z.string().nullable(),

	/** Thanks for payment custom email text */
	thank_you_email_text: z.string().nullable(),

	/** Type of subject */
	type: z.enum(["customer", "supplier", "both"]).default("customer"),

	/** Unreliable VAT-payer */
	unreliable: z.boolean().nullable().readonly(),

	/** Date of last check for unreliable VAT-payer */
	unreliable_checked_at: z.iso.datetime().nullable().readonly(),

	/** Date and time of last subject update */
	updated_at: z.iso.datetime().readonly(),

	/** Subject API address */
	url: z.url().readonly(),

	/** User ID who created the subject */
	user_id: z.number().int().nullable().readonly(),

	/** Fixed variable symbol (used for all invoices for this client instead of invoice number) */
	variable_symbol: z.string().nullable(),

	/** VAT mode */
	vat_mode: z.string().nullable(),

	/** VAT-payer VAT number (DIČ, IČ DPH in Slovakia, typically starts with the country code) */
	vat_no: z.string().nullable(),

	/** Web page */
	web: z.string().nullable(),

	/** Web Invoice history */
	webinvoice_history: z.enum(["disabled", "recent", "client_portal"]).nullable().default(null),

	/** ZIP or postal code */
	zip: z.string().nullable(),
});

const SubjectCreateSchema = SubjectSchema.pick({
	ares_update: true,
	bank_account: true,
	city: true,
	country: true,
	currency: true,
	custom_email_text: true,
	custom_estimate_email_text: true,
	custom_id: true,
	delivery_city: true,
	delivery_country: true,
	delivery_name: true,
	delivery_street: true,
	delivery_zip: true,
	due: true,
	email: true,
	email_copy: true,
	full_name: true,
	has_delivery_address: true,
	iban: true,
	invoice_from_proforma_email_text: true,
	language: true,
	legal_form: true,
	local_vat_no: true,
	name: true,
	overdue_email_text: true,
	phone: true,
	private_note: true,
	registration_no: true,
	setting_estimate_pdf_attachments: true,
	setting_invoice_pdf_attachments: true,
	setting_invoice_send_reminders: true,
	setting_update_from_ares: true,
	street: true,
	suggestion_enabled: true,
	swift_bic: true,
	thank_you_email_text: true,
	type: true,
	variable_symbol: true,
	vat_mode: true,
	vat_no: true,
	web: true,
	webinvoice_history: true,
	zip: true,
})
	.required({
		name: true,
	})
	.partial({
		ares_update: true,
		bank_account: true,
		city: true,
		country: true,
		currency: true,
		custom_email_text: true,
		custom_estimate_email_text: true,
		custom_id: true,
		delivery_city: true,
		delivery_country: true,
		delivery_name: true,
		delivery_street: true,
		delivery_zip: true,
		due: true,
		email: true,
		email_copy: true,
		full_name: true,
		has_delivery_address: true,
		iban: true,
		invoice_from_proforma_email_text: true,
		language: true,
		legal_form: true,
		local_vat_no: true,
		overdue_email_text: true,
		phone: true,
		private_note: true,
		registration_no: true,
		setting_estimate_pdf_attachments: true,
		setting_invoice_pdf_attachments: true,
		setting_invoice_send_reminders: true,
		setting_update_from_ares: true,
		street: true,
		suggestion_enabled: true,
		swift_bic: true,
		thank_you_email_text: true,
		type: true,
		variable_symbol: true,
		vat_mode: true,
		vat_no: true,
		web: true,
		webinvoice_history: true,
		zip: true,
	});

const SubjectUpdateSchema = SubjectSchema.pick({
	ares_update: true,
	bank_account: true,
	city: true,
	country: true,
	currency: true,
	custom_email_text: true,
	custom_estimate_email_text: true,
	custom_id: true,
	delivery_city: true,
	delivery_country: true,
	delivery_name: true,
	delivery_street: true,
	delivery_zip: true,
	due: true,
	email: true,
	email_copy: true,
	full_name: true,
	has_delivery_address: true,
	iban: true,
	invoice_from_proforma_email_text: true,
	language: true,
	legal_form: true,
	local_vat_no: true,
	name: true,
	overdue_email_text: true,
	phone: true,
	private_note: true,
	registration_no: true,
	setting_estimate_pdf_attachments: true,
	setting_invoice_pdf_attachments: true,
	setting_invoice_send_reminders: true,
	setting_update_from_ares: true,
	street: true,
	suggestion_enabled: true,
	swift_bic: true,
	thank_you_email_text: true,
	type: true,
	variable_symbol: true,
	vat_mode: true,
	vat_no: true,
	web: true,
	webinvoice_history: true,
	zip: true,
}).partial();

const GetSubjectsFiltersSchema = SubjectSchema.pick({
	custom_id: true,
})
	.extend({
		page_count: z.number().positive(),
		since: z.string(),
		updated_since: z.string(),
	})
	.partial();

type Subject = z.infer<typeof SubjectSchema>;
type SubjectCreate = z.infer<typeof SubjectCreateSchema>;
type SubjectUpdate = z.infer<typeof SubjectUpdateSchema>;
type GetSubjectsFilters = z.infer<typeof GetSubjectsFiltersSchema>;

export { SubjectSchema, SubjectCreateSchema, SubjectUpdateSchema, GetSubjectsFiltersSchema };
export type { Subject, SubjectCreate, SubjectUpdate, GetSubjectsFilters };
