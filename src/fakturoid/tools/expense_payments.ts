import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";
import type { ExpensePaymentParams } from "../models/expensePaymentParams.ts";
import { z } from "zod/v4";

export function registerFakturoidExpensePaymentsTools(server: McpServer, client: FakturoidClient) {
	server.tool(
		"fakturoid_get_expense_payments",
		{
			expenseId: z.number(),
			page: z.number().optional(),
		},
		async ({ expenseId, page }) => {
			try {
				// TODO: Find a better way to do this
				if (page == null) {
					throw new Error("Page argument is missing!");
				}

				const payments = await client.getExpensePayments(expenseId, { page: page });
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
		"fakturoid_get_expense_payment",
		{
			expenseId: z.number(),
			paymentId: z.number(),
		},
		async ({ expenseId, paymentId }) => {
			try {
				const payment = await client.getExpensePayment(expenseId, paymentId);
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
		"fakturoid_create_expense_payment",
		{
			expenseId: z.number(),
			paymentData: z.object({
				amount: z.number(),
				currency: z.string().optional(),
				note: z.string().optional(),
				paid_on: z.string(),
				payment_method: z.enum(["bank", "cash", "other"]).optional(),
			}),
		},
		async ({ expenseId, paymentData }) => {
			try {
				const payment = await client.createExpensePayment(expenseId, paymentData as ExpensePaymentParams);
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
		"fakturoid_update_expense_payment",
		{
			expenseId: z.number(),
			paymentData: z.object({
				amount: z.number().optional(),
				currency: z.string().optional(),
				note: z.string().optional(),
				paid_on: z.string().optional(),
				payment_method: z.enum(["bank", "cash", "other"]).optional(),
			}),
			paymentId: z.number(),
		},
		async ({ expenseId, paymentId, paymentData }) => {
			try {
				const payment = await client.updateExpensePayment(
					expenseId,
					paymentId,
					paymentData as Partial<ExpensePaymentParams>,
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
		"fakturoid_delete_expense_payment",
		{
			expenseId: z.number(),
			paymentId: z.number(),
		},
		async ({ expenseId, paymentId }) => {
			try {
				await client.deleteExpensePayment(expenseId, paymentId);
				return {
					content: [
						{
							text: "Expense payment deleted successfully",
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
