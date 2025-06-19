import type { CreateWebhook, UpdateWebhook, Webhook } from "../model/webhook.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all webhooks.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#webhooks-index
 *
 * @param configuration
 * @param accountSlug
 *
 * @returns List of all webhooks.
 */
const getWebhooks = async (configuration: FakturoidClientConfig, accountSlug: string): Promise<Webhook[] | Error> => {
	const path = `/accounts/${accountSlug}/webhooks.json`;

	return await requestAllPages(configuration, path);
};

/**
 * Get a single webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#webhook-detail
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Webhook or Error.
 */
const getWebhook = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Webhook>> => {
	return await request(configuration, `/accounts/${accountSlug}/webhooks/${id}.json`, "GET");
};

/**
 * Create a new webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#create-webhook
 *
 * @param configuration
 * @param accountSlug
 * @param webhookData
 *
 * @returns Created webhook or Error.
 */
const createWebhook = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	webhookData: CreateWebhook,
): ReturnType<typeof request<Webhook, CreateWebhook>> => {
	return await request(configuration, `/accounts/${accountSlug}/webhooks.json`, "POST", webhookData);
};

/**
 * Update a webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#update-webhook
 *
 * @param configuration
 * @param accountSlug
 * @param id
 * @param webhookData
 *
 * @returns Updated webhook or Error.
 */
const updateWebhook = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
	webhookData: UpdateWebhook,
): ReturnType<typeof request<Webhook, UpdateWebhook>> => {
	return await request(configuration, `/accounts/${accountSlug}/webhooks/${id}.json`, "PATCH", webhookData);
};

/**
 * Delete a webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#delete-webhook
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteWebhook = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(configuration, `/accounts/${accountSlug}/webhooks/${id}.json`, "DELETE");
};

export { getWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook };
