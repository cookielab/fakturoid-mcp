import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { getAccountDetail } from "../../../src/fakturoid/client/account";
import { createAccount } from "../../factory/account.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Account", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Account Detail", async () => {
		const account = createAccount("get-account-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(account));

		const accountDetail = await getAccountDetail(strategy, "test");

		expect(accountDetail).toStrictEqual(account);
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/account.json", {
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
