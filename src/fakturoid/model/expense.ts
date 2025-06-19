import { z } from "zod/v4";
import { CreateAttachmentSchema, VatRatesSummarySchema } from "./common.ts";
import { ExpensePaymentSchema } from "./expensePayment.ts";

const LineInventorySchema = z.object({
	/** Article number (if present) */
	article_number: z.string().optional().readonly(),
	/** Article number type (only if article_number is present) */
	article_number_type: z.enum(["ian", "ean", "isbn"]).optional().readonly(),
	/** ID of the related inventory item */
	item_id: z.number().readonly(),
	/** ID of the related inventory move */
	move_id: z.number().readonly(),
	/** Stock Keeping Unit (SKU) */
	sku: z.string().readonly(),
});

const LineSchema = z.object({
	/** Unique identifier in Fakturoid */
	id: z.number().readonly(),
	/** Inventory information */
	inventory: LineInventorySchema.nullable().default(null).readonly(),
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

const CreateLineSchema = LineSchema.pick({
	name: true,
	quantity: true,
	unit_name: true,
	unit_price: true,
	vat_rate: true,
}).extend({
	/** ID of the related inventory item, use this to set an ID during document creation */
	inventory_item_id: z.number().optional(),
	/** Stock Keeping Unit (SKU), use this to load data from an inventory item with matching SKU code */
	sku: z.string().optional(),
});

const UpdateLineSchema = LineSchema.pick({
	id: true,
	name: true,
	quantity: true,
	unit_name: true,
	unit_price: true,
	vat_rate: true,
})
	.partial()
	.required({ id: true })
	.extend({
		/** Delete the line */
		_destroy: z.boolean().optional(),
		/** ID of the related inventory item, use this to set an ID during document creation */
		inventory_item_id: z.number().optional(),
		/** Stock Keeping Unit (SKU), use this to load data from an inventory item with matching SKU code */
		sku: z.string().optional(),
	});

const AttachmentResponseSchema = z.object({
	/** Attachment file MIME type */
	content_type: z.string().readonly(),
	/** API URL for file download */
	download_url: z.string().readonly(),
	/** Attachment file name */
	filename: z.string().readonly(),
	/** Unique identifier */
	id: z.number().readonly(),
});

const ExpenseSchema = z.object({
	/** List of attachments */
	attachments: z.array(AttachmentResponseSchema).nullable().optional(),
	/** Supplier bank account number */
	bank_account: z.string().optional(),
	/** Date and time of expense creation */
	created_at: z.string().readonly(),
	/** Currency ISO Code */
	currency: z.string().optional(),
	/** Identifier in your application */
	custom_id: z.string().nullable().optional(),
	/** Custom payment method */
	custom_payment_method: z.string().nullable().optional(),
	/** Expense description */
	description: z.string().optional(),
	/** Type of expense document */
	document_type: z.enum(["invoice", "bill", "other"]).default("invoice"),
	/** Date when the expense becomes overdue */
	due_on: z.string().optional(),
	/** Exchange rate (required if expense currency differs from account currency) */
	exchange_rate: z.string().optional(),
	/** Expense HTML web address */
	html_url: z.string().readonly(),
	/** Supplier bank account IBAN */
	iban: z.string().optional(),
	/** Unique identifier in Fakturoid */
	id: z.number().readonly(),
	/** Date of issue */
	issued_on: z.string().optional(),
	/** List of lines to expense */
	lines: z.array(LineSchema).optional(),
	/** Date and time when the expense was locked */
	locked_at: z.string().nullable().readonly(),
	/** Total without VAT in the account currency */
	native_subtotal: z.string().readonly(),
	/** Total with VAT in the account currency */
	native_total: z.string().readonly(),
	/** Expense number */
	number: z.string().optional(),
	/** Original expense number */
	original_number: z.string().optional(),
	/** Date when the expense was marked as paid */
	paid_on: z.string().nullable().readonly(),
	/** Payment method */
	payment_method: z.enum(["bank", "cash", "cod", "card", "paypal", "custom"]).default("bank"),
	/** List of payments */
	payments: z.array(ExpensePaymentSchema).readonly(),
	/** Private note */
	private_note: z.string().optional(),
	/** Proportional VAT deduction (percent) */
	proportional_vat_deduction: z.number().default(100),
	/** Date when you received the expense from your supplier */
	received_on: z.string().optional(),
	/** Remind the upcoming due date with a Todo */
	remind_due_date: z.boolean().default(true),
	/** Current state of the expense */
	status: z.enum(["open", "overdue", "paid"]).readonly(),
	/** Subject ID */
	subject_id: z.number(),
	/** Subject API address */
	subject_url: z.string().readonly(),
	/** Total without VAT */
	subtotal: z.string().readonly(),
	/** Subject address city */
	supplier_city: z.string().readonly(),
	/** Subject address country (ISO Code) */
	supplier_country: z.string().readonly(),
	/** Subject SK DIČ (only for Slovakia, does not start with country code) */
	supplier_local_vat_no: z.string().nullable().readonly(),
	/** Subject company name */
	supplier_name: z.string().readonly(),
	/** Subject registration number (IČO) */
	supplier_registration_no: z.string().readonly(),
	/** Subject address street */
	supplier_street: z.string().readonly(),
	/** Subject VAT number (DIČ) */
	supplier_vat_no: z.string().readonly(),
	/** Subject address postal code */
	supplier_zip: z.string().readonly(),
	/** Supply code for statement about expenses in reverse charge */
	supply_code: z.string().optional(),
	/** Supplier bank account BIC (for SWIFT payments) */
	swift_bic: z.string().optional(),
	/** List of tags */
	tags: z.array(z.string()).optional(),
	/** Tax deductible */
	tax_deductible: z.boolean().default(true),
	/** Chargeable event date */
	taxable_fulfillment_due: z.string().optional(),
	/** Total with VAT */
	total: z.string().readonly(),
	/** Self-assesment of VAT? */
	transferred_tax_liability: z.boolean().default(false),
	/** Date and time of last expense update */
	updated_at: z.string().readonly(),
	/** Expense API address */
	url: z.string().readonly(),
	/** Variable symbol */
	variable_symbol: z.string().optional(),
	/** Calculate VAT from base or final amount */
	vat_price_mode: z.enum(["without_vat", "from_total_with_vat"]).default("without_vat"),
	/** VAT rates summary */
	vat_rates_summary: z.array(VatRatesSummarySchema).readonly(),
});

const CreateExpenseSchema = ExpenseSchema.pick({
	bank_account: true,
	currency: true,
	custom_id: true,
	custom_payment_method: true,
	description: true,
	document_type: true,
	due_on: true,
	exchange_rate: true,
	iban: true,
	issued_on: true,
	number: true,
	original_number: true,
	payment_method: true,
	private_note: true,
	proportional_vat_deduction: true,
	received_on: true,
	remind_due_date: true,
	subject_id: true,
	supply_code: true,
	swift_bic: true,
	tags: true,
	tax_deductible: true,
	taxable_fulfillment_due: true,
	transferred_tax_liability: true,
	variable_symbol: true,
	vat_price_mode: true,
})
	.partial({
		bank_account: true,
		currency: true,
		custom_id: true,
		custom_payment_method: true,
		description: true,
		document_type: true,
		due_on: true,
		exchange_rate: true,
		iban: true,
		issued_on: true,
		number: true,
		original_number: true,
		payment_method: true,
		private_note: true,
		proportional_vat_deduction: true,
		received_on: true,
		remind_due_date: true,
		supply_code: true,
		swift_bic: true,
		tags: true,
		tax_deductible: true,
		taxable_fulfillment_due: true,
		transferred_tax_liability: true,
		variable_symbol: true,
		vat_price_mode: true,
	})
	.required({
		subject_id: true,
	})
	.extend({
		/** List of attachments */
		attachments: z.array(CreateAttachmentSchema).optional(),
		/** List of lines to expense */
		lines: z.array(CreateLineSchema).optional(),
	});

const UpdateExpenseSchema = ExpenseSchema.pick({
	bank_account: true,
	currency: true,
	custom_id: true,
	custom_payment_method: true,
	description: true,
	document_type: true,
	due_on: true,
	exchange_rate: true,
	iban: true,
	issued_on: true,
	number: true,
	original_number: true,
	payment_method: true,
	private_note: true,
	proportional_vat_deduction: true,
	received_on: true,
	remind_due_date: true,
	subject_id: true,
	supply_code: true,
	swift_bic: true,
	tags: true,
	tax_deductible: true,
	taxable_fulfillment_due: true,
	transferred_tax_liability: true,
	variable_symbol: true,
	vat_price_mode: true,
})
	.partial()
	.extend({
		/** List of attachments */
		attachments: z.array(CreateAttachmentSchema).optional(),
		/** List of lines to expense */
		lines: z.array(UpdateLineSchema).optional(),
	});

const GetExpenseFiltersSchema = ExpenseSchema.pick({
	custom_id: true,
	number: true,
	status: true,
	subject_id: true,
	variable_symbol: true,
})
	.extend({
		page_count: z.number().positive(),
		since: z.string(),
		updated_since: z.string(),
	})
	.partial();

type Expense = z.infer<typeof ExpenseSchema>;
type CreateExpense = z.infer<typeof CreateExpenseSchema>;
type UpdateExpense = z.infer<typeof UpdateExpenseSchema>;
type GetExpenseFilters = z.infer<typeof GetExpenseFiltersSchema>;

export { ExpenseSchema, CreateExpenseSchema, UpdateExpenseSchema, GetExpenseFiltersSchema };
export type { Expense, CreateExpense, UpdateExpense, GetExpenseFilters };
