import { z } from "zod/v4";

/**
 * User details
 */
const UserSchema = z.object({
	/** Avatar URL */
	avatar: z.string().nullable().readonly(),
	/** Full user name */
	full_name: z.string().readonly(),
	/** User ID */
	id: z.number().int().readonly(),
});

/**
 * Attributes of objects related to the event
 */
const RelatedObjectSchema = z.object({
	/** ID of the object related to event */
	id: z.number().int().readonly(),
	/** Type of the object related to the event */
	type: z
		// biome-ignore lint/nursery/noSecrets: "RecurringGenerator" is not a secret
		.enum(["Invoice", "Subject", "Expense", "Generator", "RecurringGenerator", "ExpenseGenerator", "Estimate"])
		.readonly(),
});

/**
 * Event object
 */
const EventSchema = z.object({
	/** Date and time of event creation */
	created_at: z.iso.datetime().readonly(),
	/** Event name */
	name: z.string().readonly(),
	/** Parameters with details about event, specific for each type of event */
	params: z.record(z.string(), z.unknown()).readonly(),
	/** Attributes of objects related to the event */
	related_objects: z.array(RelatedObjectSchema).readonly(),
	/** Text of the event */
	text: z.string().readonly(),
	/** User details */
	user: UserSchema.readonly(),
});

type Event = z.infer<typeof EventSchema>;

export { EventSchema };
export type { Event };
