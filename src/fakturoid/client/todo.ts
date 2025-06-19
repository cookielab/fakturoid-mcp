import type { Todo } from "../model/todo.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all todos.
 *
 * @see https://www.fakturoid.cz/api/v3/todos#todos-index
 *
 * @param configuration
 * @param accountSlug
 *
 * @returns List of all todos.
 */
const getTodos = async (configuration: FakturoidClientConfig, accountSlug: string): Promise<Todo[] | Error> => {
	const path = `/accounts/${accountSlug}/todos.json`;

	return await requestAllPages(configuration, path);
};

/**
 * Toggle todo completion status.
 *
 * @see https://www.fakturoid.cz/api/v3/todos#toggle-todo-completion
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Updated todo or Error.
 */
const toggleTodoCompletion = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Todo>> => {
	return await request(configuration, `/accounts/${accountSlug}/todos/${id}/toggle_completion.json`, "POST");
};

export { getTodos, toggleTodoCompletion };
