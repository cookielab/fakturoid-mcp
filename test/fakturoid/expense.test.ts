import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { fireExpenseAction } from "../../src/fakturoid/client/expense";
import { createResponse, mockFetch } from "../testUtils/mock";
import { TestStrategy } from "../testUtils/strategy";

describe("Expense", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Fire Expense Action", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const response = await fireExpenseAction(strategy, "test", 123_456_789, "lock");

		expect(response).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/expenses/123456789/fire.json?event=lock",
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
