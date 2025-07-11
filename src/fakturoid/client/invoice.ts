import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { CreateInvoice, GetInvoicesFilters, Invoice, UpdateInvoice } from "../model/invoice.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all invoices.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#invoices-index
 *
 * @param strategy
 * @param accountSlug
 * @param filters - Optional filters for the invoice list
 *
 * @returns List of all invoices.
 */
const getInvoices = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	filters?: GetInvoicesFilters,
): Promise<Invoice[] | Error> => {
	const queryParams = Object.fromEntries(
		[
			["since", filters?.since],
			["until", filters?.until],
			["updated_since", filters?.updated_since],
			["updated_until", filters?.updated_until],
			["subject_id", filters?.subject_id?.toString()],
			["custom_id", filters?.custom_id],
			["number", filters?.number],
			["status", filters?.status],
			["document_type", filters?.document_type],
		].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/invoices.json`;

	return await requestAllPages(strategy, path, queryParams);
};

/**
 * Search for invoices with a query.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#fulltext-search
 *
 * @param strategy
 * @param accountSlug
 * @param query - Search query
 * @param tags - Optional array of tags to search
 *
 * @returns List of matching invoices.
 */
const searchInvoices = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	query?: string,
	tags?: string[],
): Promise<Invoice[] | Error> => {
	const queryParams = Object.fromEntries(
		[
			["query", query],
			["tags", tags?.join(",")],
		].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/invoices/search.json`;

	return await requestAllPages(strategy, path, queryParams);
};

/**
 * Get a detail of an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#invoice-detail
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Invoice detail.
 */
const getInvoiceDetail = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): Promise<Invoice | Error> => {
	return await request(strategy, `/accounts/${accountSlug}/invoices/${id}.json`, "GET");
};

/**
 * Download invoice PDF.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#download-invoice-pdf
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns PDF blob or Error.
 */
const downloadInvoicePDF = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): Promise<Blob | Error> => {
	const response = await request<Blob>(
		strategy,
		`/accounts/${accountSlug}/invoices/${id}/download.pdf`,
		"GET",
		undefined,
		{ responseType: "blob" },
	);

	return response;
};

/**
 * Download invoice attachment.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#download-attachment
 *
 * @param strategy
 * @param accountSlug
 * @param invoiceId
 * @param attachmentId
 *
 * @returns Attachment blob or Error.
 */
const downloadInvoiceAttachment = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	invoiceId: number,
	attachmentId: number,
): Promise<Blob | Error> => {
	const response = await request<Blob>(
		strategy,
		`/accounts/${accountSlug}/invoices/${invoiceId}/attachments/${attachmentId}/download`,
		"GET",
		undefined,
		{ responseType: "blob" },
	);

	return response;
};

/**
 * Fire an action on an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#invoice-actions
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param event - Action to fire
 *
 * @returns Success or Error.
 */
const fireInvoiceAction = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	event: "mark_as_sent" | "cancel" | "undo_cancel" | "lock" | "unlock" | "mark_as_uncollectible" | "undo_uncollectible",
): Promise<undefined | Error> => {
	const response = await request<undefined>(
		strategy,
		`/accounts/${accountSlug}/invoices/${id}/fire.json?event=${event}`,
		"POST",
	);

	return response;
};

/**
 * Create a new invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#create-invoice
 *
 * @param strategy
 * @param accountSlug
 * @param invoiceData
 *
 * @returns Created invoice or Error.
 */
const createInvoice = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	invoiceData: CreateInvoice,
): ReturnType<typeof request<Invoice, CreateInvoice>> => {
	return await request(strategy, `/accounts/${accountSlug}/invoices.json`, "POST", invoiceData);
};

/**
 * Update an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#update-invoice
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param updateData
 *
 * @returns Updated invoice or Error.
 */
const updateInvoice = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	updateData: UpdateInvoice,
): ReturnType<typeof request<Invoice, UpdateInvoice>> => {
	return await request(strategy, `/accounts/${accountSlug}/invoices/${id}.json`, "PATCH", updateData);
};

/**
 * Delete an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#delete-invoice
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteInvoice = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/invoices/${id}.json`, "DELETE");
};

export {
	getInvoices,
	searchInvoices,
	getInvoiceDetail,
	downloadInvoicePDF,
	downloadInvoiceAttachment,
	fireInvoiceAction,
	createInvoice,
	updateInvoice,
	deleteInvoice,
};
