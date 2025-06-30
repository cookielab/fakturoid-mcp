import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInventoryItems = createTool("fakturoid_get_inventory_items", async (client) => {
	const inventoryItems = await client.getInventoryItems();

	return {
		content: [{ text: JSON.stringify(inventoryItems, null, 2), type: "text" }],
	};
});

const getInventoryItem = createTool(
	"fakturoid_get_inventory_item",
	async (client, { id }) => {
		const inventoryItem = await client.getInventoryItem(id);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const createInventoryItem = createTool(
	"fakturoid_create_inventory_item",
	async (client, { inventoryItemData }) => {
		const inventoryItem = await client.createInventoryItem(inventoryItemData);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	z.object({
		inventoryItemData: z.any(), // Using z.any() since CreateInventoryItem type is not available here
	}),
);

const updateInventoryItem = createTool(
	"fakturoid_update_inventory_item",
	async (client, { id, inventoryItemData }) => {
		const inventoryItem = await client.updateInventoryItem(id, inventoryItemData);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		inventoryItemData: z.any(), // Using z.any() since UpdateInventoryItem type is not available here
	}),
);

const deleteInventoryItem = createTool(
	"fakturoid_delete_inventory_item",
	async (client, { id }) => {
		await client.deleteInventoryItem(id);

		return {
			content: [{ text: "Inventory item deleted successfully", type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const archiveInventoryItem = createTool(
	"fakturoid_archive_inventory_item",
	async (client, { id }) => {
		const result = await client.archiveInventoryItem(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const unarchiveInventoryItem = createTool(
	"fakturoid_unarchive_inventory_item",
	async (client, { id }) => {
		const result = await client.unarchiveInventoryItem(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const inventoryItem = [
	getInventoryItems,
	getInventoryItem,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
	archiveInventoryItem,
	unarchiveInventoryItem,
] as const satisfies ServerToolCreator[];

export { inventoryItem };
