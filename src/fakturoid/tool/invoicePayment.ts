import { z } from "zod/v3";
import { CreateInvoicePaymentSchema } from "../model/invoicePayment.js";
import { createTool, type ServerToolCreator } from "./common.js";

const createInvoicePayment = createTool(
	"fakturoid_create_invoice_payment",
	"Create Invoice Payment",
	"Create a new payment record for an invoice",
	async (client, { invoiceId, paymentData }) => {
		const payment = await client.createInvoicePayment(invoiceId, paymentData);

		return {
			content: [{ text: JSON.stringify(payment, null, 2), type: "text" }],
		};
	},
	{
		invoiceId: z.number(),
		paymentData: CreateInvoicePaymentSchema,
	},
);

const createTaxDocument = createTool(
	"fakturoid_create_tax_document",
	"Create Tax Document",
	"Create a tax document for a payment (required for cash payments in some countries)",
	async (client, { invoiceId, paymentId }) => {
		const taxDocument = await client.createTaxDocument(invoiceId, paymentId);

		return {
			content: [{ text: JSON.stringify(taxDocument, null, 2), type: "text" }],
		};
	},
	{
		invoiceId: z.number(),
		paymentId: z.number(),
	},
);

const deleteInvoicePayment = createTool(
	"fakturoid_delete_invoice_payment",
	"Delete Invoice Payment",
	"Delete a payment record from an invoice",
	async (client, { invoiceId, paymentId }) => {
		await client.deleteInvoicePayment(invoiceId, paymentId);

		return {
			content: [{ text: "Invoice payment deleted successfully", type: "text" }],
		};
	},
	{
		invoiceId: z.number(),
		paymentId: z.number(),
	},
);

const invoicePayment = [
	createInvoicePayment,
	createTaxDocument,
	deleteInvoicePayment,
] as const satisfies ServerToolCreator[];

export { invoicePayment };
