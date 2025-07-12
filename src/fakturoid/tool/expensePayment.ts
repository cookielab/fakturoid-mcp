import { z } from "zod/v3";
import { CreateExpensePaymentSchema } from "../model/expensePayment.js";
import { createTool, type ServerToolCreator } from "./common.js";

const createExpensePayment = createTool(
	"fakturoid_create_expense_payment",
	"Create Expense Payment",
	"Create a new payment record for an expense",
	async (client, { expenseId, paymentData }) => {
		const payment = await client.createExpensePayment(expenseId, paymentData);

		return {
			content: [{ text: JSON.stringify(payment, null, 2), type: "text" }],
		};
	},
	{
		expenseId: z.number(),
		paymentData: CreateExpensePaymentSchema,
	},
);

const deleteExpensePayment = createTool(
	"fakturoid_delete_expense_payment",
	"Delete Expense Payment",
	"Delete a payment record from an expense",
	async (client, { expenseId, paymentId }) => {
		await client.deleteExpensePayment(expenseId, paymentId);

		return {
			content: [{ text: "Expense payment deleted successfully", type: "text" }],
		};
	},
	{
		expenseId: z.number(),
		paymentId: z.number(),
	},
);

const expensePayment = [createExpensePayment, deleteExpensePayment] as const satisfies ServerToolCreator[];

export { expensePayment };
