import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { CreateInvoicePayment, InvoicePayment } from "../model/invoicePayment.ts";
import { request } from "./request.ts";

/**
 * Create a new payment for an invoice.
 *
 * @see https://www.fakturoid.cz/api/v3/invoice-payments#create-payment
 *
 * @param strategy
 * @param accountSlug
 * @param invoiceId
 * @param paymentData
 *
 * @returns Created payment or Error.
 */
const createInvoicePayment = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	invoiceId: number,
	paymentData: CreateInvoicePayment,
): ReturnType<typeof request<InvoicePayment, CreateInvoicePayment>> => {
	return await request(strategy, `/accounts/${accountSlug}/invoices/${invoiceId}/payments.json`, "POST", paymentData);
};

/**
 * Create a tax document for a payment.
 *
 * @see https://www.fakturoid.cz/api/v3/invoice-payments#create-tax-document
 *
 * @param strategy
 * @param accountSlug
 * @param invoiceId
 * @param paymentId
 *
 * @returns Updated payment with tax document ID or Error.
 */
const createTaxDocument = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	invoiceId: number,
	paymentId: number,
): ReturnType<typeof request<InvoicePayment>> => {
	return await request(
		strategy,
		`/accounts/${accountSlug}/invoices/${invoiceId}/payments/${paymentId}/create_tax_document.json`,
		"POST",
	);
};

/**
 * Delete an invoice payment.
 *
 * @see https://www.fakturoid.cz/api/v3/invoice-payments#delete-invoice-payment
 *
 * @param strategy
 * @param accountSlug
 * @param invoiceId
 * @param paymentId
 *
 * @returns Success or Error.
 */
const deleteInvoicePayment = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	invoiceId: number,
	paymentId: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/invoices/${invoiceId}/payments/${paymentId}.json`, "DELETE");
};

export { createInvoicePayment, createTaxDocument, deleteInvoicePayment };
