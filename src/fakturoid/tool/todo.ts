import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getTodos = createTool("fakturoid_get_todos", async (client) => {
	const todos = await client.getTodos();

	return {
		content: [{ text: JSON.stringify(todos, null, 2), type: "text" }],
	};
});

const toggleTodoCompletion = createTool(
	"fakturoid_toggle_todo_completion",
	async (client, { id }) => {
		const result = await client.toggleTodoCompletion(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const todo = [getTodos, toggleTodoCompletion] as const satisfies ServerToolCreator[];

export { todo };
