import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getWebhooks = createTool("fakturoid_get_webhooks", async (client) => {
	const webhooks = await client.getWebhooks();

	return {
		content: [{ text: JSON.stringify(webhooks, null, 2), type: "text" }],
	};
});

const getWebhook = createTool(
	"fakturoid_get_webhook",
	async (client, { id }) => {
		const webhook = await client.getWebhook(id);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const createWebhook = createTool(
	"fakturoid_create_webhook",
	async (client, { webhookData }) => {
		const webhook = await client.createWebhook(webhookData);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	z.object({
		webhookData: z.any(), // Using z.any() since CreateWebhook type is not available here
	}),
);

const updateWebhook = createTool(
	"fakturoid_update_webhook",
	async (client, { id, webhookData }) => {
		const webhook = await client.updateWebhook(id, webhookData);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		webhookData: z.any(), // Using z.any() since UpdateWebhook type is not available here
	}),
);

const deleteWebhook = createTool(
	"fakturoid_delete_webhook",
	async (client, { id }) => {
		await client.deleteWebhook(id);

		return {
			content: [{ text: "Webhook deleted successfully", type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const webhook = [
	getWebhooks,
	getWebhook,
	createWebhook,
	updateWebhook,
	deleteWebhook,
] as const satisfies ServerToolCreator[];

export { webhook };
