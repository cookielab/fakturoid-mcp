import { z } from "zod/v3";
import { LegacyBankDetailsSchema } from "./common.js";

const InventorySchema = z.object({
	/** Article number (if present) */
	article_number: z.string().optional(),

	/** Article number type (only if article_number is present) */
	article_number_type: z.enum(["ian", "ean", "isbn"]).optional(),
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
	native_total_price_without_vat: z.coerce.string(),

	/** Total VAT in account currency */
	native_total_vat: z.coerce.string(),

	/** Quantity */
	quantity: z.coerce.string().default("1"),

	/** Total price without VAT */
	total_price_without_vat: z.coerce.string(),

	/** Total VAT */
	total_vat: z.coerce.string(),

	/** Unit name */
	unit_name: z.string().optional(),

	/** Unit price */
	unit_price: z.coerce.string(),

	/** Unit price including VAT */
	unit_price_with_vat: z.coerce.string(),

	/** Unit price without VAT */
	unit_price_without_vat: z.coerce.string(),

	/** VAT Rate */
	vat_rate: z.union([z.number().int(), z.number()]).default(0),
});

const CreateLineSchema = LineSchema.pick({
	name: true,
	quantity: true,
	unit_name: true,
	unit_price: true,
	vat_rate: true,
}).extend({
	/** ID of the related inventory item, use this to set an ID during document creation */
	inventory_item_id: z.number().int().optional(),

	/** Stock Keeping Unit (SKU), use this to load data from an inventory item with matching SKU code */
	sku: z.string().optional(),
});

const UpdateLineSchema = CreateLineSchema.partial().extend({
	/** Set to true to delete this line */
	_destroy: z.boolean().optional(),
	/** Line ID (required for updating existing lines) */
	id: z.number().int().optional(),
});

const GeneratorSchema = z.object({
	/** Bank account ID */
	bank_account_id: z.number().int().nullable().optional(),

	/** Date and time of template creation */
	created_at: z.string(),

	/** Currency ISO code */
	currency: z.string().optional(),

	/** Identifier in your application */
	custom_id: z.string().nullable().optional(),

	/** Custom payment method (payment_method attribute must be set to 'custom') */
	custom_payment_method: z.string().max(20).nullable().optional(),

	/** Number of days until the invoice is overdue */
	due: z.number().int().optional(),

	/** Exchange rate */
	exchange_rate: z.coerce.string().optional(),

	/** Text in invoice footer */
	footer_note: z.string().optional(),

	/** Show GoPay pay button on invoice */
	gopay: z.boolean().default(false),

	/** Template HTML web address */
	html_url: z.string(),

	/** Controls IBAN visibility on the document webinvoice and PDF */
	iban_visibility: z.enum(["automatically", "always"]).default("automatically"),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),

	/** Invoice language */
	language: z.enum(["cz", "sk", "en", "de", "fr", "it", "es", "ru", "pl", "hu", "ro"]).optional(),

	/** Display IBAN, BIC (SWIFT) and bank account number for legacy templates set without bank account ID */
	legacy_bank_details: LegacyBankDetailsSchema.nullable().default(null),

	/** List of lines to invoice */
	lines: z.array(LineSchema).default([]),

	/** Template name */
	name: z.string(),

	/** Total amount without VAT in the account currency */
	native_subtotal: z.coerce.string(),

	/** Total amount with VAT in the account currency */
	native_total: z.coerce.string(),

	/** Text before invoice lines */
	note: z.string().optional(),

	/** Number format ID */
	number_format_id: z.number().int().nullable().optional(),

	/** Order number */
	order_number: z.string().optional(),

	/** Use OSS mode on invoice */
	oss: z.enum(["disabled", "service", "goods"]).default("disabled"),

	/** Payment method */
	payment_method: z.enum(["bank", "cash", "cod", "card", "paypal", "custom"]).optional(),

	/** Show PayPal pay button on invoice */
	paypal: z.boolean().default(false),

	/** Issue invoice as a proforma */
	proforma: z.boolean().default(false),

	/** Subject ID */
	subject_id: z.number().int(),

	/** API address of subject */
	subject_url: z.string(),

	/** Total amount without VAT */
	subtotal: z.coerce.string(),

	/** Supply code for reverse charge */
	supply_code: z.number().int().optional(),

	/** List of tags */
	tags: z.array(z.string()).default([]),

	/** Set CED at the end of last month */
	tax_date_at_end_of_last_month: z.boolean().default(false),

	/** Total amount with VAT */
	total: z.coerce.string(),

	/** Use reverse charge */
	transferred_tax_liability: z.boolean().default(false),

	/** Date and time of last template update */
	updated_at: z.string(),

	/** Template API address */
	url: z.string(),

	/** Calculate VAT from base or final amount */
	vat_price_mode: z.enum(["without_vat", "from_total_with_vat"]).optional(),
});

const CreateGeneratorSchema = GeneratorSchema.pick({
	bank_account_id: true,
	currency: true,
	custom_id: true,
	custom_payment_method: true,
	due: true,
	exchange_rate: true,
	footer_note: true,
	gopay: true,
	iban_visibility: true,
	language: true,
	name: true,
	note: true,
	number_format_id: true,
	order_number: true,
	oss: true,
	payment_method: true,
	paypal: true,
	proforma: true,
	subject_id: true,
	supply_code: true,
	tags: true,
	tax_date_at_end_of_last_month: true,
	transferred_tax_liability: true,
	vat_price_mode: true,
}).extend({
	/** List of lines to invoice */
	lines: z.array(CreateLineSchema).default([]),
	/** Round total amount (VAT included) */
	round_total: z.boolean().default(false).optional(),
});

const UpdateGeneratorSchema = CreateGeneratorSchema.partial().extend({
	/** List of lines to invoice */
	lines: z.array(UpdateLineSchema).optional(),
});

type Generator = z.infer<typeof GeneratorSchema>;
type CreateGenerator = z.infer<typeof CreateGeneratorSchema>;
type UpdateGenerator = z.infer<typeof UpdateGeneratorSchema>;
type Line = z.infer<typeof LineSchema>;
type CreateLine = z.infer<typeof CreateLineSchema>;
type UpdateLine = z.infer<typeof UpdateLineSchema>;
type Inventory = z.infer<typeof InventorySchema>;

export {
	GeneratorSchema,
	CreateGeneratorSchema,
	UpdateGeneratorSchema,
	LineSchema,
	CreateLineSchema,
	UpdateLineSchema,
	InventorySchema,
};
export type { Generator, CreateGenerator, UpdateGenerator, Line, CreateLine, UpdateLine, Inventory };
