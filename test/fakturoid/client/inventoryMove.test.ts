import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createInventoryMove,
	deleteInventoryMove,
	getInventoryMove,
	getInventoryMoves,
	updateInventoryMove,
} from "../../../src/fakturoid/client/inventoryMove";
import { createInventoryMove as createInventoryMoveFactory } from "../../factory/inventoryMove.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Inventory Move", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Inventory Moves", async () => {
		const inventoryMoves = [createInventoryMoveFactory("move-1"), createInventoryMoveFactory("move-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryMoves));

		const result = await getInventoryMoves(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryMoves)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items/123/inventory_moves.json?page=0",
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

	test("Get Inventory Move", async () => {
		const inventoryMove = createInventoryMoveFactory("move-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryMove));

		const result = await getInventoryMove(strategy, "test", 123, 456);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryMove)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items/123/inventory_moves/456.json",
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

	test("Create Inventory Move", async () => {
		const inventoryMove = createInventoryMoveFactory("move-new");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryMove));

		const result = await createInventoryMove(strategy, "test", 123, inventoryMove);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryMove)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items/123/inventory_moves.json",
			{
				body: JSON.stringify(inventoryMove),
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

	test("Update Inventory Move", async () => {
		const inventoryMove = createInventoryMoveFactory("move-updated");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inventoryMove));

		const result = await updateInventoryMove(strategy, "test", 123, 456, inventoryMove);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inventoryMove)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items/123/inventory_moves/456.json",
			{
				body: JSON.stringify(inventoryMove),
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "PATCH",
			},
		);
	});

	test("Delete Inventory Move", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteInventoryMove(strategy, "test", 123, 456);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inventory_items/123/inventory_moves/456.json",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "DELETE",
			},
		);
	});
});
