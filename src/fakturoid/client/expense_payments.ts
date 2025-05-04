import type { ExpensePayment, ExpensePaymentParams, Pagination } from '../models.js';
import { withRetry, request, accountEndpoint } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getExpensePayments(
  config: FakturoidClientConfig,
  expenseId: number,
  params?: Pagination
): Promise<ExpensePayment[]> {
  const queryParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });
  }
  return withRetry(() =>
    request<ExpensePayment[]>(
      config,
      accountEndpoint(config, `/expenses/${expenseId}/payments.json`),
      'GET',
      undefined,
      queryParams
    )
  );
}

export async function getExpensePayment(
  config: FakturoidClientConfig,
  expenseId: number,
  paymentId: number
): Promise<ExpensePayment> {
  return withRetry(() =>
    request<ExpensePayment>(
      config,
      accountEndpoint(config, `/expenses/${expenseId}/payments/${paymentId}.json`)
    )
  );
}

export async function createExpensePayment(
  config: FakturoidClientConfig,
  expenseId: number,
  payment: ExpensePaymentParams
): Promise<ExpensePayment> {
  return withRetry(() =>
    request<ExpensePayment>(
      config,
      accountEndpoint(config, `/expenses/${expenseId}/payments.json`),
      'POST',
      payment
    )
  );
}

export async function updateExpensePayment(
  config: FakturoidClientConfig,
  expenseId: number,
  paymentId: number,
  payment: Partial<ExpensePaymentParams>
): Promise<ExpensePayment> {
  return withRetry(() =>
    request<ExpensePayment>(
      config,
      accountEndpoint(config, `/expenses/${expenseId}/payments/${paymentId}.json`),
      'PATCH',
      payment
    )
  );
}

export async function deleteExpensePayment(
  config: FakturoidClientConfig,
  expenseId: number,
  paymentId: number
): Promise<void> {
  return withRetry(() =>
    request<void>(
      config,
      accountEndpoint(config, `/expenses/${expenseId}/payments/${paymentId}.json`),
      'DELETE'
    )
  );
} 