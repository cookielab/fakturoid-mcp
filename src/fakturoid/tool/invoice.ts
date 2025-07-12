import { z } from "zod/v3";
import { CreateInvoiceSchema, GetInvoicesFiltersSchema, UpdateInvoiceSchema } from "../model/invoice.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getInvoices = createTool(
	"fakturoid_get_invoices",
	"Get Invoices",
	"Retrieve a list of invoices with optional filtering by status, date range, customer, and other criteria",
	async (client, { filters }) => {
		const invoices = await client.getInvoices(filters);

		return {
			content: [{ text: JSON.stringify(invoices, null, 2), type: "text" }],
		};
	},
	{
		filters: GetInvoicesFiltersSchema.optional(),
	},
);

const searchInvoices = createTool(
	"fakturoid_search_invoices",
	"Search Invoices",
	"Search invoices by text query and optionally filter by tags",
	async (client, { query, tags }) => {
		const invoices = await client.searchInvoices(query, tags);

		return {
			content: [{ text: JSON.stringify(invoices, null, 2), type: "text" }],
		};
	},
	{
		query: z.string().optional(),
		tags: z.array(z.string()).optional(),
	},
);

const getInvoiceDetail = createTool(
	"fakturoid_get_invoice_detail",
	"Get Invoice Detail",
	"Retrieve detailed information about a specific invoice by its ID",
	async (client, { id }) => {
		const invoice = await client.getInvoiceDetail(id);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const downloadInvoicePDF = createTool(
	"fakturoid_download_invoice_pdf",
	"Download Invoice PDF",
	"Download the PDF version of an invoice by its ID",
	async (client, { id }) => {
		const pdf = await client.downloadInvoicePDF(id);

		return {
			content: [{ text: JSON.stringify(pdf, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const downloadInvoiceAttachment = createTool(
	"fakturoid_download_invoice_attachment",
	"Download Invoice Attachment",
	"Download a specific attachment from an invoice",
	async (client, { invoiceId, attachmentId }) => {
		const attachment = await client.downloadInvoiceAttachment(invoiceId, attachmentId);

		return {
			content: [{ text: JSON.stringify(attachment, null, 2), type: "text" }],
		};
	},
	{
		attachmentId: z.number(),
		invoiceId: z.number(),
	},
);

const fireInvoiceAction = createTool(
	"fakturoid_fire_invoice_action",
	"Fire Invoice Action",
	"Execute actions on an invoice such as marking as sent, canceling, locking, or marking as uncollectible",
	async (client, { id, event }) => {
		const result = await client.fireInvoiceAction(id, event);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	{
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
	},
);

const createInvoice = createTool(
	"fakturoid_create_invoice",
	"Create Invoice",
	"Create a new invoice with the provided invoice data. subject_id is necessary for the invoice to be created.",
	async (client, invoiceData) => {
		const invoice = await client.createInvoice(invoiceData);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	CreateInvoiceSchema.shape,
);

const updateInvoice = createTool(
	"fakturoid_update_invoice",
	"Update Invoice",
	"Update an existing invoice with new data",
	async (client, { id, updateData }) => {
		const invoice = await client.updateInvoice(id, updateData);

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		updateData: UpdateInvoiceSchema,
	},
);

const deleteInvoice = createTool(
	"fakturoid_delete_invoice",
	"Delete Invoice",
	"Delete an invoice by its ID (only possible for draft invoices)",
	async (client, { id }) => {
		await client.deleteInvoice(id);

		return {
			content: [{ text: "Invoice deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
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
