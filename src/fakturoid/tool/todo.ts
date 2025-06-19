import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getTodos = createTool(
	"fakturoid_get_todos",
	async (client, { accountSlug }) => {
		const todos = await client.getTodos(accountSlug);

		return {
			content: [{ text: JSON.stringify(todos, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const toggleTodoCompletion = createTool(
	"fakturoid_toggle_todo_completion",
	async (client, { accountSlug, id }) => {
		const result = await client.toggleTodoCompletion(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const todo = [getTodos, toggleTodoCompletion] as const satisfies ServerToolCreator[];

export { todo };
