import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import { getTodos, toggleTodoCompletion } from "../../../src/fakturoid/client/todo";
import { createTodo } from "../../factory/todo.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Todo", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Todos", async () => {
		const todos = [createTodo("todo-1"), createTodo("todo-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(todos));

		const result = await getTodos(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(todos)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/todos.json?page=0", {
			body: null,
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "GET",
		});
	});

	test("Toggle Todo Completion", async () => {
		const todo = createTodo("todo-completed");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(todo));

		const result = await toggleTodoCompletion(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(todo)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/todos/123/toggle_completion.json",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "POST",
			},
		);
	});
});
