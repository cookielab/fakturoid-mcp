import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createInvoicePayment,
	createTaxDocument,
	deleteInvoicePayment,
} from "../../../src/fakturoid/client/invoicePayment";
import { createInvoicePayment as createInvoicePaymentFactory } from "../../factory/invoicePayment.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Invoice Payment", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Create Invoice Payment", async () => {
		const invoicePayment = createInvoicePaymentFactory("invoice-payment-1");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(invoicePayment));

		const result = await createInvoicePayment(strategy, "test", 123, invoicePayment);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoicePayment)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/invoices/123/payments.json",
			{
				body: JSON.stringify(invoicePayment),
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

	test("Create Tax Document", async () => {
		const invoicePayment = createInvoicePaymentFactory("tax-document");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(invoicePayment));

		const result = await createTaxDocument(strategy, "test", 123, 456);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoicePayment)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/invoices/123/payments/456/create_tax_document.json",
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

	test("Delete Invoice Payment", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteInvoicePayment(strategy, "test", 123, 456);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/invoices/123/payments/456.json",
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
