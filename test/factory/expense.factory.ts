import type { VatRatesSummary } from "../../src/fakturoid/model/common";
import type { ExpensePayment } from "../../src/fakturoid/model/expensePayment";
import { copycat, type Input } from "@snaplet/copycat";
import {
	type AttachmentResponse,
	EXPENSE_ARTICLE_NUMBER_TYPE,
	type Expense,
	type Line,
} from "../../src/fakturoid/model/expense";

const generateIBAN = (seed: Input): string => {
	const countryCode = copycat.oneOf(`${seed}_country`, ["CZ", "SK", "DE", "AT", "NL", "BE", "FR", "IT"]);
	const checkDigits = copycat.int(`${seed}_check`, { min: 10, max: 99 }).toString();
	const bankCode = copycat.int(`${seed}_bank`, { min: 1000, max: 9999 }).toString();
	const accountNumber = copycat.int(`${seed}_acc`, { min: 1_000_000_000, max: 9_999_999_999 }).toString();
	return `${countryCode}${checkDigits}${bankCode}${accountNumber}`;
};

const generateBIC = (seed: Input): string => {
	const bankCode = copycat.oneOf(`${seed}_bank`, ["BACX", "CEKO", "CNBA", "AGBA", "FIOB", "RZBP", "GIBACZPX"]);
	const countryCode = copycat.oneOf(`${seed}_country`, ["CZ", "SK", "DE", "AT"]);
	const locationCode = copycat.oneOf(`${seed}_location`, ["PP", "PX", "22", "33"]);
	return `${bankCode}${countryCode}${locationCode}`;
};

const generateAccountNumber = (seed: Input): string => {
	const prefix = copycat.bool(`${seed}_prefix`) ? `${copycat.int(`${seed}_pre`, { min: 1, max: 999 })}-` : "";
	const mainNumber = copycat.int(`${seed}_main`, { min: 1_000_000, max: 9_999_999_999 });
	const suffix = copycat.int(`${seed}_suffix`, { min: 1000, max: 9999 });
	return `${prefix}${mainNumber}/${suffix}`;
};

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
		mark_document_as_paid: copycat.bool(`${seed}_mark_paid`),
		native_amount: amount.toString(),
		paid_on: paidDate,
		updated_at: updatedDate,
		variable_symbol: copycat.int(`${seed}_variable_symbol`, { min: 1000, max: 9999 }).toString(),

		...initial,
	};
};

const createExpenseLine = (seed: Input, initial: Partial<Line> = {}): Line => {
	const unitPrice = copycat.int(`${seed}_unit_price`, { min: 10, max: 10_000 });
	const quantity = copycat.int(`${seed}_quantity`, { min: 1, max: 100 });
	const vatRate = copycat.oneOf(`${seed}_vat_rate`, [0, 10, 15, 20, 21, 25]);
	const unitPriceWithoutVat = unitPrice.toString();
	const unitPriceWithVat = (unitPrice * (1 + vatRate / 100)).toFixed(2);
	const totalPriceWithoutVat = (unitPrice * quantity).toFixed(2);
	const totalVat = ((unitPrice * quantity * vatRate) / 100).toFixed(2);

	const units = ["pcs", "kg", "m", "l", "hours", "days", "m²", "m³"] as const;

	return {
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		inventory: copycat.bool(`${seed}_inventory_null`)
			? null
			: {
					article_number: copycat.bool(`${seed}_article_null`)
						? undefined
						: copycat.uuid(`${seed}_article`).slice(0, 8),
					article_number_type: copycat.oneOf(`${seed}_article_type`, [...EXPENSE_ARTICLE_NUMBER_TYPE]),
					item_id: copycat.int(`${seed}_item_id`, { min: 1, max: 10_000 }),
					move_id: copycat.int(`${seed}_move_id`, { min: 1, max: 10_000 }),
					sku: copycat.uuid(`${seed}_sku`).slice(0, 12),
				},
		name: copycat.username(`${seed}_name`),
		native_total_price_without_vat: totalPriceWithoutVat,
		native_total_vat: totalVat,
		quantity: quantity.toString(),
		total_price_without_vat: totalPriceWithoutVat,
		total_vat: totalVat,
		unit_name: copycat.oneOf(`${seed}_unit`, [...units]),
		unit_price: unitPrice.toString(),
		unit_price_with_vat: unitPriceWithVat,
		unit_price_without_vat: unitPriceWithoutVat,
		vat_rate: vatRate,

		...initial,
	};
};

const createAttachmentResponse = (seed: Input, initial: Partial<AttachmentResponse> = {}): AttachmentResponse => {
	const fileTypes = [
		"application/pdf",
		"image/jpeg",
		"image/png",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	] as const;
	const extensions = ["pdf", "jpg", "png", "xlsx"] as const;
	const extension = copycat.oneOf(`${seed}_ext`, [...extensions]);
	const contentType = copycat.oneOf(`${seed}_content_type`, [...fileTypes]);

	return {
		content_type: contentType,
		download_url: copycat.url(`${seed}_download_url`),
		filename: `${copycat.word(`${seed}_filename`)}.${extension}`,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),

		...initial,
	};
};

const createVatRatesSummary = (seed: Input, initial: Partial<VatRatesSummary> = {}): VatRatesSummary => {
	const base = copycat.int(`${seed}_base`, { min: 1000, max: 100_000 });
	const vatRate = copycat.oneOf(`${seed}_vat_rate`, [0, 10, 15, 20, 21, 25]);
	const vat = Math.round((base * vatRate) / 100);

	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const currency = copycat.oneOf(`${seed}_currency`, [...currencies]);
	const nativeCurrency = copycat.oneOf(`${seed}_native_currency`, [...currencies]);

	return {
		base: base.toString(),
		currency: currency,
		native_base: base.toString(),
		native_currency: nativeCurrency,
		native_vat: vat.toString(),
		vat: vat.toString(),
		vat_rate: vatRate,

		...initial,
	};
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Test factory
const createExpense = (seed: Input, initial: Partial<Expense> = {}): Expense => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const issuedDate = copycat.dateString(`${seed}_issued`, { min: baseDate });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: issuedDate });
	const dueDate = copycat.dateString(`${seed}_due`, { min: issuedDate });
	const receivedDate = copycat.dateString(`${seed}_received`, { min: issuedDate });

	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const countries = ["CZ", "SK", "DE", "AT", "US", "GB", "FR", "IT", "ES", "NL", "BE", "PL", "HU"] as const;
	const documentTypes = ["invoice", "bill", "other"] as const;
	const paymentMethods = ["bank", "cash", "cod", "card", "paypal", "custom"] as const;
	const statuses = ["open", "overdue", "paid"] as const;
	const vatPriceModeValues = ["without_vat", "from_total_with_vat"] as const;

	const subtotal = copycat.int(`${seed}_subtotal`, { min: 1000, max: 100_000 });
	const vatRate = copycat.oneOf(`${seed}_vat_rate`, [0, 10, 15, 20, 21, 25]);
	const vat = Math.round((subtotal * vatRate) / 100);
	const total = subtotal + vat;

	const hasAttachments = copycat.bool(`${seed}_has_attachments`);
	const attachmentCount = hasAttachments ? copycat.int(`${seed}_attachment_count`, { min: 1, max: 3 }) : 0;
	const attachments = hasAttachments
		? Array.from({ length: attachmentCount }, (_, i) => createAttachmentResponse(`${seed}_attachment_${i}`))
		: null;

	const lineCount = copycat.int(`${seed}_line_count`, { min: 1, max: 5 });
	const lines = Array.from({ length: lineCount }, (_, i) => createExpenseLine(`${seed}_line_${i}`));

	const paymentCount = copycat.int(`${seed}_payment_count`, { min: 0, max: 3 });
	const payments = Array.from({ length: paymentCount }, (_, i) => createExpensePayment(`${seed}_payment_${i}`));

	const vatRatesSummary = [createVatRatesSummary(`${seed}_vat_summary`)];

	return {
		attachments: attachments,
		bank_account: copycat.bool(`${seed}_bank_account_null`) ? undefined : generateAccountNumber(`${seed}_bank_account`),
		created_at: baseDate,
		currency: copycat.oneOf(`${seed}_currency`, [...currencies]),
		custom_id: copycat.bool(`${seed}_custom_id_null`) ? null : copycat.uuid(`${seed}_custom_id`),
		custom_payment_method: copycat.bool(`${seed}_custom_payment_method_null`)
			? null
			: copycat.word(`${seed}_custom_payment_method`),
		description: copycat.bool(`${seed}_description_null`) ? undefined : copycat.sentence(`${seed}_description`),
		document_type: copycat.oneOf(`${seed}_document_type`, [...documentTypes]),
		due_on: copycat.bool(`${seed}_due_on_null`) ? undefined : dueDate,
		exchange_rate: copycat.bool(`${seed}_exchange_rate_null`)
			? undefined
			: copycat.float(`${seed}_exchange_rate`, { min: 0.5, max: 2 }).toFixed(4),
		html_url: copycat.url(`${seed}_html_url`),
		iban: copycat.bool(`${seed}_iban_null`) ? undefined : generateIBAN(`${seed}_iban`),
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		issued_on: copycat.bool(`${seed}_issued_on_null`) ? undefined : issuedDate,
		lines: lines,
		locked_at: copycat.bool(`${seed}_locked_at_null`)
			? null
			: copycat.dateString(`${seed}_locked_at`, { min: issuedDate }),
		native_subtotal: subtotal.toString(),
		native_total: total.toString(),
		number: copycat.bool(`${seed}_number_null`)
			? undefined
			: copycat.int(`${seed}_number`, { min: 2_024_001, max: 2_024_999 }).toString(),
		original_number: copycat.bool(`${seed}_original_number_null`)
			? undefined
			: copycat.int(`${seed}_original_number`, { min: 2_024_001, max: 2_024_999 }).toString(),
		paid_on: copycat.bool(`${seed}_paid_on_null`) ? null : copycat.dateString(`${seed}_paid_on`, { min: issuedDate }),
		payment_method: copycat.oneOf(`${seed}_payment_method`, [...paymentMethods]),
		payments: payments,
		private_note: copycat.bool(`${seed}_private_note_null`) ? undefined : copycat.sentence(`${seed}_private_note`),
		proportional_vat_deduction: copycat.int(`${seed}_proportional_vat_deduction`, { min: 50, max: 100 }),
		received_on: copycat.bool(`${seed}_received_on_null`) ? undefined : receivedDate,
		remind_due_date: copycat.bool(`${seed}_remind_due_date`),
		status: copycat.oneOf(`${seed}_status`, [...statuses]),
		subject_id: copycat.int(`${seed}_subject_id`, { min: 1, max: 10_000 }),
		subject_url: copycat.url(`${seed}_subject_url`),
		subtotal: subtotal.toString(),
		supplier_city: copycat.city(`${seed}_supplier_city`),
		supplier_country: copycat.oneOf(`${seed}_supplier_country`, [...countries]),
		supplier_local_vat_no: copycat.bool(`${seed}_supplier_local_vat_no_null`)
			? null
			: copycat.phoneNumber(`${seed}_supplier_local_vat_no`).replace(/\D/g, ""),
		supplier_name: copycat.username(`${seed}_supplier_name`),
		supplier_registration_no: copycat.phoneNumber(`${seed}_supplier_registration_no`).replace(/\D/g, ""),
		supplier_street: copycat.streetAddress(`${seed}_supplier_street`),
		supplier_vat_no: copycat.phoneNumber(`${seed}_supplier_vat_no`).replace(/\D/g, ""),
		supplier_zip: copycat.int(`${seed}_supplier_zip`, { min: 10_000, max: 99_999 }).toString(),
		supply_code: copycat.bool(`${seed}_supply_code_null`) ? undefined : copycat.word(`${seed}_supply_code`),
		swift_bic: copycat.bool(`${seed}_swift_bic_null`) ? undefined : generateBIC(`${seed}_swift_bic`),
		tags: copycat.bool(`${seed}_tags_null`)
			? undefined
			: copycat.someOf(`${seed}_tags`, [1, 3], ["office", "travel", "marketing", "equipment", "services", "utilities"]),
		tax_deductible: copycat.bool(`${seed}_tax_deductible`),
		taxable_fulfillment_due: copycat.bool(`${seed}_taxable_fulfillment_due_null`)
			? undefined
			: copycat.dateString(`${seed}_taxable_fulfillment_due`, { min: issuedDate }),
		total: total.toString(),
		transferred_tax_liability: copycat.bool(`${seed}_transferred_tax_liability`),
		updated_at: updatedDate,
		url: copycat.url(`${seed}_url`),
		variable_symbol: copycat.bool(`${seed}_variable_symbol_null`)
			? undefined
			: copycat.int(`${seed}_variable_symbol`, { min: 1000, max: 9999 }).toString(),
		vat_price_mode: copycat.oneOf(`${seed}_vat_price_mode`, [...vatPriceModeValues]),
		vat_rates_summary: vatRatesSummary,

		...initial,
	};
};

export { createExpense, createExpenseLine, createExpensePayment, createAttachmentResponse };
