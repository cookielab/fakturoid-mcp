import { z } from "zod/v3";

/**
 * User details
 */
const UserSchema = z.object({
	/** Avatar URL */
	avatar: z.string().nullable(),
	/** Full user name */
	full_name: z.string(),
	/** User ID */
	id: z.number().int(),
});

/**
 * Attributes of objects related to the event
 */
const RelatedObjectSchema = z.object({
	/** ID of the object related to event */
	id: z.number().int(),
	/** Type of the object related to the event */
	type: z
		// biome-ignore lint/nursery/noSecrets: "RecurringGenerator" is not a secret
		.enum(["Invoice", "Subject", "Expense", "Generator", "RecurringGenerator", "ExpenseGenerator", "Estimate"]),
});

/**
 * Event object
 */
const EventSchema = z.object({
	/** Date and time of event creation */
	created_at: z.coerce.date(),
	/** Event name */
	name: z.string(),
	/** Parameters with details about event, specific for each type of event */
	params: z.record(z.string(), z.unknown()),
	/** Attributes of objects related to the event */
	related_objects: z.array(RelatedObjectSchema),
	/** Text of the event */
	text: z.string(),
	/** User details */
	user: UserSchema,
});

type Event = z.infer<typeof EventSchema>;

export { EventSchema };
export type { Event };
