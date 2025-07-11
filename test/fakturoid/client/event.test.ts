import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { getEvents } from "../../../src/fakturoid/client/event";
import { createEvent } from "../../factory/event.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Event", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Events", async () => {
		const events = [createEvent("event-1"), createEvent("event-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(events));

		const result = await getEvents(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(events)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/events.json?page=1", {
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
