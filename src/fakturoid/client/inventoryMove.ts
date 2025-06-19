import type { CreateInventoryMove, InventoryMove, UpdateInventoryMove } from "../model/inventoryMove.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all inventory moves for an inventory item.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-moves#inventory-moves-index
 *
 * @param configuration
 * @param accountSlug
 * @param inventoryItemId
 *
 * @returns List of all inventory moves for the inventory item.
 */
const getInventoryMoves = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	inventoryItemId: number,
): Promise<InventoryMove[] | Error> => {
	const path = `/accounts/${accountSlug}/inventory_items/${inventoryItemId}/inventory_moves.json`;

	return await requestAllPages(configuration, path);
};

/**
 * Get a single inventory move.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-moves#inventory-move-detail
 *
 * @param configuration
 * @param accountSlug
 * @param inventoryItemId
 * @param id
 *
 * @returns Inventory move or Error.
 */
const getInventoryMove = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	inventoryItemId: number,
	id: number,
): ReturnType<typeof request<InventoryMove>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
		"GET",
	);
};

/**
 * Create a new inventory move.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-moves#create-inventory-move
 *
 * @param configuration
 * @param accountSlug
 * @param inventoryItemId
 * @param inventoryMoveData
 *
 * @returns Created inventory move or Error.
 */
const createInventoryMove = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	inventoryItemId: number,
	inventoryMoveData: CreateInventoryMove,
): ReturnType<typeof request<InventoryMove, CreateInventoryMove>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/inventory_items/${inventoryItemId}/inventory_moves.json`,
		"POST",
		inventoryMoveData,
	);
};

/**
 * Update an inventory move.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-moves#update-inventory-move
 *
 * @param configuration
 * @param accountSlug
 * @param inventoryItemId
 * @param id
 * @param inventoryMoveData
 *
 * @returns Updated inventory move or Error.
 */
const updateInventoryMove = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	inventoryItemId: number,
	id: number,
	inventoryMoveData: UpdateInventoryMove,
): ReturnType<typeof request<InventoryMove, UpdateInventoryMove>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
		"PATCH",
		inventoryMoveData,
	);
};

/**
 * Delete an inventory move.
 *
 * @see https://www.fakturoid.cz/api/v3/inventory-moves#delete-inventory-move
 *
 * @param configuration
 * @param accountSlug
 * @param inventoryItemId
 * @param id
 *
 * @returns Success or Error.
 */
const deleteInventoryMove = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	inventoryItemId: number,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/inventory_items/${inventoryItemId}/inventory_moves/${id}.json`,
		"DELETE",
	);
};

export { getInventoryMoves, getInventoryMove, createInventoryMove, updateInventoryMove, deleteInventoryMove };
