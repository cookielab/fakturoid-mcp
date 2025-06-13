export interface ExpensePaymentParams {
	expense_id: number;
	paid_on: string;
	amount: number;
	currency?: string;
	payment_method?: "bank" | "cash" | "other";
	note?: string;
}
