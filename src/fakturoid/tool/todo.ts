import { z } from "zod/v3";
import { createTool, type ServerToolCreator } from "./common.js";

const getTodos = createTool(
	"fakturoid_get_todos",
	"Get Todos",
	"Retrieve a list of todos (tasks and reminders) in the account",
	async (client) => {
		const todos = await client.getTodos();

		return {
			content: [{ text: JSON.stringify(todos, null, 2), type: "text" }],
		};
	},
);

const toggleTodoCompletion = createTool(
	"fakturoid_toggle_todo_completion",
	"Toggle Todo Completion",
	"Toggle the completion status of a todo item (mark as completed or incomplete)",
	async (client, { id }) => {
		const result = await client.toggleTodoCompletion(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const todo = [getTodos, toggleTodoCompletion] as const satisfies ServerToolCreator[];

export { todo };
