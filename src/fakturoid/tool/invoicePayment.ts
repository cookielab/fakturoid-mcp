import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const createInvoicePayment = createTool(
	"fakturoid_create_invoice_payment",
	async (client, { accountSlug, invoiceId, paymentData }) => {
		const payment = await client.createInvoicePayment(accountSlug, invoiceId, paymentData);

		return {
			content: [{ text: JSON.stringify(payment, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		invoiceId: z.number(),
		paymentData: z.any(), // Using z.any() since CreateInvoicePayment type is not available here
	}),
);

const createTaxDocument = createTool(
	"fakturoid_create_tax_document",
	async (client, { accountSlug, invoiceId, paymentId }) => {
		const taxDocument = await client.createTaxDocument(accountSlug, invoiceId, paymentId);

		return {
			content: [{ text: JSON.stringify(taxDocument, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		invoiceId: z.number(),
		paymentId: z.number(),
	}),
);

const deleteInvoicePayment = createTool(
	"fakturoid_delete_invoice_payment",
	async (client, { accountSlug, invoiceId, paymentId }) => {
		await client.deleteInvoicePayment(accountSlug, invoiceId, paymentId);

		return {
			content: [{ text: "Invoice payment deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		invoiceId: z.number(),
		paymentId: z.number(),
	}),
);

const invoicePayment = [
	createInvoicePayment,
	createTaxDocument,
	deleteInvoicePayment,
] as const satisfies ServerToolCreator[];

export { invoicePayment };
