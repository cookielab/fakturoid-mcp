import type { CreateInventoryItem, InventoryItem, UpdateInventoryItem } from "../model/inventoryItem.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all inventory items.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#inventory-items-index
 *
 * @param configuration
 * @param accountSlug
 *
 * @returns List of all inventory items.
 */
const getInventoryItems = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
): Promise<InventoryItem[] | Error> => {
	const path = `/accounts/${accountSlug}/inventory_items.json`;

	return await requestAllPages(configuration, path);
};

/**
 * Get a single inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#inventory-item-detail
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Inventory item or Error.
 */
const getInventoryItem = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<InventoryItem>> => {
	return await request(configuration, `/accounts/${accountSlug}/inventory_items/${id}.json`, "GET");
};

/**
 * Create a new inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#create-inventory-item
 *
 * @param configuration
 * @param accountSlug
 * @param inventoryItemData
 *
 * @returns Created inventory item or Error.
 */
const createInventoryItem = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	inventoryItemData: CreateInventoryItem,
): ReturnType<typeof request<InventoryItem, CreateInventoryItem>> => {
	return await request(configuration, `/accounts/${accountSlug}/inventory_items.json`, "POST", inventoryItemData);
};

/**
 * Update an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#update-inventory-item
 *
 * @param configuration
 * @param accountSlug
 * @param id
 * @param inventoryItemData
 *
 * @returns Updated inventory item or Error.
 */
const updateInventoryItem = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
	inventoryItemData: UpdateInventoryItem,
): ReturnType<typeof request<InventoryItem, UpdateInventoryItem>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/inventory_items/${id}.json`,
		"PATCH",
		inventoryItemData,
	);
};

/**
 * Delete an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#delete-inventory-item
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteInventoryItem = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(configuration, `/accounts/${accountSlug}/inventory_items/${id}.json`, "DELETE");
};

/**
 * Archive an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#archive-inventory-item
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Archived inventory item or Error.
 */
const archiveInventoryItem = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<InventoryItem>> => {
	return await request(configuration, `/accounts/${accountSlug}/inventory_items/${id}/archive.json`, "POST");
};

/**
 * Unarchive an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#unarchive-inventory-item
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Unarchived inventory item or Error.
 */
const unarchiveInventoryItem = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<InventoryItem>> => {
	return await request(configuration, `/accounts/${accountSlug}/inventory_items/${id}/unarchive.json`, "POST");
};

export {
	getInventoryItems,
	getInventoryItem,
	createInventoryItem,
	updateInventoryItem,
	deleteInventoryItem,
	archiveInventoryItem,
	unarchiveInventoryItem,
};
