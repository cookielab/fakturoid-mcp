import type { Invoice, InvoiceParams, Pagination } from '../models.js';
import { withRetry, request, accountEndpoint } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getInvoices(
  config: FakturoidClientConfig,
  params?: Pagination & {
    since?: string;
    updated_since?: string;
    until?: string;
    updated_until?: string;
    status?: 'open' | 'paid' | 'overdue' | 'cancelled';
    subject_id?: number;
  }
): Promise<Invoice[]> {
  const queryParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });
  }
  return withRetry(() =>
    request<Invoice[]>(
      config,
      accountEndpoint(config, '/invoices.json'),
      'GET',
      undefined,
      queryParams
    )
  );
}

export async function getInvoice(config: FakturoidClientConfig, id: number): Promise<Invoice> {
  return withRetry(() =>
    request<Invoice>(config, accountEndpoint(config, `/invoices/${id}.json`))
  );
}

export async function createInvoice(config: FakturoidClientConfig, invoice: InvoiceParams): Promise<Invoice> {
  return withRetry(() =>
    request<Invoice>(config, accountEndpoint(config, '/invoices.json'), 'POST', invoice)
  );
}

export async function updateInvoice(
  config: FakturoidClientConfig,
  id: number,
  invoice: Partial<InvoiceParams>
): Promise<Invoice> {
  return withRetry(() =>
    request<Invoice>(config, accountEndpoint(config, `/invoices/${id}.json`), 'PATCH', invoice)
  );
}

export async function deleteInvoice(config: FakturoidClientConfig, id: number): Promise<void> {
  return withRetry(() =>
    request<void>(config, accountEndpoint(config, `/invoices/${id}.json`), 'DELETE')
  );
} 