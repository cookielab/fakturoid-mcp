import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";
import type { InvoiceParams } from "../models/invoices.ts";
import { z } from "zod";

export function registerFakturoidInvoicesTools(server: McpServer, client: FakturoidClient) {
	server.tool(
		"fakturoid_get_invoices",
		{
			page: z.number(),
			since: z.string(),
			status: z.enum(["open", "paid", "overdue", "cancelled"]),
			subject_id: z.number(),
			until: z.string(),
			updated_since: z.string(),
			updated_until: z.string(),
		},
		async (params) => {
			try {
				const invoices = await client.getInvoices(params);
				return {
					content: [
						{
							text: JSON.stringify(invoices, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_get_invoice",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				const invoice = await client.getInvoice(id);
				return {
					content: [
						{
							text: JSON.stringify(invoice, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_create_invoice",
		{
			invoiceData: z
				.object({
					lines: z.array(
						z.object({
							name: z.string(),
							quantity: z.number(),
							unit_name: z.string().optional(),
							unit_price: z.number(),
							vat_rate: z.number(),
						}),
					),
					subject_id: z.number(),
				})
				.passthrough(),
		},
		async ({ invoiceData }) => {
			try {
				const invoice = await client.createInvoice(invoiceData as InvoiceParams);
				return {
					content: [
						{
							text: JSON.stringify(invoice, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_update_invoice",
		{
			id: z.number(),
			invoiceData: z.object({}).passthrough(),
		},
		async ({ id, invoiceData }) => {
			try {
				const invoice = await client.updateInvoice(id, invoiceData as Partial<InvoiceParams>);
				return {
					content: [
						{
							text: JSON.stringify(invoice, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_delete_invoice",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				await client.deleteInvoice(id);
				return {
					content: [
						{
							text: "Invoice deleted successfully",
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);
}
