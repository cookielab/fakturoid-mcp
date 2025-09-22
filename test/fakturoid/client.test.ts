import type { User } from "../../src/fakturoid/model/user.js";
import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { FakturoidClient } from "../../src/fakturoid/client.js";
import { createUser } from "../factory/user.factory.js";
import { createResponse, mockFetch } from "../testUtils/mock.js";
import { TestStrategy } from "../testUtils/strategy.js";

describe("Fakturoid Client", () => {
	let mockedFetch: Mock<typeof global.fetch>;
	let strategy: TestStrategy;

	beforeEach(() => {
		mockedFetch = mockFetch();
		strategy = new TestStrategy();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Available Accounts and Change Active Account", async () => {
		const user: User = createUser("test-user", {
			accounts: [
				{
					allowed_scope: ["invoices", "expenses"],
					logo: "https://example.com/logo1.png",
					name: "Test Company 1",
					permission: "owner",
					registration_no: "12345678",
					slug: "test-company-1",
				},
				{
					allowed_scope: ["invoices"],
					logo: "https://example.com/logo2.png",
					name: "Test Company 2",
					permission: "admin",
					registration_no: "87654321",
					slug: "test-company-2",
				},
			],
		});
		mockedFetch.mockResolvedValueOnce(createResponse(user));

		const client = await FakturoidClient.create(strategy);

		expect(mockedFetch).toHaveBeenCalledWith("https://test.example/user.json", {
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

		mockedFetch.mockResolvedValueOnce(createResponse(user));

		const availableAccounts = await client.getAvailableAccounts();

		expect(availableAccounts).toStrictEqual(user.accounts);
		expect(mockedFetch).toHaveBeenCalledWith("https://test.example/user.json", {
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

		mockedFetch.mockResolvedValueOnce(createResponse(user));

		await client.changeAccountSlug("test-company-2");

		expect(mockedFetch).toHaveBeenCalledWith("https://test.example/user.json", {
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

		mockedFetch.mockResolvedValueOnce(createResponse(user));

		await expect(client.changeAccountSlug("invalid-slug")).rejects.toThrow(
			"The account slug 'invalid-slug' is not available.",
		);

		expect(mockedFetch).toHaveBeenCalledTimes(4);
	});
});
