import type { ExpensePayment } from "../../src/fakturoid/model/expensePayment";
import { copycat, type Input } from "@snaplet/copycat";

const createExpensePayment = (seed: Input, initial: Partial<ExpensePayment> = {}): ExpensePayment => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });
	const paidDate = copycat.dateString(`${seed}_paid`, { min: baseDate });

	const amount = copycat.int(`${seed}_amount`, { min: 100, max: 50_000 });
	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const currency = copycat.oneOf(`${seed}_currency`, [...currencies]);

	return {
		amount: amount.toString(),
		bank_account_id: copycat.int(`${seed}_bank_account_id`, { min: 1, max: 100 }),
		created_at: baseDate,
		currency: currency,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		mark_document_as_paid: copycat.bool(`${seed}_mark_document_as_paid`),
		native_amount: amount.toString(),
		paid_on: paidDate,
		updated_at: updatedDate,
		variable_symbol: copycat.int(`${seed}_variable_symbol`, { min: 1000, max: 9999 }).toString(),

		...initial,
	};
};

export { createExpensePayment };
