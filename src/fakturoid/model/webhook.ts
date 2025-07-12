import { z } from "zod/v3";

const WebhookSchema = z.object({
	/** Send webhook? */
	active: z.boolean(),
	/** Value sent in Authorization header */
	auth_header: z.string(),
	/** Date and time of webhook creation */
	created_at: z.coerce.date(),
	/** List of events when webhook is fired */
	events: z.array(z.string()),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),
	/** Date and time of last webhook update */
	updated_at: z.coerce.date(),
	/** Webhook API address */
	url: z.string().url(),
	/** URL of webhook endpoint */
	webhook_url: z.string().url(),
});

const CreateWebhookSchema = WebhookSchema.pick({
	active: true,
	auth_header: true,
	events: true,
	webhook_url: true,
}).partial({
	active: true,
	auth_header: true,
});

const UpdateWebhookSchema = WebhookSchema.pick({
	active: true,
	auth_header: true,
	events: true,
	webhook_url: true,
}).partial();

type Webhook = z.infer<typeof WebhookSchema>;
type CreateWebhook = z.infer<typeof CreateWebhookSchema>;
type UpdateWebhook = z.infer<typeof UpdateWebhookSchema>;

export { WebhookSchema, CreateWebhookSchema, UpdateWebhookSchema };
export type { Webhook, CreateWebhook, UpdateWebhook };
