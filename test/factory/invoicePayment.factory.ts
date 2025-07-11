import type { InvoicePayment } from "../../src/fakturoid/model/invoicePayment";
import { copycat, type Input } from "@snaplet/copycat";

const createInvoicePayment = (seed: Input, initial: Partial<InvoicePayment> = {}): InvoicePayment => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });
	const paidDate = copycat.dateString(`${seed}_paid`, { min: baseDate });

	const amount = copycat.int(`${seed}_amount`, { min: 100, max: 50_000 });
	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const currency = copycat.oneOf(`${seed}_currency`, [...currencies]);
	const proformaFollowupValues = ["final_invoice_paid", "final_invoice", "tax_document", "none"] as const;

	const isProforma = copycat.bool(`${seed}_is_proforma`);
	const markAsPaid = copycat.bool(`${seed}_mark_as_paid`);
	const hasTaxDocument = copycat.bool(`${seed}_has_tax_document`);

	return {
		amount: amount.toString(),
		bank_account_id: copycat.int(`${seed}_bank_account_id`, { min: 1, max: 100 }),
		created_at: baseDate,
		currency: currency,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		mark_document_as_paid: markAsPaid,
		native_amount: amount.toString(),
		paid_on: paidDate,
		proforma_followup_document: isProforma
			? copycat.oneOf(`${seed}_proforma_followup`, [...proformaFollowupValues])
			: "none",
		send_thank_you_email: markAsPaid ? copycat.bool(`${seed}_send_thank_you`) : false,
		tax_document_id: hasTaxDocument ? copycat.int(`${seed}_tax_document_id`, { min: 1, max: 10_000 }) : null,
		updated_at: updatedDate,
		variable_symbol: copycat.int(`${seed}_variable_symbol`, { min: 1000, max: 9999 }).toString(),

		...initial,
	};
};

export { createInvoicePayment };
