import type { Expense, ExpenseParams } from "../models/expenses.ts";
import type { Pagination } from "../models/pagination.ts";
import type { FakturoidClientConfig } from "./_shared.js";
import { accountEndpoint, request, withRetry } from "./_shared.js";

export interface GetExpensesParameters extends Pagination {
	since?: string;
	updated_since?: string;
	until?: string;
	updated_until?: string;
	status?: "open" | "paid" | "overdue";
}

export function getExpenses(config: FakturoidClientConfig, params?: GetExpensesParameters): Promise<Expense[]> {
	const queryParams: Record<string, string> = {};
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				queryParams[key] = String(value);
			}
		}
	}

	return withRetry(() =>
		request<Expense[]>(config, accountEndpoint(config, "/expenses.json"), "GET", undefined, queryParams),
	);
}

export function getExpense(config: FakturoidClientConfig, id: number): Promise<Expense> {
	return withRetry(() => request<Expense>(config, accountEndpoint(config, `/expenses/${id}.json`)));
}

export function createExpense(config: FakturoidClientConfig, expense: ExpenseParams): Promise<Expense> {
	return withRetry(() => request<Expense>(config, accountEndpoint(config, "/expenses.json"), "POST", expense));
}

export function updateExpense(
	config: FakturoidClientConfig,
	id: number,
	expense: Partial<ExpenseParams>,
): Promise<Expense> {
	return withRetry(() => request<Expense>(config, accountEndpoint(config, `/expenses/${id}.json`), "PATCH", expense));
}

export function deleteExpense(config: FakturoidClientConfig, id: number): Promise<void> {
	return withRetry(() => request<void>(config, accountEndpoint(config, `/expenses/${id}.json`), "DELETE"));
}
