import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInventoryMoves = createTool(
	"fakturoid_get_inventory_moves",
	async (client, { accountSlug, inventoryItemId }) => {
		const inventoryMoves = await client.getInventoryMoves(accountSlug, inventoryItemId);

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
	async (client, { accountSlug, inventoryItemId, id }) => {
		const inventoryMove = await client.getInventoryMove(accountSlug, inventoryItemId, id);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
		inventoryItemId: z.number(),
	}),
);

const createInventoryMove = createTool(
	"fakturoid_create_inventory_move",
	async (client, { accountSlug, inventoryItemId, inventoryMoveData }) => {
		const inventoryMove = await client.createInventoryMove(accountSlug, inventoryItemId, inventoryMoveData);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		inventoryItemId: z.number(),
		inventoryMoveData: z.any(), // Using z.any() since CreateInventoryMove type is not available here
	}),
);

const updateInventoryMove = createTool(
	"fakturoid_update_inventory_move",
	async (client, { accountSlug, inventoryItemId, id, inventoryMoveData }) => {
		const inventoryMove = await client.updateInventoryMove(accountSlug, inventoryItemId, id, inventoryMoveData);

		return {
			content: [{ text: JSON.stringify(inventoryMove, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
		inventoryItemId: z.number(),
		inventoryMoveData: z.any(), // Using z.any() since UpdateInventoryMove type is not available here
	}),
);

const deleteInventoryMove = createTool(
	"fakturoid_delete_inventory_move",
	async (client, { accountSlug, inventoryItemId, id }) => {
		await client.deleteInventoryMove(accountSlug, inventoryItemId, id);

		return {
			content: [{ text: "Inventory move deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
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
