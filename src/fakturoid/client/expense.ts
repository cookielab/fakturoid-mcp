import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { CreateExpense, Expense, GetExpenseFilters, UpdateExpense } from "../model/expense.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all expenses.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#expenses-index
 *
 * @param strategy
 * @param accountSlug
 * @param filters - Optional filters for the expense list
 *
 * @returns List of all expenses.
 */
const getExpenses = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	filters?: GetExpenseFilters,
): Promise<Expense[] | Error> => {
	const queryParams = Object.fromEntries(
		[
			["since", filters?.since],
			["updated_since", filters?.updated_since],
			["subject_id", filters?.subject_id?.toString()],
			["custom_id", filters?.custom_id],
			["number", filters?.number],
			["variable_symbol", filters?.variable_symbol],
			["status", filters?.status],
		].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/expenses.json`;

	return await requestAllPages(strategy, path, queryParams);
};

/**
 * Search for expenses with a query.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#fulltext-search
 *
 * @param strategy
 * @param accountSlug
 * @param query - Search query
 * @param tags - Tags to search for
 *
 * @returns List of matching expenses.
 */
const searchExpenses = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	query?: string,
	tags?: string[],
): Promise<Expense[] | Error> => {
	const queryParams = Object.fromEntries(
		[
			["query", query],
			["tags", tags?.join(",")],
		].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/expenses/search.json`;

	return await requestAllPages(strategy, path, queryParams);
};

/**
 * Get a detail of an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#expense-detail
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Expense detail.
 */
const getExpenseDetail = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Expense>> => {
	return await request(strategy, `/accounts/${accountSlug}/expenses/${id}.json`, "GET");
};

/**
 * Download an expense attachment.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#download-attachment
 *
 * @param strategy
 * @param accountSlug
 * @param expenseId
 * @param attachmentId
 *
 * @returns Attachment binary data or Error.
 */
const downloadExpenseAttachment = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	expenseId: number,
	attachmentId: number,
): ReturnType<typeof request<Blob>> => {
	return await request(
		strategy,
		`/accounts/${accountSlug}/expenses/${expenseId}/attachments/${attachmentId}/download`,
		"GET",
	);
};

/**
 * Fire an action on an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#expense-actions
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param event - The action to fire ("lock" or "unlock")
 *
 * @returns Success or Error.
 */
const fireExpenseAction = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	event: "lock" | "unlock",
): ReturnType<typeof request<undefined>> => {
	const queryParams = Object.fromEntries([["event", event]]);

	return await request(strategy, `/accounts/${accountSlug}/expenses/${id}/fire.json`, "POST", undefined, queryParams);
};

/**
 * Create a new expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#create-expense
 *
 * @param strategy
 * @param accountSlug
 * @param expenseData
 *
 * @returns Created expense or Error.
 */
const createExpense = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	expenseData: CreateExpense,
): ReturnType<typeof request<Expense>> => {
	return await request(strategy, `/accounts/${accountSlug}/expenses.json`, "POST", expenseData);
};

/**
 * Update an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#update-expense
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param updateData
 *
 * @returns Updated expense or Error.
 */
const updateExpense = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	updateData: UpdateExpense,
): ReturnType<typeof request<Expense>> => {
	return await request(strategy, `/accounts/${accountSlug}/expenses/${id}.json`, "PATCH", updateData);
};

/**
 * Delete an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#delete-expense
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteExpense = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/expenses/${id}.json`, "DELETE");
};

export {
	getExpenses,
	searchExpenses,
	getExpenseDetail,
	downloadExpenseAttachment,
	fireExpenseAction,
	createExpense,
	updateExpense,
	deleteExpense,
};
