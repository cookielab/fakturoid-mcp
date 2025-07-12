import { z } from "zod/v3";
import { CreateExpenseSchema, GetExpenseFiltersSchema, UpdateExpenseSchema } from "../model/expense.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getExpenses = createTool(
	"fakturoid_get_expenses",
	"Get Expenses",
	"Retrieve a list of expenses with optional filtering by status, date range, supplier, and other criteria",
	async (client, { filters }) => {
		const expenses = await client.getExpenses(filters);

		return {
			content: [{ text: JSON.stringify(expenses, null, 2), type: "text" }],
		};
	},
	{
		filters: GetExpenseFiltersSchema.optional(),
	},
);

const searchExpenses = createTool(
	"fakturoid_search_expenses",
	"Search Expenses",
	"Search expenses by text query and optionally filter by tags",
	async (client, { query, tags }) => {
		const expenses = await client.searchExpenses(query, tags);

		return {
			content: [{ text: JSON.stringify(expenses, null, 2), type: "text" }],
		};
	},
	{
		accountSlug: z.string().min(1),
		query: z.string().optional(),
		tags: z.array(z.string()).optional(),
	},
);

const getExpenseDetail = createTool(
	"fakturoid_get_expense_detail",
	"Get Expense Detail",
	"Retrieve detailed information about a specific expense by its ID",
	async (client, { id }) => {
		const expense = await client.getExpenseDetail(id);

		return {
			content: [{ text: JSON.stringify(expense, null, 2), type: "text" }],
		};
	},
	{
		accountSlug: z.string().min(1),
		id: z.number(),
	},
);

const downloadExpenseAttachment = createTool(
	"fakturoid_download_expense_attachment",
	"Download Expense Attachment",
	"Download a specific attachment from an expense",
	async (client, { expenseId, attachmentId }) => {
		const attachment = await client.downloadExpenseAttachment(expenseId, attachmentId);

		return {
			content: [{ text: JSON.stringify(attachment, null, 2), type: "text" }],
		};
	},
	{
		attachmentId: z.number(),
		expenseId: z.number(),
	},
);

const fireExpenseAction = createTool(
	"fakturoid_fire_expense_action",
	"Fire Expense Action",
	"Execute actions on an expense such as locking or unlocking",
	async (client, { id, event }) => {
		const result = await client.fireExpenseAction(id, event);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	{
		accountSlug: z.string().min(1),
		event: z.enum(["lock", "unlock"]),
		id: z.number(),
	},
);

const createExpense = createTool(
	"fakturoid_create_expense",
	"Create Expense",
	"Create a new expense with the provided expense data",
	async (client, expenseData) => {
		const expense = await client.createExpense(expenseData);

		return {
			content: [{ text: JSON.stringify(expense, null, 2), type: "text" }],
		};
	},
	CreateExpenseSchema.shape,
);

const updateExpense = createTool(
	"fakturoid_update_expense",
	"Update Expense",
	"Update an existing expense with new data",
	async (client, { id, updateData }) => {
		const expense = await client.updateExpense(id, updateData);

		return {
			content: [{ text: JSON.stringify(expense, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		updateData: UpdateExpenseSchema,
	},
);

const deleteExpense = createTool(
	"fakturoid_delete_expense",
	"Delete Expense",
	"Delete an expense by its ID",
	async (client, { id }) => {
		await client.deleteExpense(id);

		return {
			content: [{ text: "Expense deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
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
