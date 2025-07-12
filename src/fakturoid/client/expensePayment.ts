import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { CreateExpensePayment, ExpensePayment } from "../model/expensePayment.js";
import { request } from "./request.js";

/**
 * Create a payment for an expense.
 *
 * @see https://www.fakturoid.cz/api/v3/expense-payments#create-payment
 *
 * @param strategy
 * @param accountSlug
 * @param expenseId
 * @param paymentData
 *
 * @returns Created expense payment or Error.
 */
const createExpensePayment = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	expenseId: number,
	paymentData: CreateExpensePayment,
): ReturnType<typeof request<ExpensePayment>> => {
	return await request(strategy, `/accounts/${accountSlug}/expenses/${expenseId}/payments.json`, "POST", paymentData);
};

/**
 * Delete an expense payment.
 *
 * @see https://www.fakturoid.cz/api/v3/expense-payments#delete-expense-payment
 *
 * @param strategy
 * @param accountSlug
 * @param expenseId
 * @param paymentId
 *
 * @returns Success or Error.
 */
const deleteExpensePayment = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	expenseId: number,
	paymentId: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/expenses/${expenseId}/payments/${paymentId}.json`, "DELETE");
};

export { createExpensePayment, deleteExpensePayment };
