import type { InvoicePayment, InvoicePaymentParams, Pagination } from '../models.js';
import { withRetry, request, accountEndpoint } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getInvoicePayments(
  config: FakturoidClientConfig,
  invoiceId: number,
  params?: Pagination
): Promise<InvoicePayment[]> {
  const queryParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });
  }
  return withRetry(() =>
    request<InvoicePayment[]>(
      config,
      accountEndpoint(config, `/invoices/${invoiceId}/payments.json`),
      'GET',
      undefined,
      queryParams
    )
  );
}

export async function getInvoicePayment(
  config: FakturoidClientConfig,
  invoiceId: number,
  paymentId: number
): Promise<InvoicePayment> {
  return withRetry(() =>
    request<InvoicePayment>(
      config,
      accountEndpoint(config, `/invoices/${invoiceId}/payments/${paymentId}.json`)
    )
  );
}

export async function createInvoicePayment(
  config: FakturoidClientConfig,
  invoiceId: number,
  payment: InvoicePaymentParams
): Promise<InvoicePayment> {
  return withRetry(() =>
    request<InvoicePayment>(
      config,
      accountEndpoint(config, `/invoices/${invoiceId}/payments.json`),
      'POST',
      payment
    )
  );
}

export async function updateInvoicePayment(
  config: FakturoidClientConfig,
  invoiceId: number,
  paymentId: number,
  payment: Partial<InvoicePaymentParams>
): Promise<InvoicePayment> {
  return withRetry(() =>
    request<InvoicePayment>(
      config,
      accountEndpoint(config, `/invoices/${invoiceId}/payments/${paymentId}.json`),
      'PATCH',
      payment
    )
  );
}

export async function deleteInvoicePayment(
  config: FakturoidClientConfig,
  invoiceId: number,
  paymentId: number
): Promise<void> {
  return withRetry(() =>
    request<void>(
      config,
      accountEndpoint(config, `/invoices/${invoiceId}/payments/${paymentId}.json`),
      'DELETE'
    )
  );
} 