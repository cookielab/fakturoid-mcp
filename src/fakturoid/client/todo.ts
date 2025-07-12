import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { Todo } from "../model/todo.js";
import { request, requestAllPages } from "./request.js";

/**
 * Get all todos.
 *
 * @see https://www.fakturoid.cz/api/v3/todos#todos-index
 *
 * @param strategy
 * @param accountSlug
 *
 * @returns List of all todos.
 */
const getTodos = async (strategy: AuthenticationStrategy, accountSlug: string): Promise<Todo[] | Error> => {
	const path = `/accounts/${accountSlug}/todos.json`;

	return await requestAllPages(strategy, path);
};

/**
 * Toggle todo completion status.
 *
 * @see https://www.fakturoid.cz/api/v3/todos#toggle-todo-completion
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Updated todo or Error.
 */
const toggleTodoCompletion = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Todo>> => {
	return await request(strategy, `/accounts/${accountSlug}/todos/${id}/toggle_completion.json`, "POST");
};

export { getTodos, toggleTodoCompletion };
