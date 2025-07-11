import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	archiveInventoryItem,
	createInventoryItem,
	deleteInventoryItem,
	getInventoryItem,
	getInventoryItems,
	unarchiveInventoryItem,
	updateInventoryItem,
} from "../../../src/fakturoid/client/inventoryItem";
import { createInventoryItem as createInventoryItemFactory } from "../../factory/inventoryItem.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Inventory Item", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Inventory Items", async () => {
		const inventoryItems = [createInventoryItemFactory("item-1"), createInventoryItemFactory("item-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryItems));

		const result = await getInventoryItems(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryItems)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items.json?page=1",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "GET",
			},
		);
	});

	test("Get Inventory Item", async () => {
		const inventoryItem = createInventoryItemFactory("item-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryItem));

		const result = await getInventoryItem(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryItem)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inventory_items/123.json", {
			body: null,
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "GET",
		});
	});

	test("Create Inventory Item", async () => {
		const inventoryItem = createInventoryItemFactory("item-new");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryItem));

		const result = await createInventoryItem(strategy, "test", inventoryItem);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryItem)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inventory_items.json", {
			body: JSON.stringify(inventoryItem),
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "POST",
		});
	});

	test("Update Inventory Item", async () => {
		const inventoryItem = createInventoryItemFactory("item-updated");
		const strategy = new TestStrategy();
		const inventoryItemData = {
			name: "Updated Item",
			quantity: 150,
		};

		mockedFetch.mockResolvedValue(createResponse(inventoryItem));

		const result = await updateInventoryItem(strategy, "test", 123, inventoryItemData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryItem)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inventory_items/123.json", {
			body: JSON.stringify(inventoryItemData),
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "PATCH",
		});
	});

	test("Delete Inventory Item", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteInventoryItem(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inventory_items/123.json", {
			body: null,
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "DELETE",
		});
	});

	test("Archive Inventory Item", async () => {
		const inventoryItem = createInventoryItemFactory("item-archived");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryItem));

		const result = await archiveInventoryItem(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryItem)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items/123/archive.json",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "POST",
			},
		);
	});

	test("Unarchive Inventory Item", async () => {
		const inventoryItem = createInventoryItemFactory("item-unarchived");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryItem));

		const result = await unarchiveInventoryItem(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryItem)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items/123/unarchive.json",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "POST",
			},
		);
	});
});
