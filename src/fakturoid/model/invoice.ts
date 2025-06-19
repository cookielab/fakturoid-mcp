import { z } from "zod/v4";
import { CreateAttachmentSchema, VatRatesSummarySchema } from "./common.ts";

const DocumentTypeEnum = z.enum([
	"partial_proforma",
	"proforma",
	"correction",
	"tax_document",
	"final_invoice",
	"invoice",
]);

const ProformaFollowupDocumentEnum = z.enum(["final_invoice_paid", "final_invoice", "tax_document", "none"]);

const StatusEnum = z.enum(["open", "sent", "overdue", "paid", "cancelled", "uncollectible"]);

const IbanVisibilityEnum = z.enum(["automatically", "always"]);

const PaymentMethodEnum = z.enum(["bank", "cash", "cod", "card", "paypal", "custom"]);

const LanguageEnum = z.enum(["cz", "sk", "en", "de", "fr", "it", "es", "ru", "pl", "hu", "ro"]);

const OssEnum = z.enum(["disabled", "service", "goods"]);

const VatPriceModeEnum = z.enum(["without_vat", "from_total_with_vat"]);

// EET Record schema (readonly)
const EetRecordSchema = z.object({
	attempts: z.number(),
	bkp: z.string(),
	cash_register: z.string(),
	created_at: z.string(),
	external: z.boolean(),
	fik: z.string(),
	fik_received_at: z.string(),
	id: z.number(),
	invoice_id: z.number(),
	last_attempt_at: z.string(),
	last_uuid: z.string(),
	number: z.string(),
	paid_at: z.string(),
	pkp: z.string(),
	playground: z.boolean(),
	status: z.string(),
	store: z.string(),
	total: z.string(),
	updated_at: z.string(),
	vat_base0: z.string(),
	vat_base1: z.string(),
	vat_base2: z.string(),
	vat_base3: z.string(),
	vat_no: z.string(),
	vat1: z.string(),
	vat2: z.string(),
	vat3: z.string(),
});

const PaidAdvanceSchema = z.object({
	id: z.number().readonly(),
	number: z.string().readonly(),
	paid_on: z.string().readonly(),
	price: z.string().readonly(),
	variable_symbol: z.string().readonly(),
	vat: z.string().readonly(),
	vat_rate: z.union([z.number(), z.string()]).readonly(),
});

const PaymentSchema = z.object({
	amount: z.string().readonly(),
	currency: z.string().readonly(),
	id: z.number().readonly(),
	native_amount: z.string().readonly(),
	native_currency: z.string().readonly(),
	paid_on: z.string().readonly(),
});

const InventorySchema = z.object({
	article_number: z.string().nullable().readonly(),
	article_number_type: z.enum(["ian", "ean", "isbn"]).nullable().readonly(),
	item_id: z.number().readonly(),
	move_id: z.number().readonly(),
	sku: z.string().readonly(),
});

const AttachmentSchema = z.object({
	content_type: z.string().readonly(),
	download_url: z.string().readonly(),
	filename: z.string().readonly(),
	id: z.number().readonly(),
});

const LineSchema = z.object({
	/** Unique identifier in Fakturoid */
	id: z.number().readonly(),
	/** Inventory information */
	inventory: InventorySchema.nullable().readonly(),
	/** Line name */
	name: z.string(),
	/** Total price without VAT in account currency */
	native_total_price_without_vat: z.string().readonly(),
	/** Total VAT in account currency */
	native_total_vat: z.string().readonly(),
	/** Quantity */
	quantity: z.string().default("1"),
	/** Total price without VAT */
	total_price_without_vat: z.string().readonly(),
	/** Total VAT */
	total_vat: z.string().readonly(),
	/** Unit name */
	unit_name: z.string().optional(),
	/** Unit price */
	unit_price: z.string(),
	/** Unit price including VAT */
	unit_price_with_vat: z.string().readonly(),
	/** Unit price without VAT */
	unit_price_without_vat: z.string().readonly(),
	/** VAT Rate */
	vat_rate: z.union([z.number(), z.string()]).default(0),
});

const CreateLineSchema = LineSchema.omit({
	id: true,
	inventory: true,
	native_total_price_without_vat: true,
	native_total_vat: true,
	total_price_without_vat: true,
	total_vat: true,
	unit_price_with_vat: true,
	unit_price_without_vat: true,
}).extend({
	/** ID of the related inventory item, use this to set an ID during document creation */
	inventory_item_id: z.number().optional(),
	/** Stock Keeping Unit (SKU), use this to load data from an inventory item with matching SKU code */
	sku: z.string().optional(),
});

const UpdateLineSchema = LineSchema.omit({
	id: true,
	inventory: true,
	native_total_price_without_vat: true,
	native_total_vat: true,
	total_price_without_vat: true,
	total_vat: true,
	unit_price_with_vat: true,
	unit_price_without_vat: true,
})
	.extend({
		/** Mark line for deletion */
		_destroy: z.boolean().optional(),
		/** Existing line ID for update */
		id: z.number().optional(),
	})
	.partial();

const InvoiceSchema = z.object({
	/** List of attachments */
	attachments: z.array(AttachmentSchema).nullable().optional(),
	/** Bank account number */
	bank_account: z.string().optional(),
	/** Bank account ID (used only on create action) */
	bank_account_id: z.number().optional(),
	/** Date and time when the invoice was cancelled */
	cancelled_at: z.string().nullable().readonly(),
	/** Subject address city */
	client_city: z.string().optional(),
	/** Subject address country (ISO code) */
	client_country: z.string().optional(),
	/** Subject delivery address city */
	client_delivery_city: z.string().nullable().optional(),
	/** Subject delivery address country (ISO code) */
	client_delivery_country: z.string().nullable().optional(),
	/** Subject company delivery name */
	client_delivery_name: z.string().nullable().optional(),
	/** Subject delivery address street */
	client_delivery_street: z.string().nullable().optional(),
	/** Subject delivery address postal code */
	client_delivery_zip: z.string().nullable().optional(),
	/** Enable delivery address */
	client_has_delivery_address: z.boolean().optional(),
	/** Subject SK DIČ (only for Slovakia, does not start with country code) */
	client_local_vat_no: z.string().nullable().optional(),
	/** Subject company name */
	client_name: z.string().optional(),
	/** Subject registration number */
	client_registration_no: z.string().optional(),
	/** Subject address street */
	client_street: z.string().optional(),
	/** Subject VAT number */
	client_vat_no: z.string().optional(),
	/** Subject address postal code */
	client_zip: z.string().optional(),
	/** ID of the invoice being corrected */
	correction_id: z.number().nullable().optional(),
	/** Date and time of document creation */
	created_at: z.string().readonly(),
	/** Currency ISO code */
	currency: z.string().optional(),
	/** Identifier in your application */
	custom_id: z.string().nullable().optional(),
	/** Custom payment method */
	custom_payment_method: z.string().nullable().optional(),
	/** Type of document */
	document_type: DocumentTypeEnum.optional(),
	/** Number of days until the invoice becomes overdue */
	due: z.number().optional(),
	/** Date when the invoice becomes overdue */
	due_on: z.string().readonly(),
	/** EET records */
	eet_records: z.array(EetRecordSchema).readonly(),
	/** Exchange rate (required if document currency differs from account currency) */
	exchange_rate: z.string().optional(),
	/** Invoice footer */
	footer_note: z.string().optional(),
	/** Generator ID from which the document was generated */
	generator_id: z.number().nullable().readonly(),
	/** Enable GoPay payment button on invoice */
	gopay: z.boolean().default(false).optional(),
	/** Hide bank account on webinvoice and PDF */
	hide_bank_account: z.boolean().nullable().optional(),
	/** Document HTML web address */
	html_url: z.string().readonly(),
	/** IBAN */
	iban: z.string().nullable().optional(),
	/** Controls IBAN visibility on the document */
	iban_visibility: IbanVisibilityEnum.default("automatically").optional(),
	/** Unique identifier in Fakturoid */
	id: z.number().readonly(),
	/** Date of issue */
	issued_on: z.string().optional(),
	/** Language of the document */
	language: LanguageEnum.optional(),
	/** List of lines to invoice */
	lines: z.array(LineSchema).optional(),
	/** Date and time when the document was locked */
	locked_at: z.string().nullable().readonly(),
	/** Total without VAT in the account currency */
	native_subtotal: z.string().readonly(),
	/** Total with VAT in the account currency */
	native_total: z.string().readonly(),
	/** Text before lines */
	note: z.string().optional(),
	/** Document number */
	number: z.string().optional(),
	/** ID of a number format, can only be specified on create */
	number_format_id: z.number().optional(),
	/** Order number in your application */
	order_number: z.string().nullable().optional(),
	/** Use OSS mode */
	oss: OssEnum.default("disabled").optional(),
	/** List of paid advances (if final invoice) */
	paid_advances: z.array(PaidAdvanceSchema).readonly(),
	/** Date when the document was marked as paid */
	paid_on: z.string().nullable().readonly(),
	/** Payment method */
	payment_method: PaymentMethodEnum.optional(),
	/** List of payments */
	payments: z.array(PaymentSchema).readonly(),
	/** Enable PayPal payment button on invoice */
	paypal: z.boolean().default(false).optional(),
	/** PDF download address */
	pdf_url: z.string().readonly(),
	/** Private note */
	private_note: z.string().nullable().optional(),
	/** What to issue after a proforma is paid */
	proforma_followup_document: ProformaFollowupDocumentEnum.nullable().optional(),
	/** Webinvoice web address */
	public_html_url: z.string().readonly(),
	/** Related document ID */
	related_id: z.number().nullable().optional(),
	/** Remaining invoice amount (after deducting proformas and/or tax documents, VAT included) */
	remaining_amount: z.string().readonly(),
	/** Remaining invoice amount in the account currency */
	remaining_native_amount: z.string().readonly(),
	/** Date and time of sending a reminder */
	reminder_sent_at: z.string().nullable().readonly(),
	/** Date and time of sending the document via email */
	sent_at: z.string().nullable().readonly(),
	/** Show „Do not pay, …" on document webinvoice and PDF */
	show_already_paid_note_in_pdf: z.boolean().default(false).optional(),
	/** Current state of the document */
	status: StatusEnum.readonly(),
	/** Subject identifier in your application */
	subject_custom_id: z.string().nullable().optional(),
	/** Subject ID */
	subject_id: z.number(),
	/** Subject API address */
	subject_url: z.string().readonly(),
	/** Total without VAT */
	subtotal: z.string().readonly(),
	/** Supply code for statement about invoices in reverse charge */
	supply_code: z.string().nullable().optional(),
	/** BIC (for SWIFT payments) */
	swift_bic: z.string().nullable().optional(),
	/** List of tags */
	tags: z.array(z.string()).optional(),
	/** Required only when creating a final invoice from tax documents */
	tax_document_ids: z.array(z.number()).optional(),
	/** Chargeable event date */
	taxable_fulfillment_due: z.string().optional(),
	/** Token string for the webinvoice URL */
	token: z.string().readonly(),
	/** Total with VAT */
	total: z.string().readonly(),
	/** Use reverse charge */
	transferred_tax_liability: z.boolean().default(false).optional(),
	/** Date and time when an invoice was marked as uncollectible */
	uncollectible_at: z.string().nullable().readonly(),
	/** Date and time of last document update */
	updated_at: z.string().readonly(),
	/** Document API address */
	url: z.string().readonly(),
	/** Variable symbol */
	variable_symbol: z.string().optional(),
	/** Calculate VAT from base or final amount */
	vat_price_mode: VatPriceModeEnum.nullable().optional(),
	/** VAT rates summary */
	vat_rates_summary: z.array(VatRatesSummarySchema).readonly(),
	/** Date when the client visited the webinvoice */
	webinvoice_seen_on: z.string().nullable().readonly(),
	/** Your address city */
	your_city: z.string().readonly(),
	/** Your address country (ISO code) */
	your_country: z.string().readonly(),
	/** Your SK DIČ (only for Slovakia, does not start with country code) */
	your_local_vat_no: z.string().nullable().readonly(),
	/** Name of your company */
	your_name: z.string().readonly(),
	/** Your registration number (IČO) */
	your_registration_no: z.string().readonly(),
	/** Your address street */
	your_street: z.string().readonly(),
	/** Your VAT number (DIČ) */
	your_vat_no: z.string().readonly(),
	/** Your address postal code */
	your_zip: z.string().readonly(),
});

const CreateInvoiceSchema = InvoiceSchema.omit({
	attachments: true,
	cancelled_at: true,
	created_at: true,
	due_on: true,
	eet_records: true,
	generator_id: true,
	html_url: true,
	id: true,
	lines: true,
	locked_at: true,
	native_subtotal: true,
	native_total: true,
	paid_advances: true,
	paid_on: true,
	payments: true,
	pdf_url: true,
	public_html_url: true,
	remaining_amount: true,
	remaining_native_amount: true,
	reminder_sent_at: true,
	sent_at: true,
	status: true,
	subject_url: true,
	subtotal: true,
	token: true,
	total: true,
	uncollectible_at: true,
	updated_at: true,
	url: true,
	vat_rates_summary: true,
	webinvoice_seen_on: true,
	your_city: true,
	your_country: true,
	your_local_vat_no: true,
	your_name: true,
	your_registration_no: true,
	your_street: true,
	your_vat_no: true,
	your_zip: true,
})
	.extend({
		/** List of attachments */
		attachments: z.array(CreateAttachmentSchema).optional(),
		/** List of lines to invoice */
		lines: z.array(CreateLineSchema).optional(),
		/** Round total amount (VAT included) */
		round_total: z.boolean().default(false).optional(),
	})
	.partial({
		attachments: true,
		bank_account: true,
		bank_account_id: true,
		client_city: true,
		client_country: true,
		client_delivery_city: true,
		client_delivery_country: true,
		client_delivery_name: true,
		client_delivery_street: true,
		client_delivery_zip: true,
		client_has_delivery_address: true,
		client_local_vat_no: true,
		client_name: true,
		client_registration_no: true,
		client_street: true,
		client_vat_no: true,
		client_zip: true,
		correction_id: true,
		currency: true,
		custom_id: true,
		custom_payment_method: true,
		document_type: true,
		due: true,
		exchange_rate: true,
		footer_note: true,
		gopay: true,
		hide_bank_account: true,
		iban: true,
		iban_visibility: true,
		issued_on: true,
		language: true,
		lines: true,
		note: true,
		number: true,
		number_format_id: true,
		order_number: true,
		oss: true,
		payment_method: true,
		paypal: true,
		private_note: true,
		proforma_followup_document: true,
		related_id: true,
		round_total: true,
		show_already_paid_note_in_pdf: true,
		subject_custom_id: true,
		supply_code: true,
		swift_bic: true,
		tags: true,
		tax_document_ids: true,
		taxable_fulfillment_due: true,
		transferred_tax_liability: true,
		variable_symbol: true,
		vat_price_mode: true,
	});

const UpdateInvoiceSchema = InvoiceSchema.omit({
	attachments: true,
	bank_account_id: true,
	cancelled_at: true,
	created_at: true,
	due_on: true,
	eet_records: true,
	generator_id: true,
	html_url: true,
	id: true,
	lines: true,
	locked_at: true,
	native_subtotal: true,
	native_total: true,
	number_format_id: true,
	paid_advances: true,
	paid_on: true,
	payments: true,
	pdf_url: true,
	public_html_url: true,
	remaining_amount: true,
	remaining_native_amount: true,
	reminder_sent_at: true,
	sent_at: true,
	status: true,
	// Fields that can't be updated
	subject_id: true,
	subject_url: true,
	subtotal: true,
	token: true,
	total: true,
	uncollectible_at: true,
	updated_at: true,
	url: true,
	vat_rates_summary: true,
	webinvoice_seen_on: true,
	your_city: true,
	your_country: true,
	your_local_vat_no: true,
	your_name: true,
	your_registration_no: true,
	your_street: true,
	your_vat_no: true,
	your_zip: true,
})
	.extend({
		/** List of attachments */
		attachments: z.array(CreateAttachmentSchema).optional(),
		/** List of lines to invoice */
		lines: z.array(UpdateLineSchema).optional(),
		/** Round total amount (VAT included) */
		round_total: z.boolean().optional(),
	})
	.partial();

const GetInvoicesFiltersSchema = InvoiceSchema.pick({
	custom_id: true,
	document_type: true,
	number: true,
	status: true,
	subject_id: true,
})
	.extend({
		page_count: z.number().positive(),
		since: z.string(),
		until: z.string(),
		updated_since: z.string(),
		updated_until: z.string(),
	})
	.partial();

type Invoice = z.infer<typeof InvoiceSchema>;
type CreateInvoice = z.infer<typeof CreateInvoiceSchema>;
type UpdateInvoice = z.infer<typeof UpdateInvoiceSchema>;
type Line = z.infer<typeof LineSchema>;
type CreateLine = z.infer<typeof CreateLineSchema>;
type UpdateLine = z.infer<typeof UpdateLineSchema>;
type Attachment = z.infer<typeof AttachmentSchema>;
type GetInvoicesFilters = z.infer<typeof GetInvoicesFiltersSchema>;

export {
	LineSchema,
	CreateLineSchema,
	UpdateLineSchema,
	InvoiceSchema,
	CreateInvoiceSchema,
	UpdateInvoiceSchema,
	AttachmentSchema,
	GetInvoicesFiltersSchema,
};
export type { Invoice, CreateInvoice, UpdateInvoice, Line, CreateLine, UpdateLine, Attachment, GetInvoicesFilters };
