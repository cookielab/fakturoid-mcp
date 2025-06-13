// Expense Payments
export interface ExpensePayment {
	id: number;
	expense_id: number;
	paid_on: string;
	amount: number;
	currency: string;
	payment_method: "bank" | "cash" | "other";
	note?: string;
	updated_at: string;
	created_at: string;
}
