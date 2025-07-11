import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { sendInvoiceMessage } from "../../../src/fakturoid/client/invoiceMessage";
import { createInvoiceMessage } from "../../factory/invoiceMessage.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Invoice Message", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Send Invoice Message", async () => {
		const strategy = new TestStrategy();
		const messageData = createInvoiceMessage("message-1");

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await sendInvoiceMessage(strategy, "test", 123, messageData);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/invoices/123/message.json",
			{
				body: JSON.stringify(messageData),
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
