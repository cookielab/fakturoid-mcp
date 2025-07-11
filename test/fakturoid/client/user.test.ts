import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { getCurrentUser, getUsersForAccount } from "../../../src/fakturoid/client/user";
import { createUser } from "../../factory/user.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("User", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Current User", async () => {
		const user = createUser("current-user");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(user));

		const result = await getCurrentUser(strategy);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(user)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/user.json", {
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

	test("Get Users For Account", async () => {
		const users = [createUser("user-1"), createUser("user-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(users));

		const result = await getUsersForAccount(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(users)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/users.json", {
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
