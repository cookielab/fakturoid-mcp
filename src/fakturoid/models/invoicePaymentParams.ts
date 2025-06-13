export interface InvoicePaymentParams {
	invoice_id: number;
	paid_on: string;
	amount: number;
	currency?: string;
	payment_method?: "bank" | "cash" | "cod" | "paypal" | "card" | "other";
	note?: string;
}
