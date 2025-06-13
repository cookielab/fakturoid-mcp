import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";
import type { InvoicePaymentParams } from "../models/invoicePaymentParams.ts";
import { z } from "zod/v4";

export function registerFakturoidInvoicePaymentsTools(server: McpServer, client: FakturoidClient) {
	server.tool(
		"fakturoid_get_invoice_payments",
		{
			invoiceId: z.number(),
			page: z.number().optional(),
		},
		async ({ invoiceId, page }) => {
			try {
				// TODO: Find a better way to do this
				if (page == null) {
					throw new Error("Page argument is missing!");
				}

				const payments = await client.getInvoicePayments(invoiceId, { page: page });
				return {
					content: [
						{
							text: JSON.stringify(payments, null, 2),
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
		"fakturoid_get_invoice_payment",
		{
			invoiceId: z.number(),
			paymentId: z.number(),
		},
		async ({ invoiceId, paymentId }) => {
			try {
				const payment = await client.getInvoicePayment(invoiceId, paymentId);
				return {
					content: [
						{
							text: JSON.stringify(payment, null, 2),
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
		"fakturoid_create_invoice_payment",
		{
			invoiceId: z.number(),
			paymentData: z.object({
				amount: z.number(),
				currency: z.string().optional(),
				note: z.string().optional(),
				paid_on: z.string(),
				payment_method: z.enum(["bank", "cash", "cod", "paypal", "card", "other"]).optional(),
			}),
		},
		async ({ invoiceId, paymentData }) => {
			try {
				const payment = await client.createInvoicePayment(invoiceId, paymentData as InvoicePaymentParams);
				return {
					content: [
						{
							text: JSON.stringify(payment, null, 2),
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
		"fakturoid_update_invoice_payment",
		{
			invoiceId: z.number(),
			paymentData: z.object({
				amount: z.number().optional(),
				currency: z.string().optional(),
				note: z.string().optional(),
				paid_on: z.string().optional(),
				payment_method: z.enum(["bank", "cash", "cod", "paypal", "card", "other"]).optional(),
			}),
			paymentId: z.number(),
		},
		async ({ invoiceId, paymentId, paymentData }) => {
			try {
				const payment = await client.updateInvoicePayment(
					invoiceId,
					paymentId,
					paymentData as Partial<InvoicePaymentParams>,
				);
				return {
					content: [
						{
							text: JSON.stringify(payment, null, 2),
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
		"fakturoid_delete_invoice_payment",
		{
			invoiceId: z.number(),
			paymentId: z.number(),
		},
		async ({ invoiceId, paymentId }) => {
			try {
				await client.deleteInvoicePayment(invoiceId, paymentId);
				return {
					content: [
						{
							text: "Invoice payment deleted successfully",
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
