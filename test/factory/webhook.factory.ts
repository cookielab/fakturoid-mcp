import type { Webhook } from "../../src/fakturoid/model/webhook";
import { copycat, type Input } from "@snaplet/copycat";

const createWebhook = (seed: Input, initial: Partial<Webhook> = {}): Webhook => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });

	const availableEvents = [
		"invoice_created",
		"invoice_updated",
		"invoice_sent",
		"invoice_paid",
		"invoice_cancelled",
		"invoice_overdue",
		"subject_created",
		"subject_updated",
		"expense_created",
		"expense_updated",
		"expense_paid",
		"generator_created",
		"generator_updated",
		"recurring_generator_created",
		"recurring_generator_updated",
		"expense_generator_created",
		"expense_generator_updated",
		"payment_received",
		"payment_failed",
		"document_locked",
		"document_unlocked",
	] as const;

	const eventCount = copycat.int(`${seed}_event_count`, { min: 1, max: 8 });
	const events = copycat.someOf(`${seed}_events`, [eventCount, eventCount], [...availableEvents]);

	const webhookDomains = [
		"webhook.example.com",
		"api.myapp.com",
		"hooks.service.com",
		"notifications.company.com",
		"integrations.platform.com",
	] as const;

	const webhookDomain = copycat.oneOf(`${seed}_webhook_domain`, [...webhookDomains]);
	const webhookPath = copycat.oneOf(`${seed}_webhook_path`, [
		"/webhooks/fakturoid",
		"/api/webhooks/invoices",
		"/notifications/receive",
		"/integrations/fakturoid/callback",
		"/hooks/accounting",
	]);

	// biome-ignore-start lint/nursery/noSecrets: Not a secret
	const authTokens = [
		"Bearer sk_live_abc123def456",
		"Token abc123def456ghi789",
		"Basic YWRtaW46c2VjcmV0",
		"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
		"X-API-Key abc123def456",
	] as const;
	// biome-ignore-end lint/nursery/noSecrets: Not a secret

	return {
		active: copycat.bool(`${seed}_active`),
		auth_header: copycat.oneOf(`${seed}_auth_header`, [...authTokens]),
		created_at: baseDate,
		events: events,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		updated_at: updatedDate,
		url: copycat.url(`${seed}_url`),
		webhook_url: `https://${webhookDomain}${webhookPath}`,

		...initial,
	};
};

export { createWebhook };
