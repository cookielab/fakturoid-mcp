import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createWebhook,
	deleteWebhook,
	getWebhook,
	getWebhooks,
	updateWebhook,
} from "../../../src/fakturoid/client/webhook";
import { createWebhook as createWebhookFactory } from "../../factory/webhook.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Webhook", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Webhooks", async () => {
		const webhooks = [createWebhookFactory("webhook-1"), createWebhookFactory("webhook-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(webhooks));

		const result = await getWebhooks(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(webhooks)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/webhooks.json?page=0", {
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

	test("Get Webhook", async () => {
		const webhook = createWebhookFactory("webhook-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(webhook));

		const result = await getWebhook(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(webhook)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/webhooks/123.json", {
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

	test("Create Webhook", async () => {
		const webhook = createWebhookFactory("webhook-new");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(webhook));

		const result = await createWebhook(strategy, "test", webhook);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(webhook)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/webhooks.json", {
			body: JSON.stringify(webhook),
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

	test("Update Webhook", async () => {
		const webhook = createWebhookFactory("webhook-updated");
		const strategy = new TestStrategy();
		const webhookData = {
			webhook_url: "https://example.com/webhook-updated",
		};

		mockedFetch.mockResolvedValue(createResponse(webhook));

		const result = await updateWebhook(strategy, "test", 123, webhookData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(webhook)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/webhooks/123.json", {
			body: JSON.stringify(webhookData),
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

	test("Delete Webhook", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteWebhook(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/webhooks/123.json", {
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
