import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createGenerator,
	deleteGenerator,
	getGenerator,
	getGenerators,
	updateGenerator,
} from "../../../src/fakturoid/client/generator";
import { createGenerator as createGeneratorFactory } from "../../factory/generator.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Generator", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Generators", async () => {
		const generators = [createGeneratorFactory("generator-1"), createGeneratorFactory("generator-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(generators));

		const result = await getGenerators(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generators)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/generators.json?page=1", {
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

	test("Get Generator", async () => {
		const generator = createGeneratorFactory("generator-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(generator));

		const result = await getGenerator(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generator)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/generators/123.json", {
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

	test("Create Generator", async () => {
		const generator = createGeneratorFactory("generator-new");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(generator));

		const result = await createGenerator(strategy, "test", generator);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generator)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/generators.json", {
			body: JSON.stringify(generator),
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

	test("Update Generator", async () => {
		const generator = createGeneratorFactory("generator-updated");
		const strategy = new TestStrategy();
		const generatorData = {
			name: "Updated Generator",
		};

		mockedFetch.mockResolvedValue(createResponse(generator));

		const result = await updateGenerator(strategy, "test", 123, generatorData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(generator)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/generators/123.json", {
			body: JSON.stringify(generatorData),
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

	test("Delete Generator", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteGenerator(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/generators/123.json", {
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
});
