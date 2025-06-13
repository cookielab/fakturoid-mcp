// Invoice Payments
export interface InvoicePayment {
	id: number;
	invoice_id: number;
	paid_on: string;
	amount: number;
	currency: string;
	payment_method: "bank" | "cash" | "cod" | "paypal" | "card" | "other";
	note?: string;
	updated_at: string;
	created_at: string;
}
