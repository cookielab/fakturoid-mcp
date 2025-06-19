import { z } from "zod/v4";
import { GetInvoicesFiltersSchema } from "../model/invoice.ts";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInvoices = createTool(
	"fakturoid_get_invoices",
	async (client, { accountSlug, filters }) => {
		const invoices = await client.getInvoices(accountSlug, filters);

		return {
			content: [{ text: JSON.stringify(invoices, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		filters: GetInvoicesFiltersSchema.optional(),
	}),
);

const searchInvoices = createTool(
	"fakturoid_search_invoices",
	async (client, { accountSlug, query, tags }) => {
		const invoices = await client.searchInvoices(accountSlug, query, tags);

		return {
			content: [{ text: JSON.stringify(invoices, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		query: z.string().optional(),
		tags: z.array(z.string()).optional(),
	}),
);

const getInvoiceDetail = createTool(
	"fakturoid_get_invoice_detail",
	async (client, { accountSlug, id }) => {
		const invoice = await client.getInvoiceDetail(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const downloadInvoicePDF = createTool(
	"fakturoid_download_invoice_pdf",
	async (client, { accountSlug, id }) => {
		const pdf = await client.downloadInvoicePDF(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(pdf, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const downloadInvoiceAttachment = createTool(
	"fakturoid_download_invoice_attachment",
	async (client, { accountSlug, invoiceId, attachmentId }) => {
		const attachment = await client.downloadInvoiceAttachment(accountSlug, invoiceId, attachmentId);

		return {
			content: [{ text: JSON.stringify(attachment, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		attachmentId: z.number(),
		invoiceId: z.number(),
	}),
);

const fireInvoiceAction = createTool(
	"fakturoid_fire_invoice_action",
	async (client, { accountSlug, id, event }) => {
		const result = await client.fireInvoiceAction(accountSlug, id, event);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
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
	async (client, { accountSlug, invoiceData }) => {
		const invoice = await client.createInvoice(accountSlug, invoiceData);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		invoiceData: z.any(), // Using z.any() since CreateInvoice type is not available here
	}),
);

const updateInvoice = createTool(
	"fakturoid_update_invoice",
	async (client, { accountSlug, id, updateData }) => {
		const invoice = await client.updateInvoice(accountSlug, id, updateData);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
		updateData: z.any(), // Using z.any() since UpdateInvoice type is not available here
	}),
);

const deleteInvoice = createTool(
	"fakturoid_delete_invoice",
	async (client, { accountSlug, id }) => {
		await client.deleteInvoice(accountSlug, id);

		return {
			content: [{ text: "Invoice deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
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
