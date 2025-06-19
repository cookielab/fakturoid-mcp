import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInventoryItems = createTool(
	"fakturoid_get_inventory_items",
	async (client, { accountSlug }) => {
		const inventoryItems = await client.getInventoryItems(accountSlug);

		return {
			content: [{ text: JSON.stringify(inventoryItems, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const getInventoryItem = createTool(
	"fakturoid_get_inventory_item",
	async (client, { accountSlug, id }) => {
		const inventoryItem = await client.getInventoryItem(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const createInventoryItem = createTool(
	"fakturoid_create_inventory_item",
	async (client, { accountSlug, inventoryItemData }) => {
		const inventoryItem = await client.createInventoryItem(accountSlug, inventoryItemData);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		inventoryItemData: z.any(), // Using z.any() since CreateInventoryItem type is not available here
	}),
);

const updateInventoryItem = createTool(
	"fakturoid_update_inventory_item",
	async (client, { accountSlug, id, inventoryItemData }) => {
		const inventoryItem = await client.updateInventoryItem(accountSlug, id, inventoryItemData);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
		inventoryItemData: z.any(), // Using z.any() since UpdateInventoryItem type is not available here
	}),
);

const deleteInventoryItem = createTool(
	"fakturoid_delete_inventory_item",
	async (client, { accountSlug, id }) => {
		await client.deleteInventoryItem(accountSlug, id);

		return {
			content: [{ text: "Inventory item deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const archiveInventoryItem = createTool(
	"fakturoid_archive_inventory_item",
	async (client, { accountSlug, id }) => {
		const result = await client.archiveInventoryItem(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const unarchiveInventoryItem = createTool(
	"fakturoid_unarchive_inventory_item",
	async (client, { accountSlug, id }) => {
		const result = await client.unarchiveInventoryItem(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
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
