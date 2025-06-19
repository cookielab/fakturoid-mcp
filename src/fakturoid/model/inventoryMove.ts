import { z } from "zod/v4";

/**
 * Document details about the document and line the move is tied to
 */
const DocumentSchema = z
	.object({
		/** Document ID */
		id: z.number().int().readonly(),
		/** Document line ID */
		line_id: z.number().int().readonly(),
		/** Type of document */
		type: z.enum(["Estimate", "Expense", "ExpenseGenerator", "Generator", "Invoice"]).readonly(),
	})
	.readonly();

const InventoryMoveSchema = z.object({
	/** Date and time of move creation */
	created_at: z.iso.datetime().readonly(),
	/** Move direction */
	direction: z.enum(["in", "out"]),
	/** Details about document and line the move is tied to. Default: null */
	document: DocumentSchema.nullish().readonly(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),
	/** Inventory item ID */
	inventory_item_id: z.number().int().readonly(),
	/** Move date */
	moved_on: z.iso.datetime(),
	/** Unit purchase price in account currency */
	native_purchase_price: z.coerce.number().nullish(),
	/** Retail price in account currency */
	native_retail_price: z.coerce.number().nullish(),
	/** Private note */
	private_note: z.string().nullish(),
	/** Purchase currency. Default: Inherit from account settings */
	purchase_currency: z.string().length(3).nullish(),
	/** Purchase price per unit (without VAT) */
	purchase_price: z.coerce.number(),
	/** Item quantity in move */
	quantity_change: z.coerce.number(),
	/** Retail currency. Default: Inherit from account settings */
	retail_currency: z.string().length(3).nullish(),
	/** Retail price per unit */
	retail_price: z.coerce.number().nullish(),
	/** Date and time of last move update */
	updated_at: z.iso.datetime().readonly(),
});

const CreateInventoryMoveSchema = InventoryMoveSchema.pick({
	direction: true,
	moved_on: true,
	purchase_price: true,
	quantity_change: true,
}).extend({
	native_purchase_price: InventoryMoveSchema.shape.native_purchase_price.optional(),
	native_retail_price: InventoryMoveSchema.shape.native_retail_price.optional(),
	private_note: InventoryMoveSchema.shape.private_note.optional(),
	purchase_currency: InventoryMoveSchema.shape.purchase_currency.optional(),
	retail_currency: InventoryMoveSchema.shape.retail_currency.optional(),
	retail_price: InventoryMoveSchema.shape.retail_price.optional(),
});

const UpdateInventoryMoveSchema = InventoryMoveSchema.pick({
	moved_on: true,
	native_purchase_price: true,
	native_retail_price: true,
	private_note: true,
	purchase_currency: true,
	purchase_price: true,
	quantity_change: true,
	retail_currency: true,
	retail_price: true,
}).partial();

type InventoryMove = z.infer<typeof InventoryMoveSchema>;
type CreateInventoryMove = z.infer<typeof CreateInventoryMoveSchema>;
type UpdateInventoryMove = z.infer<typeof UpdateInventoryMoveSchema>;

export { InventoryMoveSchema, CreateInventoryMoveSchema, UpdateInventoryMoveSchema };
export type { InventoryMove, CreateInventoryMove, UpdateInventoryMove };
