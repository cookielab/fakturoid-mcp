import { z } from "zod/v3";

const TodoSchema = z.object({
	/** Date and time of todo completion */
	completed_at: z.coerce.date().nullable(),

	/** Date and time of todo creation */
	created_at: z.coerce.date(),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),

	/** Todo name */
	name: z.string(),

	/** Parameters with details about todo, specific for each type of todo */
	params: z.record(z.string(), z.unknown()),

	/** Attributes of objects related to the todo */
	related_objects: z.array(
		z.object({
			/** ID of the object related to todo */
			id: z.number().int(),
			/** Type of the object related to the todo */
			type: z
				// biome-ignore lint/nursery/noSecrets: "RecurringGenerator" is not a secret
				.enum(["Invoice", "Subject", "Expense", "Generator", "RecurringGenerator", "ExpenseGenerator"]),
		}),
	),

	/** Todo text */
	text: z.string(),
});

type Todo = z.infer<typeof TodoSchema>;

export { TodoSchema };
export type { Todo };
