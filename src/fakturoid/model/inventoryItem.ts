import { z } from "zod/v4";

const InventoryItemSchema = z.object({
	/** Allow quantity below zero */
	allow_below_zero: z.boolean().default(false).optional(),
	/** If item is archived */
	archived: z.boolean().readonly(),
	/** Article number */
	article_number: z.string().nullable().optional(),
	/** Article number type */
	article_number_type: z.enum(["ian", "ean", "isbn"]).default("ian").optional(),
	/** Average purchase price in account currency */
	average_native_purchase_price: z.string().readonly(),
	/** Date and time of item creation */
	created_at: z.iso.datetime().readonly(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),
	/** Date when item quantity dropped below min_quantity */
	low_quantity_date: z.iso.datetime().nullable().optional().readonly(),
	/** Maximum stock quantity */
	max_quantity: z.string().nullable().optional(),
	/** Minimum stock quantity */
	min_quantity: z.string().nullable().optional(),
	/** Item name */
	name: z.string(),
	/** Unit purchase price without VAT in account currency - Required if track_quantity is enabled */
	native_purchase_price: z.string(),
	/** Unit retail price without VAT in account currency */
	native_retail_price: z.string(),
	/** Private note */
	private_note: z.string().nullable().optional(),
	/**
	 * Quantity in stock - Required if track_quantity is enabled
	 * Becomes read-only after item creation and can be changed only via inventory moves
	 */
	quantity: z.string().readonly(),
	/** Stock Keeping Unit (SKU) - Required if track_quantity is enabled */
	sku: z.string(),
	/** Suggest item for documents */
	suggest_for: z.enum(["invoices", "expenses", "both"]).default("both").optional(),
	/** Item type */
	supply_type: z.enum(["goods", "service"]).default("goods").optional(),
	/** Track quantity via inventory moves? */
	track_quantity: z.boolean().default(false).optional(),
	/** Unit of measure */
	unit_name: z.string().nullable().optional(),
	/** Date and time of last item update */
	updated_at: z.iso.datetime().readonly(),
	/** VAT rate */
	vat_rate: z.enum(["standard", "reduced", "reduced2", "zero"]).nullable().optional(),
});

const CreateInventoryItemSchema = z.object({
	/** Allow quantity below zero */
	allow_below_zero: z.boolean().optional(),
	/** Article number */
	article_number: z.string().nullable().optional(),
	/** Article number type */
	article_number_type: z.enum(["ian", "ean", "isbn"]).optional(),
	/** Maximum stock quantity */
	max_quantity: z.union([z.string(), z.number()]).nullable().optional(),
	/** Minimum stock quantity */
	min_quantity: z.union([z.string(), z.number()]).nullable().optional(),
	/** Item name */
	name: z.string(),
	/** Unit purchase price without VAT in account currency - Required if track_quantity is enabled */
	native_purchase_price: z.union([z.string(), z.number()]),
	/** Unit retail price without VAT in account currency */
	native_retail_price: z.union([z.string(), z.number()]),
	/** Private note */
	private_note: z.string().nullable().optional(),
	/** Quantity in stock - Required if track_quantity is enabled */
	quantity: z.union([z.string(), z.number()]).optional(),
	/** Stock Keeping Unit (SKU) - Required if track_quantity is enabled */
	sku: z.string(),
	/** Suggest item for documents */
	suggest_for: z.enum(["invoices", "expenses", "both"]).optional(),
	/** Item type */
	supply_type: z.enum(["goods", "service"]).optional(),
	/** Track quantity via inventory moves? */
	track_quantity: z.boolean().optional(),
	/** Unit of measure */
	unit_name: z.string().nullable().optional(),
	/** VAT rate */
	vat_rate: z.enum(["standard", "reduced", "reduced2", "zero"]).nullable().optional(),
});

const UpdateInventoryItemSchema = z.object({
	/** Allow quantity below zero */
	allow_below_zero: z.boolean().optional(),
	/** Article number */
	article_number: z.string().nullable().optional(),
	/** Article number type */
	article_number_type: z.enum(["ian", "ean", "isbn"]).optional(),
	/** Maximum stock quantity */
	max_quantity: z.union([z.string(), z.number()]).nullable().optional(),
	/** Minimum stock quantity */
	min_quantity: z.union([z.string(), z.number()]).nullable().optional(),
	/** Item name */
	name: z.string().optional(),
	/** Unit purchase price without VAT in account currency */
	native_purchase_price: z.union([z.string(), z.number()]).optional(),
	/** Unit retail price without VAT in account currency */
	native_retail_price: z.union([z.string(), z.number()]).optional(),
	/** Private note */
	private_note: z.string().nullable().optional(),
	/** Stock Keeping Unit (SKU) */
	sku: z.string().optional(),
	/** Suggest item for documents */
	suggest_for: z.enum(["invoices", "expenses", "both"]).optional(),
	/** Item type */
	supply_type: z.enum(["goods", "service"]).optional(),
	/** Track quantity via inventory moves? */
	track_quantity: z.boolean().optional(),
	/** Unit of measure */
	unit_name: z.string().nullable().optional(),
	/** VAT rate */
	vat_rate: z.enum(["standard", "reduced", "reduced2", "zero"]).nullable().optional(),
});

type InventoryItem = z.infer<typeof InventoryItemSchema>;
type CreateInventoryItem = z.infer<typeof CreateInventoryItemSchema>;
type UpdateInventoryItem = z.infer<typeof UpdateInventoryItemSchema>;

export { InventoryItemSchema, CreateInventoryItemSchema, UpdateInventoryItemSchema };
export type { InventoryItem, CreateInventoryItem, UpdateInventoryItem };
