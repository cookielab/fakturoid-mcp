import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInventoryMoves = createTool(
	"fakturoid_get_inventory_moves",
	async (client, { inventoryItemId }) => {
		const inventoryMoves = await client.getInventoryMoves(inventoryItemId);

		return {
			content: [{ text: JSON.stringify(inventoryMoves, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		inventoryItemId: z.number(),
	}),
);

const getInventoryMove = createTool(
	"fakturoid_get_inventory_move",
	async (client, { inventoryItemId, id }) => {
		const inventoryMove = await client.getInventoryMove(inventoryItemId, id);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		inventoryItemId: z.number(),
	}),
);

const createInventoryMove = createTool(
	"fakturoid_create_inventory_move",
	async (client, { inventoryItemId, inventoryMoveData }) => {
		const inventoryMove = await client.createInventoryMove(inventoryItemId, inventoryMoveData);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	z.object({
		inventoryItemId: z.number(),
		inventoryMoveData: z.any(), // Using z.any() since CreateInventoryMove type is not available here
	}),
);

const updateInventoryMove = createTool(
	"fakturoid_update_inventory_move",
	async (client, { inventoryItemId, id, inventoryMoveData }) => {
		const inventoryMove = await client.updateInventoryMove(inventoryItemId, id, inventoryMoveData);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		inventoryItemId: z.number(),
		inventoryMoveData: z.any(), // Using z.any() since UpdateInventoryMove type is not available here
	}),
);

const deleteInventoryMove = createTool(
	"fakturoid_delete_inventory_move",
	async (client, { inventoryItemId, id }) => {
		await client.deleteInventoryMove(inventoryItemId, id);

		return {
			content: [{ text: "Inventory move deleted successfully", type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		inventoryItemId: z.number(),
	}),
);

const inventoryMove = [
	getInventoryMoves,
	getInventoryMove,
	createInventoryMove,
	updateInventoryMove,
	deleteInventoryMove,
] as const satisfies ServerToolCreator[];

export { inventoryMove };
