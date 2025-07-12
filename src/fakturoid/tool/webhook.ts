import { z } from "zod/v3";
import { CreateWebhookSchema, UpdateWebhookSchema } from "..//model/webhook.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getWebhooks = createTool(
	"fakturoid_get_webhooks",
	"Get Webhooks",
	"Retrieve a list of all configured webhooks for receiving real-time notifications",
	async (client) => {
		const webhooks = await client.getWebhooks();

		return {
			content: [{ text: JSON.stringify(webhooks, null, 2), type: "text" }],
		};
	},
);

const getWebhook = createTool(
	"fakturoid_get_webhook",
	"Get Webhook",
	"Retrieve detailed information about a specific webhook by its ID",
	async (client, { id }) => {
		const webhook = await client.getWebhook(id);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const createWebhook = createTool(
	"fakturoid_create_webhook",
	"Create Webhook",
	"Create a new webhook to receive real-time notifications about events",
	async (client, webhookData) => {
		const webhook = await client.createWebhook(webhookData);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	CreateWebhookSchema.shape,
);

const updateWebhook = createTool(
	"fakturoid_update_webhook",
	"Update Webhook",
	"Update an existing webhook configuration",
	async (client, { id, webhookData }) => {
		const webhook = await client.updateWebhook(id, webhookData);

		return {
			content: [{ text: JSON.stringify(webhook, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		webhookData: UpdateWebhookSchema,
	},
);

const deleteWebhook = createTool(
	"fakturoid_delete_webhook",
	"Delete Webhook",
	"Delete a webhook by its ID",
	async (client, { id }) => {
		await client.deleteWebhook(id);

		return {
			content: [{ text: "Webhook deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const webhook = [
	getWebhooks,
	getWebhook,
	createWebhook,
	updateWebhook,
	deleteWebhook,
] as const satisfies ServerToolCreator[];

export { webhook };
