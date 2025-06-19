import type { CreateInvoice, GetInvoicesFilters, Invoice, UpdateInvoice } from "../model/invoice.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all invoices.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#invoices-index
 *
 * @param configuration
 * @param accountSlug
 * @param filters - Optional filters for the invoice list
 *
 * @returns List of all invoices.
 */
const getInvoices = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	filters?: GetInvoicesFilters,
): Promise<Invoice[] | Error> => {
	const queryParams = new URLSearchParams(
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

	const path = `/accounts/${accountSlug}/invoices.json?${queryParams.toString()}`;

	return await requestAllPages(configuration, path);
};

/**
 * Search for invoices with a query.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#fulltext-search
 *
 * @param configuration
 * @param accountSlug
 * @param query - Search query
 * @param tags - Optional array of tags to search
 *
 * @returns List of matching invoices.
 */
const searchInvoices = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	query?: string,
	tags?: string[],
): Promise<Invoice[] | Error> => {
	const queryParams = new URLSearchParams(
		[
			["query", query],
			["tags", tags?.join(",")],
		].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/invoices/search.json?${queryParams.toString()}`;

	return await requestAllPages(configuration, path);
};

/**
 * Get a detail of an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#invoice-detail
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Invoice detail.
 */
const getInvoiceDetail = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Invoice>> => {
	return await request(configuration, `/accounts/${accountSlug}/invoices/${id}.json`, "GET");
};

/**
 * Download invoice PDF.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#download-invoice-pdf
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns PDF blob or Error.
 */
const downloadInvoicePDF = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): Promise<Blob | Error> => {
	const response = await request<Blob>(
		configuration,
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
 * @param configuration
 * @param accountSlug
 * @param invoiceId
 * @param attachmentId
 *
 * @returns Attachment blob or Error.
 */
const downloadInvoiceAttachment = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	invoiceId: number,
	attachmentId: number,
): Promise<Blob | Error> => {
	const response = await request<Blob>(
		configuration,
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
 * @param configuration
 * @param accountSlug
 * @param id
 * @param event - Action to fire
 *
 * @returns Success or Error.
 */
const fireInvoiceAction = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
	event: "mark_as_sent" | "cancel" | "undo_cancel" | "lock" | "unlock" | "mark_as_uncollectible" | "undo_uncollectible",
): Promise<undefined | Error> => {
	const response = await request<undefined>(
		configuration,
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
 * @param configuration
 * @param accountSlug
 * @param invoiceData
 *
 * @returns Created invoice or Error.
 */
const createInvoice = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	invoiceData: CreateInvoice,
): ReturnType<typeof request<Invoice, CreateInvoice>> => {
	return await request(configuration, `/accounts/${accountSlug}/invoices.json`, "POST", invoiceData);
};

/**
 * Update an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#update-invoice
 *
 * @param configuration
 * @param accountSlug
 * @param id
 * @param updateData
 *
 * @returns Updated invoice or Error.
 */
const updateInvoice = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
	updateData: UpdateInvoice,
): ReturnType<typeof request<Invoice, UpdateInvoice>> => {
	return await request(configuration, `/accounts/${accountSlug}/invoices/${id}.json`, "PATCH", updateData);
};

/**
 * Delete an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoices#delete-invoice
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteInvoice = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(configuration, `/accounts/${accountSlug}/invoices/${id}.json`, "DELETE");
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
