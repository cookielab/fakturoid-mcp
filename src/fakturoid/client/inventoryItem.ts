import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { CreateInventoryItem, InventoryItem, UpdateInventoryItem } from "../model/inventoryItem.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all inventory items.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#inventory-items-index
 *
 * @param strategy
 * @param accountSlug
 *
 * @returns List of all inventory items.
 */
const getInventoryItems = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): Promise<InventoryItem[] | Error> => {
	const path = `/accounts/${accountSlug}/inventory_items.json`;

	return await requestAllPages(strategy, path);
};

/**
 * Get a single inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#inventory-item-detail
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Inventory item or Error.
 */
const getInventoryItem = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<InventoryItem>> => {
	return await request(strategy, `/accounts/${accountSlug}/inventory_items/${id}.json`, "GET");
};

/**
 * Create a new inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#create-inventory-item
 *
 * @param strategy
 * @param accountSlug
 * @param inventoryItemData
 *
 * @returns Created inventory item or Error.
 */
const createInventoryItem = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	inventoryItemData: CreateInventoryItem,
): ReturnType<typeof request<InventoryItem, CreateInventoryItem>> => {
	return await request(strategy, `/accounts/${accountSlug}/inventory_items.json`, "POST", inventoryItemData);
};

/**
 * Update an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#update-inventory-item
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param inventoryItemData
 *
 * @returns Updated inventory item or Error.
 */
const updateInventoryItem = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	inventoryItemData: UpdateInventoryItem,
): ReturnType<typeof request<InventoryItem, UpdateInventoryItem>> => {
	return await request(strategy, `/accounts/${accountSlug}/inventory_items/${id}.json`, "PATCH", inventoryItemData);
};

/**
 * Delete an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#delete-inventory-item
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteInventoryItem = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/inventory_items/${id}.json`, "DELETE");
};

/**
 * Archive an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#archive-inventory-item
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Archived inventory item or Error.
 */
const archiveInventoryItem = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<InventoryItem>> => {
	return await request(strategy, `/accounts/${accountSlug}/inventory_items/${id}/archive.json`, "POST");
};

/**
 * Unarchive an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-items#unarchive-inventory-item
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Unarchived inventory item or Error.
 */
const unarchiveInventoryItem = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<InventoryItem>> => {
	return await request(strategy, `/accounts/${accountSlug}/inventory_items/${id}/unarchive.json`, "POST");
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
