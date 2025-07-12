import { z } from "zod/v3";
import { CreateInventoryMoveSchema, UpdateInventoryMoveSchema } from "../model/inventoryMove.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getInventoryMoves = createTool(
	"fakturoid_get_inventory_moves",
	"Get Inventory Moves",
	"Retrieve a list of inventory movements (stock changes) for a specific inventory item",
	async (client, { inventoryItemId }) => {
		const inventoryMoves = await client.getInventoryMoves(inventoryItemId);

		return {
			content: [{ text: JSON.stringify(inventoryMoves, null, 2), type: "text" }],
		};
	},
	{
		accountSlug: z.string().min(1),
		inventoryItemId: z.number(),
	},
);

const getInventoryMove = createTool(
	"fakturoid_get_inventory_move",
	"Get Inventory Move",
	"Retrieve detailed information about a specific inventory movement by its ID",
	async (client, { inventoryItemId, id }) => {
		const inventoryMove = await client.getInventoryMove(inventoryItemId, id);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		inventoryItemId: z.number(),
	},
);

const createInventoryMove = createTool(
	"fakturoid_create_inventory_move",
	"Create Inventory Move",
	"Create a new inventory movement (stock change) for an inventory item",
	async (client, { inventoryItemId, inventoryMoveData }) => {
		const inventoryMove = await client.createInventoryMove(inventoryItemId, inventoryMoveData);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	{
		inventoryItemId: z.number(),
		inventoryMoveData: CreateInventoryMoveSchema,
	},
);

const updateInventoryMove = createTool(
	"fakturoid_update_inventory_move",
	"Update Inventory Move",
	"Update an existing inventory movement with new data",
	async (client, { inventoryItemId, id, inventoryMoveData }) => {
		const inventoryMove = await client.updateInventoryMove(inventoryItemId, id, inventoryMoveData);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		inventoryItemId: z.number(),
		inventoryMoveData: UpdateInventoryMoveSchema,
	},
);

const deleteInventoryMove = createTool(
	"fakturoid_delete_inventory_move",
	"Delete Inventory Move",
	"Delete an inventory movement by its ID",
	async (client, { inventoryItemId, id }) => {
		await client.deleteInventoryMove(inventoryItemId, id);

		return {
			content: [{ text: "Inventory move deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
		inventoryItemId: z.number(),
	},
);

const inventoryMove = [
	getInventoryMoves,
	getInventoryMove,
	createInventoryMove,
	updateInventoryMove,
	deleteInventoryMove,
] as const satisfies ServerToolCreator[];

export { inventoryMove };
