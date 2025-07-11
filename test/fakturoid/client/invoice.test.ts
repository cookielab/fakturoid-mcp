import type { CreateInvoice } from "../../../src/fakturoid/model/invoice";
import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createInvoice,
	deleteInvoice,
	downloadInvoiceAttachment,
	downloadInvoicePDF,
	fireInvoiceAction,
	getInvoiceDetail,
	getInvoices,
	searchInvoices,
	updateInvoice,
} from "../../../src/fakturoid/client/invoice";
import { createInvoice as createInvoiceFactory } from "../../factory/invoice.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Invoice", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Invoices", async () => {
		const invoices = [createInvoiceFactory("invoice-1"), createInvoiceFactory("invoice-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(invoices));

		const result = await getInvoices(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoices)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/invoices.json?page=0", {
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

	test("Get Invoices With Filters", async () => {
		const invoices = [createInvoiceFactory("invoice-filtered")];
		const strategy = new TestStrategy();
		const filters = {
			status: "open" as const,
			since: "2023-01-01",
			updated_since: "2023-01-01",
			subject_id: 123,
		};

		mockedFetch.mockResolvedValue(createResponse(invoices));

		const result = await getInvoices(strategy, "test", filters);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoices)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			// biome-ignore lint/nursery/noSecrets: Not a secret
			"https://test.example/accounts/test/invoices.json?since=2023-01-01&updated_since=2023-01-01&subject_id=123&status=open&page=0",
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

	test("Search Invoices", async () => {
		const invoices = [createInvoiceFactory("invoice-search")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(invoices));

		const result = await searchInvoices(strategy, "test", "search query", ["tag1", "tag2"]);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoices)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			// biome-ignore lint/nursery/noSecrets: Not a secret
			"https://test.example/accounts/test/invoices/search.json?query=search+query&tags=tag1%2Ctag2&page=0",
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

	test("Get Invoice Detail", async () => {
		const invoice = createInvoiceFactory("invoice-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(invoice));

		const result = await getInvoiceDetail(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoice)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/invoices/123.json", {
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

	test("Download Invoice PDF", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse("pdf content", "application/pdf"));

		const result = await downloadInvoicePDF(strategy, "test", 123);

		expect(result).toStrictEqual("pdf content");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			// biome-ignore lint/nursery/noSecrets: Not a secret
			"https://test.example/accounts/test/invoices/123/download.pdf?responseType=blob",
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

	test("Download Invoice Attachment", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse("attachment content", "application/pdf"));

		const result = await downloadInvoiceAttachment(strategy, "test", 123, 456);

		expect(result).toStrictEqual("attachment content");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			// biome-ignore lint/nursery/noSecrets: Not a secret
			"https://test.example/accounts/test/invoices/123/attachments/456/download?responseType=blob",
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

	test("Fire Invoice Action", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await fireInvoiceAction(strategy, "test", 123, "mark_as_sent");

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/invoices/123/fire.json?event=mark_as_sent",
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

	test("Create Invoice", async () => {
		const invoice = createInvoiceFactory("invoice-new");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(invoice));

		const result = await createInvoice(strategy, "test", invoice as CreateInvoice);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoice)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/invoices.json", {
			body: JSON.stringify(invoice),
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "POST",
		});
	});

	test("Update Invoice", async () => {
		const invoice = createInvoiceFactory("invoice-updated");
		const strategy = new TestStrategy();
		const updateData = {
			note: "Updated note",
		};

		mockedFetch.mockResolvedValue(createResponse(invoice));

		const result = await updateInvoice(strategy, "test", 123, updateData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(invoice)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/invoices/123.json", {
			body: JSON.stringify(updateData),
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "PATCH",
		});
	});

	test("Delete Invoice", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteInvoice(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/invoices/123.json", {
			body: null,
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "DELETE",
		});
	});
});
