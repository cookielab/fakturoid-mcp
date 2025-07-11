import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { createExpensePayment, deleteExpensePayment } from "../../../src/fakturoid/client/expensePayment";
import { createExpensePayment as createExpensePaymentFactory } from "../../factory/expensePayment.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Expense Payment", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Create Expense Payment", async () => {
		const expensePayment = createExpensePaymentFactory("expense-payment-1");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(expensePayment));

		const result = await createExpensePayment(strategy, "test", 123, expensePayment);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(expensePayment)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/expenses/123/payments.json",
			{
				body: JSON.stringify(expensePayment),
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

	test("Delete Expense Payment", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteExpensePayment(strategy, "test", 123, 456);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/expenses/123/payments/456.json",
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
