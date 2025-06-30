import { z } from "zod/v4";
import { GetExpenseFiltersSchema } from "../model/expense.ts";
import { createTool, type ServerToolCreator } from "./common.ts";

const getExpenses = createTool(
	"fakturoid_get_expenses",
	async (client, { filters }) => {
		const expenses = await client.getExpenses(filters);

		return {
			content: [{ text: JSON.stringify(expenses, null, 2), type: "text" }],
		};
	},
	z.object({
		filters: GetExpenseFiltersSchema.optional(),
	}),
);

const searchExpenses = createTool(
	"fakturoid_search_expenses",
	async (client, { query, tags }) => {
		const expenses = await client.searchExpenses(query, tags);

		return {
			content: [{ text: JSON.stringify(expenses, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		query: z.string().optional(),
		tags: z.array(z.string()).optional(),
	}),
);

const getExpenseDetail = createTool(
	"fakturoid_get_expense_detail",
	async (client, { id }) => {
		const expense = await client.getExpenseDetail(id);

		return {
			content: [{ text: JSON.stringify(expense, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const downloadExpenseAttachment = createTool(
	"fakturoid_download_expense_attachment",
	async (client, { expenseId, attachmentId }) => {
		const attachment = await client.downloadExpenseAttachment(expenseId, attachmentId);

		return {
			content: [{ text: JSON.stringify(attachment, null, 2), type: "text" }],
		};
	},
	z.object({
		attachmentId: z.number(),
		expenseId: z.number(),
	}),
);

const fireExpenseAction = createTool(
	"fakturoid_fire_expense_action",
	async (client, { id, event }) => {
		const result = await client.fireExpenseAction(id, event);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		event: z.enum(["lock", "unlock"]),
		id: z.number(),
	}),
);

const createExpense = createTool(
	"fakturoid_create_expense",
	async (client, { expenseData }) => {
		const expense = await client.createExpense(expenseData);

		return {
			content: [{ text: JSON.stringify(expense, null, 2), type: "text" }],
		};
	},
	z.object({
		expenseData: z.any(), // Using z.any() since CreateExpense type is not available here
	}),
);

const updateExpense = createTool(
	"fakturoid_update_expense",
	async (client, { id, updateData }) => {
		const expense = await client.updateExpense(id, updateData);

		return {
			content: [{ text: JSON.stringify(expense, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		updateData: z.any(), // Using z.any() since UpdateExpense type is not available here
	}),
);

const deleteExpense = createTool(
	"fakturoid_delete_expense",
	async (client, { id }) => {
		await client.deleteExpense(id);

		return {
			content: [{ text: "Expense deleted successfully", type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const expense = [
	getExpenses,
	searchExpenses,
	getExpenseDetail,
	downloadExpenseAttachment,
	fireExpenseAction,
	createExpense,
	updateExpense,
	deleteExpense,
] as const satisfies ServerToolCreator[];

export { expense };
