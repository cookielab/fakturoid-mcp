import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { getNumberFormats } from "../../../src/fakturoid/client/numberFormat";
import { createNumberFormat } from "../../factory/numberFormat.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Number Format", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Number Formats", async () => {
		const numberFormats = [createNumberFormat("format-1"), createNumberFormat("format-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(numberFormats));

		const result = await getNumberFormats(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(numberFormats)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/number_formats/invoices.json",
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
});
