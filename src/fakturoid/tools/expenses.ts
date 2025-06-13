import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";
import type { ExpenseParams } from "../models/expenses.ts";
import { z } from "zod";

export function registerFakturoidExpensesTools(server: McpServer, client: FakturoidClient) {
	server.tool(
		"fakturoid_get_expenses",
		{
			page: z.number(),
			since: z.string(),
			status: z.enum(["open", "paid", "overdue"]),
			until: z.string(),
			updated_since: z.string(),
			updated_until: z.string(),
		},
		async (params) => {
			try {
				const expenses = await client.getExpenses(params);
				return {
					content: [
						{
							text: JSON.stringify(expenses, null, 2),
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
		"fakturoid_get_expense",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				const expense = await client.getExpense(id);
				return {
					content: [
						{
							text: JSON.stringify(expense, null, 2),
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
		"fakturoid_create_expense",
		{
			expenseData: z
				.object({
					supplier_name: z.string(),
				})
				.passthrough(),
		},
		async ({ expenseData }) => {
			try {
				const expense = await client.createExpense(expenseData as ExpenseParams);
				return {
					content: [
						{
							text: JSON.stringify(expense, null, 2),
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
		"fakturoid_update_expense",
		{
			expenseData: z.object({}).passthrough(),
			id: z.number(),
		},
		async ({ id, expenseData }) => {
			try {
				const expense = await client.updateExpense(id, expenseData as Partial<ExpenseParams>);
				return {
					content: [
						{
							text: JSON.stringify(expense, null, 2),
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
		"fakturoid_delete_expense",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				await client.deleteExpense(id);
				return {
					content: [
						{
							text: "Expense deleted successfully",
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
