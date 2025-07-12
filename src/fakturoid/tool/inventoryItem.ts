import { z } from "zod/v3";
import { CreateInventoryItemSchema, UpdateInventoryItemSchema } from "../model/inventoryItem.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getInventoryItems = createTool(
	"fakturoid_get_inventory_items",
	"Get Inventory Items",
	"Retrieve a list of all inventory items (products and services)",
	async (client) => {
		const inventoryItems = await client.getInventoryItems();

		return {
			content: [{ text: JSON.stringify(inventoryItems, null, 2), type: "text" }],
		};
	},
);

const getInventoryItem = createTool(
	"fakturoid_get_inventory_item",
	"Get Inventory Item",
	"Retrieve detailed information about a specific inventory item by its ID",
	async (client, { id }) => {
		const inventoryItem = await client.getInventoryItem(id);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const createInventoryItem = createTool(
	"fakturoid_create_inventory_item",
	"Create Inventory Item",
	"Create a new inventory item (product or service)",
	async (client, inventoryItemData) => {
		const inventoryItem = await client.createInventoryItem(inventoryItemData);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	CreateInventoryItemSchema.shape,
);

const updateInventoryItem = createTool(
	"fakturoid_update_inventory_item",
	"Update Inventory Item",
	"Update an existing inventory item with new data",
	async (client, { id, inventoryItemData }) => {
		const inventoryItem = await client.updateInventoryItem(id, inventoryItemData);

		return {
			content: [{ text: JSON.stringify(inventoryItem, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		inventoryItemData: UpdateInventoryItemSchema,
	},
);

const deleteInventoryItem = createTool(
	"fakturoid_delete_inventory_item",
	"Delete Inventory Item",
	"Delete an inventory item by its ID",
	async (client, { id }) => {
		await client.deleteInventoryItem(id);

		return {
			content: [{ text: "Inventory item deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const archiveInventoryItem = createTool(
	"fakturoid_archive_inventory_item",
	"Archive Inventory Item",
	"Archive an inventory item to hide it from active lists",
	async (client, { id }) => {
		const result = await client.archiveInventoryItem(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const unarchiveInventoryItem = createTool(
	"fakturoid_unarchive_inventory_item",
	"Unarchive Inventory Item",
	"Unarchive an inventory item to restore it to active lists",
	async (client, { id }) => {
		const result = await client.unarchiveInventoryItem(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
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
