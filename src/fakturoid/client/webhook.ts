import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { CreateWebhook, UpdateWebhook, Webhook } from "../model/webhook.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all webhooks.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#webhooks-index
 *
 * @param strategy
 * @param accountSlug
 *
 * @returns List of all webhooks.
 */
const getWebhooks = async (strategy: AuthenticationStrategy, accountSlug: string): Promise<Webhook[] | Error> => {
	const path = `/accounts/${accountSlug}/webhooks.json`;

	return await requestAllPages(strategy, path);
};

/**
 * Get a single webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#webhook-detail
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Webhook or Error.
 */
const getWebhook = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Webhook>> => {
	return await request(strategy, `/accounts/${accountSlug}/webhooks/${id}.json`, "GET");
};

/**
 * Create a new webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#create-webhook
 *
 * @param strategy
 * @param accountSlug
 * @param webhookData
 *
 * @returns Created webhook or Error.
 */
const createWebhook = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	webhookData: CreateWebhook,
): ReturnType<typeof request<Webhook, CreateWebhook>> => {
	return await request(strategy, `/accounts/${accountSlug}/webhooks.json`, "POST", webhookData);
};

/**
 * Update a webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#update-webhook
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param webhookData
 *
 * @returns Updated webhook or Error.
 */
const updateWebhook = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	webhookData: UpdateWebhook,
): ReturnType<typeof request<Webhook, UpdateWebhook>> => {
	return await request(strategy, `/accounts/${accountSlug}/webhooks/${id}.json`, "PATCH", webhookData);
};

/**
 * Delete a webhook.
 *
 * @see https://www.fakturoid.cz/api/v3/webhooks#delete-webhook
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteWebhook = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/webhooks/${id}.json`, "DELETE");
};

export { getWebhooks, getWebhook, createWebhook, updateWebhook, deleteWebhook };
