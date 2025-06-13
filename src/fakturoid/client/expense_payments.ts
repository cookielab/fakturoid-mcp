import type { ExpensePayment } from "../models/expensePayment.ts";
import type { ExpensePaymentParams } from "../models/expensePaymentParams.ts";
import type { Pagination } from "../models/pagination.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { accountEndpoint, request, withRetry } from "./_shared.ts";

export function getExpensePayments(
	config: FakturoidClientConfig,
	expenseId: number,
	params?: Pagination,
): Promise<ExpensePayment[]> {
	const queryParams: Record<string, string> = {};
	if (params && params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				queryParams[key] = String(value);
			}
		}
	}
	return withRetry(() =>
		request<ExpensePayment[]>(
			config,
			accountEndpoint(config, `/expenses/${expenseId}/payments.json`),
			"GET",
			undefined,
			queryParams,
		),
	);
}

export function getExpensePayment(
	config: FakturoidClientConfig,
	expenseId: number,
	paymentId: number,
): Promise<ExpensePayment> {
	return withRetry(() =>
		request<ExpensePayment>(config, accountEndpoint(config, `/expenses/${expenseId}/payments/${paymentId}.json`)),
	);
}

export function createExpensePayment(
	config: FakturoidClientConfig,
	expenseId: number,
	payment: ExpensePaymentParams,
): Promise<ExpensePayment> {
	return withRetry(() =>
		request<ExpensePayment, ExpensePaymentParams>(
			config,
			accountEndpoint(config, `/expenses/${expenseId}/payments.json`),
			"POST",
			payment,
		),
	);
}

export function updateExpensePayment(
	config: FakturoidClientConfig,
	expenseId: number,
	paymentId: number,
	payment: Partial<ExpensePaymentParams>,
): Promise<ExpensePayment> {
	return withRetry(() =>
		request<ExpensePayment, Partial<ExpensePaymentParams>>(
			config,
			accountEndpoint(config, `/expenses/${expenseId}/payments/${paymentId}.json`),
			"PATCH",
			payment,
		),
	);
}

export function deleteExpensePayment(
	config: FakturoidClientConfig,
	expenseId: number,
	paymentId: number,
): Promise<void> {
	return withRetry(() =>
		request<void>(config, accountEndpoint(config, `/expenses/${expenseId}/payments/${paymentId}.json`), "DELETE"),
	);
}
