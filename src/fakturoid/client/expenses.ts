import type { Expense, ExpenseParams, Pagination } from '../models.js';
import { withRetry, request, accountEndpoint } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getExpenses(
  config: FakturoidClientConfig,
  params?: Pagination & {
    since?: string;
    updated_since?: string;
    until?: string;
    updated_until?: string;
    status?: 'open' | 'paid' | 'overdue';
  }
): Promise<Expense[]> {
  const queryParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });
  }
  return withRetry(() =>
    request<Expense[]>(
      config,
      accountEndpoint(config, '/expenses.json'),
      'GET',
      undefined,
      queryParams
    )
  );
}

export async function getExpense(config: FakturoidClientConfig, id: number): Promise<Expense> {
  return withRetry(() =>
    request<Expense>(config, accountEndpoint(config, `/expenses/${id}.json`))
  );
}

export async function createExpense(config: FakturoidClientConfig, expense: ExpenseParams): Promise<Expense> {
  return withRetry(() =>
    request<Expense>(config, accountEndpoint(config, '/expenses.json'), 'POST', expense)
  );
}

export async function updateExpense(
  config: FakturoidClientConfig,
  id: number,
  expense: Partial<ExpenseParams>
): Promise<Expense> {
  return withRetry(() =>
    request<Expense>(config, accountEndpoint(config, `/expenses/${id}.json`), 'PATCH', expense)
  );
}

export async function deleteExpense(config: FakturoidClientConfig, id: number): Promise<void> {
  return withRetry(() =>
    request<void>(config, accountEndpoint(config, `/expenses/${id}.json`), 'DELETE')
  );
} 