import type { CreateExpensePayment, ExpensePayment } from "../model/expensePayment.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request } from "./request.ts";

/**
 * Create a payment for an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expense-payments#create-payment
 *
 * @param configuration
 * @param accountSlug
 * @param expenseId
 * @param paymentData
 *
 * @returns Created expense payment or Error.
 */
const createExpensePayment = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	expenseId: number,
	paymentData: CreateExpensePayment,
): ReturnType<typeof request<ExpensePayment, CreateExpensePayment>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/expenses/${expenseId}/payments.json`,
		"POST",
		paymentData,
	);
};

/**
 * Delete an expense payment.
 *
 * @see https://www.fakturoid.cz/api/v3/expense-payments#delete-expense-payment
 *
 * @param configuration
 * @param accountSlug
 * @param expenseId
 * @param paymentId
 *
 * @returns Success or Error.
 */
const deleteExpensePayment = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	expenseId: number,
	paymentId: number,
): ReturnType<typeof request<undefined>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/expenses/${expenseId}/payments/${paymentId}.json`,
		"DELETE",
	);
};

export { createExpensePayment, deleteExpensePayment };
