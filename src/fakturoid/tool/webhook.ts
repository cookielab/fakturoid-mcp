import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getWebhooks = createTool(
	"fakturoid_get_webhooks",
	async (client, { accountSlug }) => {
		const webhooks = await client.getWebhooks(accountSlug);

		return {
			content: [{ text: JSON.stringify(webhooks, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const getWebhook = createTool(
	"fakturoid_get_webhook",
	async (client, { accountSlug, id }) => {
		const webhook = await client.getWebhook(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const createWebhook = createTool(
	"fakturoid_create_webhook",
	async (client, { accountSlug, webhookData }) => {
		const webhook = await client.createWebhook(accountSlug, webhookData);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		webhookData: z.any(), // Using z.any() since CreateWebhook type is not available here
	}),
);

const updateWebhook = createTool(
	"fakturoid_update_webhook",
	async (client, { accountSlug, id, webhookData }) => {
		const webhook = await client.updateWebhook(accountSlug, id, webhookData);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
		webhookData: z.any(), // Using z.any() since UpdateWebhook type is not available here
	}),
);

const deleteWebhook = createTool(
	"fakturoid_delete_webhook",
	async (client, { accountSlug, id }) => {
		await client.deleteWebhook(accountSlug, id);

		return {
			content: [{ text: "Webhook deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
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
