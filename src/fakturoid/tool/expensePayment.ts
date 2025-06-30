import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const createExpensePayment = createTool(
	"fakturoid_create_expense_payment",
	async (client, { expenseId, paymentData }) => {
		const payment = await client.createExpensePayment(expenseId, paymentData);

		return {
			content: [{ text: JSON.stringify(payment, null, 2), type: "text" }],
		};
	},
	z.object({
		expenseId: z.number(),
		paymentData: z.any(), // Using z.any() since CreateExpensePayment type is not available here
	}),
);

const deleteExpensePayment = createTool(
	"fakturoid_delete_expense_payment",
	async (client, { expenseId, paymentId }) => {
		await client.deleteExpensePayment(expenseId, paymentId);

		return {
			content: [{ text: "Expense payment deleted successfully", type: "text" }],
		};
	},
	z.object({
		expenseId: z.number(),
		paymentId: z.number(),
	}),
);

const expensePayment = [createExpensePayment, deleteExpensePayment] as const satisfies ServerToolCreator[];

export { expensePayment };
