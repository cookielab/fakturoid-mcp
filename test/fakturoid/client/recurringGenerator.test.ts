import type { CreateRecurringGenerator } from "../../../src/fakturoid/model/recurringGenerator";
import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createRecurringGenerator,
	deleteRecurringGenerator,
	getRecurringGenerator,
	getRecurringGenerators,
	updateRecurringGenerator,
} from "../../../src/fakturoid/client/recurringGenerator";
import { createRecurringGenerator as createRecurringGeneratorFactory } from "../../factory/recurringGenerator.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Recurring Generator", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Recurring Generators", async () => {
		const generators = [createRecurringGeneratorFactory("recurring-1"), createRecurringGeneratorFactory("recurring-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(generators));

		const result = await getRecurringGenerators(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generators)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/recurring_generators.json?page=0",
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

	test("Get Recurring Generator", async () => {
		const generator = createRecurringGeneratorFactory("recurring-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(generator));

		const result = await getRecurringGenerator(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generator)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/recurring_generators/123.json",
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

	test("Create Recurring Generator", async () => {
		const generator = createRecurringGeneratorFactory("recurring-new");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(generator));

		const result = await createRecurringGenerator(strategy, "test", generator as unknown as CreateRecurringGenerator);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generator)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/recurring_generators.json",
			{
				body: JSON.stringify(generator),
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

	test("Update Recurring Generator", async () => {
		const generator = createRecurringGeneratorFactory("recurring-updated");
		const strategy = new TestStrategy();
		const generatorData = {
			name: "Updated Recurring Generator",
		};

		mockedFetch.mockResolvedValue(createResponse(generator));

		const result = await updateRecurringGenerator(strategy, "test", 123, generatorData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generator)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/recurring_generators/123.json",
			{
				body: JSON.stringify(generatorData),
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

	test("Delete Recurring Generator", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteRecurringGenerator(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/recurring_generators/123.json",
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
