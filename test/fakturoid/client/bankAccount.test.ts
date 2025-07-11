import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { getBankAccounts } from "../../../src/fakturoid/client/bankAccount";
import { createBankAccount } from "../../factory/bankAccount.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Bank Account", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Bank Accounts", async () => {
		const bankAccounts = [createBankAccount("bank-account-1"), createBankAccount("bank-account-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(bankAccounts));

		const result = await getBankAccounts(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(bankAccounts)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/bank_accounts.json", {
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
});
