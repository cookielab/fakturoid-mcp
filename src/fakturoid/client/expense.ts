import type { CreateExpense, Expense, GetExpenseFilters, UpdateExpense } from "../model/expense.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all expenses.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#expenses-index
 *
 * @param configuration
 * @param accountSlug
 * @param filters - Optional filters for the expense list
 *
 * @returns List of all expenses.
 */
const getExpenses = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	filters?: GetExpenseFilters,
): Promise<Expense[] | Error> => {
	const queryParams = new URLSearchParams(
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

	const path = `/accounts/${accountSlug}/expenses.json?${queryParams.toString()}`;

	return await requestAllPages(configuration, path);
};

/**
 * Search for expenses with a query.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#fulltext-search
 *
 * @param configuration
 * @param accountSlug
 * @param query - Search query
 * @param tags - Tags to search for
 *
 * @returns List of matching expenses.
 */
const searchExpenses = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	query?: string,
	tags?: string[],
): Promise<Expense[] | Error> => {
	const queryParams = new URLSearchParams(
		[
			["query", query],
			["tags", tags?.join(",")],
		].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/expenses/search.json?${queryParams.toString()}`;

	return await requestAllPages(configuration, path);
};

/**
 * Get a detail of an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#expense-detail
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Expense detail.
 */
const getExpenseDetail = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Expense>> => {
	return await request(configuration, `/accounts/${accountSlug}/expenses/${id}.json`, "GET");
};

/**
 * Download an expense attachment.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#download-attachment
 *
 * @param configuration
 * @param accountSlug
 * @param expenseId
 * @param attachmentId
 *
 * @returns Attachment binary data or Error.
 */
const downloadExpenseAttachment = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	expenseId: number,
	attachmentId: number,
): ReturnType<typeof request<Blob>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/expenses/${expenseId}/attachments/${attachmentId}/download`,
		"GET",
	);
};

/**
 * Fire an action on an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#expense-actions
 *
 * @param configuration
 * @param accountSlug
 * @param id
 * @param event - The action to fire ("lock" or "unlock")
 *
 * @returns Success or Error.
 */
const fireExpenseAction = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
	event: "lock" | "unlock",
): ReturnType<typeof request<undefined>> => {
	const queryParams = new URLSearchParams([["event", event]]);

	return await request(
		configuration,
		`/accounts/${accountSlug}/expenses/${id}/fire.json?${queryParams.toString()}`,
		"POST",
	);
};

/**
 * Create a new expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#create-expense
 *
 * @param configuration
 * @param accountSlug
 * @param expenseData
 *
 * @returns Created expense or Error.
 */
const createExpense = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	expenseData: CreateExpense,
): ReturnType<typeof request<Expense, CreateExpense>> => {
	return await request(configuration, `/accounts/${accountSlug}/expenses.json`, "POST", expenseData);
};

/**
 * Update an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#update-expense
 *
 * @param configuration
 * @param accountSlug
 * @param id
 * @param updateData
 *
 * @returns Updated expense or Error.
 */
const updateExpense = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
	updateData: UpdateExpense,
): ReturnType<typeof request<Expense, UpdateExpense>> => {
	return await request(configuration, `/accounts/${accountSlug}/expenses/${id}.json`, "PATCH", updateData);
};

/**
 * Delete an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expenses#delete-expense
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteExpense = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(configuration, `/accounts/${accountSlug}/expenses/${id}.json`, "DELETE");
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
