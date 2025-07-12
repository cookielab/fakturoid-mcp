import { z } from "zod/v3";
import { LegacyBankDetailsSchema } from "./common.js";

const RECURRING_GENERATOR_ARTICLE_NUMBER_TYPE = ["ian", "ean", "isbn"] as const;
const RECURRING_GENERATOR_LANGUAGE = ["cz", "sk", "en", "de", "fr", "it", "es", "ru", "pl", "hu", "ro"] as const;
const RECURRING_GENERATOR_OSS = ["disabled", "service", "goods"] as const;
const RECURRING_GENERATOR_PAYMENT_METHOD = ["bank", "cash", "cod", "card", "paypal", "custom"] as const;
const RECURRING_GENERATOR_IBAN_VISIBILITY = ["automatically", "always"] as const;
const RECURRING_GENERATOR_VAT_PRICE_MODE = ["without_vat", "from_total_with_vat"] as const;

const InventorySchema = z.object({
	/** Article number (if present) */
	article_number: z.string().optional(),
	/** Article number type (only if article_number is present) */
	article_number_type: z.enum(RECURRING_GENERATOR_ARTICLE_NUMBER_TYPE).optional(),
	/** ID of the related inventory item */
	item_id: z.number().int(),
	/** ID of the related inventory move */
	move_id: z.number().int(),
	/** Stock Keeping Unit (SKU) */
	sku: z.string(),
});

const LineSchema = z.object({
	/** Unique identifier in Fakturoid */
	id: z.number().int(),
	/** Inventory information */
	inventory: InventorySchema.nullable().default(null),
	/** Line name */
	name: z.string(),
	/** Total price without VAT in account currency */
	native_total_price_without_vat: z.string(),
	/** Total VAT in account currency */
	native_total_vat: z.string(),
	/** Quantity */
	quantity: z.string().default("1"),
	/** Total price without VAT */
	total_price_without_vat: z.string(),
	/** Total VAT */
	total_vat: z.string(),
	/** Unit name */
	unit_name: z.string().optional(),
	/** Unit price */
	unit_price: z.string(),
	/** Unit price including VAT */
	unit_price_with_vat: z.string(),
	/** Unit price without VAT */
	unit_price_without_vat: z.string(),
	/** VAT Rate */
	vat_rate: z.union([z.number().int(), z.number()]).default(0),
});

const CreateLineSchema = z.object({
	/** ID of the related inventory item, use this to set an ID during document creation */
	inventory_item_id: z.number().int().optional(),
	/** Line name */
	name: z.string(),
	/** Quantity */
	quantity: z.string().optional().default("1"),
	/** Stock Keeping Unit (SKU), use this to load data from an inventory item with matching SKU code. You can specify the other writable attributes as well and they will override the values from the inventory item. */
	sku: z.string().optional(),
	/** Unit name */
	unit_name: z.string().optional(),
	/** Unit price */
	unit_price: z.string(),
	/** VAT Rate */
	vat_rate: z.union([z.number().int(), z.number()]).optional().default(0),
});

const UpdateLineSchema = z.object({
	/** Flag to delete the line */
	_destroy: z.boolean().optional(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().optional(),
	/** ID of the related inventory item, use this to set an ID during document creation */
	inventory_item_id: z.number().int().optional(),
	/** Line name */
	name: z.string().optional(),
	/** Quantity */
	quantity: z.string().optional(),
	/** Stock Keeping Unit (SKU), use this to load data from an inventory item with matching SKU code. You can specify the other writable attributes as well and they will override the values from the inventory item. */
	sku: z.string().optional(),
	/** Unit name */
	unit_name: z.string().optional(),
	/** Unit price */
	unit_price: z.string().optional(),
	/** VAT Rate */
	vat_rate: z.union([z.number().int(), z.number()]).optional(),
});

const RecurringGeneratorSchema = z.object({
	/** Generator is active or paused */
	active: z.boolean().default(true),
	/** Bank account ID */
	bank_account_id: z.number().int().nullable().optional(),
	/** Date and time of generator creation */
	created_at: z.string(),
	/** Currency ISO code */
	currency: z.string().optional(),
	/** Identifier in your application */
	custom_id: z.string().nullable().optional(),
	/** Custom payment method (payment_method attribute must be set to custom, otherwise the custom_payment_method value is ignored and set to null) */
	custom_payment_method: z.string().max(20).nullable().optional(),
	/** Number of days until the invoice is overdue */
	due: z.number().int().optional(),
	/** End date */
	end_date: z.string().nullable().optional(),
	/** Exchange rate */
	exchange_rate: z.string().optional(),
	/** Text in invoice footer */
	footer_note: z.string().nullable().optional(),
	/** Show GoPay pay button on invoice */
	gopay: z.boolean().default(false),
	/** Generator HTML web address */
	html_url: z.string(),
	/** Controls IBAN visibility on the document webinvoice and PDF. IBAN must be valid to show */
	iban_visibility: z.enum(RECURRING_GENERATOR_IBAN_VISIBILITY).default("automatically"),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),
	/** Invoice language */
	language: z.enum(RECURRING_GENERATOR_LANGUAGE).optional(),
	/** Issue an invoice on the last day of the month */
	last_day_in_month: z.boolean().default(false),
	/** Display IBAN, BIC (SWIFT) and bank account number for legacy generators set without bank account ID */
	legacy_bank_details: LegacyBankDetailsSchema.nullable().default(null),
	/** List of lines to invoice. You can use variables for inserting dates to your text. */
	lines: z.array(LineSchema),
	/** Number of months until the next invoice */
	months_period: z.number().int(),
	/** Generator name */
	name: z.string(),
	/** Total amount without VAT in the account currency */
	native_subtotal: z.string(),
	/** Total amount with VAT in the account currency */
	native_total: z.string(),
	/** Next invoice date */
	next_occurrence_on: z.string().optional(),
	/** Text before invoice lines */
	note: z.string().nullable().optional(),
	/** Number format ID */
	number_format_id: z.number().int().nullable().optional(),
	/** Order number */
	order_number: z.string().nullable().optional(),
	/** Use OSS mode on invoice */
	oss: z.enum(RECURRING_GENERATOR_OSS).default("disabled"),
	/** Payment method */
	payment_method: z.enum(RECURRING_GENERATOR_PAYMENT_METHOD).optional(),
	/** Show PayPal pay button on invoice */
	paypal: z.boolean().default(false),
	/** Issue invoice as a proforma */
	proforma: z.boolean().default(false),
	/** Send invoice by email */
	send_email: z.boolean().default(false),
	/** Start date */
	start_date: z.string(),
	/** Subject ID */
	subject_id: z.number().int(),
	/** API address of subject */
	subject_url: z.string(),
	/** Total amount without VAT */
	subtotal: z.string(),
	/** Supply code for reverse charge */
	supply_code: z.number().int().nullable().optional(),
	/** List of tags */
	tags: z.array(z.string()).optional(),
	/** Set CED at the end of last month */
	tax_date_at_end_of_last_month: z.boolean().default(false),
	/** Total amount with VAT */
	total: z.string(),
	/** Use reverse charge */
	transferred_tax_liability: z.boolean().default(false),
	/** Date and time of last generator update */
	updated_at: z.string(),
	/** Generator API address */
	url: z.string(),
	/** Calculate VAT from base or final amount */
	vat_price_mode: z.enum(RECURRING_GENERATOR_VAT_PRICE_MODE).nullable().optional(),
});

const CreateRecurringGeneratorSchema = RecurringGeneratorSchema.pick({
	bank_account_id: true,
	currency: true,
	custom_id: true,
	custom_payment_method: true,
	due: true,
	end_date: true,
	exchange_rate: true,
	footer_note: true,
	gopay: true,
	iban_visibility: true,
	language: true,
	last_day_in_month: true,
	months_period: true,
	name: true,
	next_occurrence_on: true,
	note: true,
	number_format_id: true,
	order_number: true,
	oss: true,
	payment_method: true,
	paypal: true,
	proforma: true,
	send_email: true,
	start_date: true,
	subject_id: true,
	supply_code: true,
	tags: true,
	tax_date_at_end_of_last_month: true,
	transferred_tax_liability: true,
	vat_price_mode: true,
})
	.extend({
		/** List of lines to invoice. You can use variables for inserting dates to your text. */
		lines: z.array(CreateLineSchema),
		/** Round total amount (VAT included) */
		round_total: z.boolean().optional().default(false),
	})
	.required({
		months_period: true,
		name: true,
		start_date: true,
		subject_id: true,
	});

const UpdateRecurringGeneratorSchema = RecurringGeneratorSchema.pick({
	bank_account_id: true,
	currency: true,
	custom_id: true,
	custom_payment_method: true,
	due: true,
	end_date: true,
	exchange_rate: true,
	footer_note: true,
	gopay: true,
	iban_visibility: true,
	language: true,
	last_day_in_month: true,
	months_period: true,
	name: true,
	next_occurrence_on: true,
	note: true,
	number_format_id: true,
	order_number: true,
	oss: true,
	payment_method: true,
	paypal: true,
	proforma: true,
	send_email: true,
	start_date: true,
	subject_id: true,
	supply_code: true,
	tags: true,
	tax_date_at_end_of_last_month: true,
	transferred_tax_liability: true,
	vat_price_mode: true,
})
	.extend({
		/** List of lines to invoice. You can use variables for inserting dates to your text. */
		lines: z.array(UpdateLineSchema).optional(),
		/** Round total amount (VAT included) */
		round_total: z.boolean().optional(),
	})
	.partial();

type RecurringGenerator = z.infer<typeof RecurringGeneratorSchema>;
type CreateRecurringGenerator = z.infer<typeof CreateRecurringGeneratorSchema>;
type UpdateRecurringGenerator = z.infer<typeof UpdateRecurringGeneratorSchema>;

type Line = z.infer<typeof LineSchema>;
type Inventory = z.infer<typeof InventorySchema>;

export {
	RecurringGeneratorSchema,
	CreateRecurringGeneratorSchema,
	UpdateRecurringGeneratorSchema,
	RECURRING_GENERATOR_ARTICLE_NUMBER_TYPE,
	RECURRING_GENERATOR_LANGUAGE,
	RECURRING_GENERATOR_OSS,
	RECURRING_GENERATOR_PAYMENT_METHOD,
	RECURRING_GENERATOR_IBAN_VISIBILITY,
	RECURRING_GENERATOR_VAT_PRICE_MODE,
};
export type { RecurringGenerator, CreateRecurringGenerator, UpdateRecurringGenerator, Line, Inventory };
