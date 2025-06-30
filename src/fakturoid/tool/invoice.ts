import { z } from "zod/v4";
import { GetInvoicesFiltersSchema } from "../model/invoice.ts";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInvoices = createTool(
	"fakturoid_get_invoices",
	async (client, { filters }) => {
		const invoices = await client.getInvoices(filters);

		return {
			content: [{ text: JSON.stringify(invoices, null, 2), type: "text" }],
		};
	},
	z.object({
		filters: GetInvoicesFiltersSchema.optional(),
	}),
);

const searchInvoices = createTool(
	"fakturoid_search_invoices",
	async (client, { query, tags }) => {
		const invoices = await client.searchInvoices(query, tags);

		return {
			content: [{ text: JSON.stringify(invoices, null, 2), type: "text" }],
		};
	},
	z.object({
		query: z.string().optional(),
		tags: z.array(z.string()).optional(),
	}),
);

const getInvoiceDetail = createTool(
	"fakturoid_get_invoice_detail",
	async (client, { id }) => {
		const invoice = await client.getInvoiceDetail(id);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const downloadInvoicePDF = createTool(
	"fakturoid_download_invoice_pdf",
	async (client, { id }) => {
		const pdf = await client.downloadInvoicePDF(id);

		return {
			content: [{ text: JSON.stringify(pdf, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const downloadInvoiceAttachment = createTool(
	"fakturoid_download_invoice_attachment",
	async (client, { invoiceId, attachmentId }) => {
		const attachment = await client.downloadInvoiceAttachment(invoiceId, attachmentId);

		return {
			content: [{ text: JSON.stringify(attachment, null, 2), type: "text" }],
		};
	},
	z.object({
		attachmentId: z.number(),
		invoiceId: z.number(),
	}),
);

const fireInvoiceAction = createTool(
	"fakturoid_fire_invoice_action",
	async (client, { id, event }) => {
		const result = await client.fireInvoiceAction(id, event);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		event: z.enum([
			"mark_as_sent",
			"cancel",
			"undo_cancel",
			"lock",
			"unlock",
			"mark_as_uncollectible",
			"undo_uncollectible",
		]),
		id: z.number(),
	}),
);

const createInvoice = createTool(
	"fakturoid_create_invoice",
	async (client, { invoiceData }) => {
		const invoice = await client.createInvoice(invoiceData);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	z.object({
		invoiceData: z.any(), // Using z.any() since CreateInvoice type is not available here
	}),
);

const updateInvoice = createTool(
	"fakturoid_update_invoice",
	async (client, { id, updateData }) => {
		const invoice = await client.updateInvoice(id, updateData);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		updateData: z.any(), // Using z.any() since UpdateInvoice type is not available here
	}),
);

const deleteInvoice = createTool(
	"fakturoid_delete_invoice",
	async (client, { id }) => {
		await client.deleteInvoice(id);

		return {
			content: [{ text: "Invoice deleted successfully", type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const invoice = [
	getInvoices,
	searchInvoices,
	getInvoiceDetail,
	downloadInvoicePDF,
	downloadInvoiceAttachment,
	fireInvoiceAction,
	createInvoice,
	updateInvoice,
	deleteInvoice,
] as const satisfies ServerToolCreator[];

export { invoice };
