import type { Invoice, InvoiceParams } from "../models/invoices.ts";
import type { Pagination } from "../models/pagination.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { accountEndpoint, request, withRetry } from "./_shared.ts";

export interface GetInvoicesParameters extends Pagination {
	since?: string;
	updated_since?: string;
	until?: string;
	updated_until?: string;
	status?: "open" | "paid" | "overdue" | "cancelled";
	subject_id?: number;
}

export function getInvoices(config: FakturoidClientConfig, params?: GetInvoicesParameters): Promise<Invoice[]> {
	const queryParams: Record<string, string> = {};
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				queryParams[key] = String(value);
			}
		}
	}
	return withRetry(() =>
		request<Invoice[]>(config, accountEndpoint(config, "/invoices.json"), "GET", undefined, queryParams),
	);
}

export function getInvoice(config: FakturoidClientConfig, id: number): Promise<Invoice> {
	return withRetry(() => request<Invoice>(config, accountEndpoint(config, `/invoices/${id}.json`)));
}

export function createInvoice(config: FakturoidClientConfig, invoice: InvoiceParams): Promise<Invoice> {
	return withRetry(() =>
		request<Invoice, InvoiceParams>(config, accountEndpoint(config, "/invoices.json"), "POST", invoice),
	);
}

export function updateInvoice(
	config: FakturoidClientConfig,
	id: number,
	invoice: Partial<InvoiceParams>,
): Promise<Invoice> {
	return withRetry(() =>
		request<Invoice, Partial<InvoiceParams>>(config, accountEndpoint(config, `/invoices/${id}.json`), "PATCH", invoice),
	);
}

export function deleteInvoice(config: FakturoidClientConfig, id: number): Promise<void> {
	return withRetry(() => request<void>(config, accountEndpoint(config, `/invoices/${id}.json`), "DELETE"));
}
