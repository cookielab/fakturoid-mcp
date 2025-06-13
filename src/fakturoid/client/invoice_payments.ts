import type { InvoicePayment } from "../models/invoicePayment.ts";
import type { InvoicePaymentParams } from "../models/invoicePaymentParams.ts";
import type { Pagination } from "../models/pagination.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { accountEndpoint, request, withRetry } from "./_shared.ts";

export function getInvoicePayments(
	config: FakturoidClientConfig,
	invoiceId: number,
	params?: Pagination,
): Promise<InvoicePayment[]> {
	const queryParams: Record<string, string> = {};
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				queryParams[key] = String(value);
			}
		}
	}

	return withRetry(() =>
		request<InvoicePayment[]>(
			config,
			accountEndpoint(config, `/invoices/${invoiceId}/payments.json`),
			"GET",
			undefined,
			queryParams,
		),
	);
}

export function getInvoicePayment(
	config: FakturoidClientConfig,
	invoiceId: number,
	paymentId: number,
): Promise<InvoicePayment> {
	return withRetry(() =>
		request<InvoicePayment>(config, accountEndpoint(config, `/invoices/${invoiceId}/payments/${paymentId}.json`)),
	);
}

export function createInvoicePayment(
	config: FakturoidClientConfig,
	invoiceId: number,
	payment: InvoicePaymentParams,
): Promise<InvoicePayment> {
	return withRetry(() =>
		request<InvoicePayment, InvoicePaymentParams>(
			config,
			accountEndpoint(config, `/invoices/${invoiceId}/payments.json`),
			"POST",
			payment,
		),
	);
}

export function updateInvoicePayment(
	config: FakturoidClientConfig,
	invoiceId: number,
	paymentId: number,
	payment: Partial<InvoicePaymentParams>,
): Promise<InvoicePayment> {
	return withRetry(() =>
		request<InvoicePayment, Partial<InvoicePaymentParams>>(
			config,
			accountEndpoint(config, `/invoices/${invoiceId}/payments/${paymentId}.json`),
			"PATCH",
			payment,
		),
	);
}

export function deleteInvoicePayment(
	config: FakturoidClientConfig,
	invoiceId: number,
	paymentId: number,
): Promise<void> {
	return withRetry(() =>
		request<void>(config, accountEndpoint(config, `/invoices/${invoiceId}/payments/${paymentId}.json`), "DELETE"),
	);
}
