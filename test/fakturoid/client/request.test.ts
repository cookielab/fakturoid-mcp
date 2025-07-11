import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { paginatedRequest, request, requestAllPages } from "../../../src/fakturoid/client/request";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Request", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Request GET", async () => {
		const responseData = { id: 1, name: "Test" };
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(responseData));

		const result = await request(strategy, "/test", "GET");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(responseData)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/test", {
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

	test("Request POST with body", async () => {
		const requestData = { name: "Test", value: 123 };
		const responseData = { id: 1, ...requestData };
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(responseData));

		const result = await request(strategy, "/test", "POST", requestData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(responseData)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/test", {
			body: JSON.stringify(requestData),
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

	test("Request with query parameters", async () => {
		const responseData = { results: [] };
		const strategy = new TestStrategy();
		const queryParams = { page: "1", limit: "10", filter: "active" };

		mockedFetch.mockResolvedValue(createResponse(responseData));

		const result = await request(strategy, "/test", "GET", undefined, queryParams);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(responseData)));
		// biome-ignore lint/nursery/noSecrets: Not a secret
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/test?page=1&limit=10&filter=active", {
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

	test("Request PATCH", async () => {
		const updateData = { name: "Updated Test" };
		const responseData = { id: 1, ...updateData };
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(responseData));

		const result = await request(strategy, "/test/1", "PATCH", updateData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(responseData)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/test/1", {
			body: JSON.stringify(updateData),
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

	test("Request DELETE", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await request(strategy, "/test/1", "DELETE");

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/test/1", {
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

	test("Paginated Request", async () => {
		const strategy = new TestStrategy();
		const firstPage = Array.from({ length: 40 }, (_, index) => ({ id: index, name: `Item ${index}` }));
		const secondPage = [{ id: 41, name: "Item 41" }];

		mockedFetch
			.mockResolvedValueOnce(createResponse(firstPage))
			.mockResolvedValueOnce(createResponse(secondPage))
			.mockResolvedValueOnce(createResponse([]));

		const generator = paginatedRequest(strategy, "/test");
		const pages: unknown[] = [];

		for await (const page of generator) {
			pages.push(page);
		}

		expect(pages).toHaveLength(2);
		// Stringify to parse just to have the same behavior for keys with undefined
		expect(pages[0]).toStrictEqual(JSON.parse(JSON.stringify(firstPage)));
		// Stringify to parse just to have the same behavior for keys with undefined
		expect(pages[1]).toStrictEqual(JSON.parse(JSON.stringify(secondPage)));
		expect(mockedFetch).toHaveBeenCalledTimes(2);
	});

	test("Request All Pages with page limit", async () => {
		const strategy = new TestStrategy();
		const firstPage = Array.from({ length: 40 }, (_, index) => ({ id: index, name: `Item ${index}` }));
		const secondPage = [{ id: 41, name: "Item 41" }];

		mockedFetch.mockResolvedValueOnce(createResponse(firstPage)).mockResolvedValueOnce(createResponse(secondPage));

		const result = await requestAllPages(strategy, "/test", {}, 1);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(firstPage)));
		expect(mockedFetch).toHaveBeenCalledTimes(1);
	});
});
