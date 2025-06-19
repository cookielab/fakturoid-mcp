import { z } from "zod/v4";

const TodoSchema = z.object({
	/** Date and time of todo completion */
	completed_at: z.iso.datetime().nullable().readonly(),

	/** Date and time of todo creation */
	created_at: z.iso.datetime().readonly(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),

	/** Todo name */
	name: z.string().readonly(),

	/** Parameters with details about todo, specific for each type of todo */
	params: z.record(z.string(), z.unknown()).readonly(),

	/** Attributes of objects related to the todo */
	related_objects: z
		.array(
			z.object({
				/** ID of the object related to todo */
				id: z.number().int().readonly(),
				/** Type of the object related to the todo */
				type: z
					// biome-ignore lint/nursery/noSecrets: "RecurringGenerator" is not a secret
					.enum(["Invoice", "Subject", "Expense", "Generator", "RecurringGenerator", "ExpenseGenerator"])
					.readonly(),
			}),
		)
		.readonly(),

	/** Todo text */
	text: z.string().readonly(),
});

type Todo = z.infer<typeof TodoSchema>;

export { TodoSchema };
export type { Todo };
