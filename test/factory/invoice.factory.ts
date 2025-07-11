import { copycat, type Input } from "@snaplet/copycat";
import {
	type Attachment,
	INVOICE_ARTICLE_NUMBER_TYPE,
	INVOICE_DOCUMENT_TYPE,
	INVOICE_IBAN_VISIBILITY,
	INVOICE_LANGUAGE,
	INVOICE_OSS,
	INVOICE_PAYMENT_METHOD,
	INVOICE_PROFORMA_FOLLOWUP_DOCUMENT,
	INVOICE_STATUS,
	INVOICE_VAT_PRICE_MODE,
	type Invoice,
	type Line,
	type PaidAdvance,
	type Payment,
	type VatRatesSummary,
} from "../../src/fakturoid/model/invoice";

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

const createLine = (seed: Input, initial: Partial<Line> = {}): Line => {
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
					article_number: copycat.bool(`${seed}_article_null`) ? null : copycat.uuid(`${seed}_article`).slice(0, 8),
					article_number_type: copycat.oneOf(`${seed}_article_type`, [...INVOICE_ARTICLE_NUMBER_TYPE]),
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

const createAttachment = (seed: Input, initial: Partial<Attachment> = {}): Attachment => {
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

const createPayment = (seed: Input, initial: Partial<Payment> = {}): Payment => {
	const amount = copycat.int(`${seed}_amount`, { min: 100, max: 50_000 });
	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const currency = copycat.oneOf(`${seed}_currency`, [...currencies]);
	const nativeCurrency = copycat.oneOf(`${seed}_native_currency`, [...currencies]);

	return {
		amount: amount.toString(),
		currency: currency,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		native_amount: amount.toString(),
		native_currency: nativeCurrency,
		paid_on: copycat.dateString(`${seed}_paid_on`, { minYear: new Date().getFullYear() }),

		...initial,
	};
};

const createPaidAdvance = (seed: Input, initial: Partial<PaidAdvance> = {}): PaidAdvance => {
	const price = copycat.int(`${seed}_price`, { min: 1000, max: 20_000 });
	const vatRate = copycat.oneOf(`${seed}_vat_rate`, [0, 10, 15, 20, 21, 25]);
	const vat = Math.round((price * vatRate) / 100);

	return {
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		number: copycat.int(`${seed}_number`, { min: 2_024_001, max: 2_024_999 }).toString(),
		paid_on: copycat.dateString(`${seed}_paid_on`, { minYear: new Date().getFullYear() }),
		price: price.toString(),
		variable_symbol: copycat.int(`${seed}_variable_symbol`, { min: 1000, max: 9999 }).toString(),
		vat: vat.toString(),
		vat_rate: vatRate,

		...initial,
	};
};

const createInvoice = (seed: Input, initial: Partial<Invoice> = {}): Invoice => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const issuedDate = copycat.dateString(`${seed}_issued`, { min: baseDate });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: issuedDate });
	const dueDate = copycat.dateString(`${seed}_due`, { min: issuedDate });

	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const countries = ["CZ", "SK", "DE", "AT", "US", "GB", "FR", "IT", "ES", "NL", "BE", "PL", "HU"] as const;

	const subtotal = copycat.int(`${seed}_subtotal`, { min: 1000, max: 100_000 });
	const vatRate = copycat.oneOf(`${seed}_vat_rate`, [0, 10, 15, 20, 21, 25]);
	const vat = Math.round((subtotal * vatRate) / 100);
	const total = subtotal + vat;
	const remainingAmount = copycat.int(`${seed}_remaining`, { min: 0, max: total });

	const hasClientData = copycat.bool(`${seed}_has_client`);
	const isProforma = copycat.oneOf(`${seed}_document_type`, [...INVOICE_DOCUMENT_TYPE]) === "proforma";
	const hasPaidAdvances =
		copycat.bool(`${seed}_has_paid_advances`) &&
		copycat.oneOf(`${seed}_document_type`, [...INVOICE_DOCUMENT_TYPE]) === "final_invoice";
	const hasAttachments = copycat.bool(`${seed}_has_attachments`);
	const hasDeliveryAddress = copycat.bool(`${seed}_has_delivery`);

	const lineCount = copycat.int(`${seed}_line_count`, { min: 1, max: 5 });
	const lines = Array.from({ length: lineCount }, (_, i) => createLine(`${seed}_line_${i}`));

	const attachmentCount = hasAttachments ? copycat.int(`${seed}_attachment_count`, { min: 1, max: 3 }) : 0;
	const attachments = hasAttachments
		? Array.from({ length: attachmentCount }, (_, i) => createAttachment(`${seed}_attachment_${i}`))
		: null;

	const paymentCount = copycat.int(`${seed}_payment_count`, { min: 0, max: 3 });
	const payments = Array.from({ length: paymentCount }, (_, i) => createPayment(`${seed}_payment_${i}`));

	const paidAdvanceCount = hasPaidAdvances ? copycat.int(`${seed}_paid_advance_count`, { min: 1, max: 2 }) : 0;
	const paidAdvances = hasPaidAdvances
		? Array.from({ length: paidAdvanceCount }, (_, i) => createPaidAdvance(`${seed}_paid_advance_${i}`))
		: [];

	const vatRatesSummary = [createVatRatesSummary(`${seed}_vat_summary`)];

	return {
		attachments: attachments,
		bank_account: copycat.bool(`${seed}_bank_account_null`) ? undefined : generateAccountNumber(`${seed}_bank_account`),
		bank_account_id: copycat.bool(`${seed}_bank_account_id_null`)
			? undefined
			: copycat.int(`${seed}_bank_account_id`, { min: 1, max: 100 }),
		cancelled_at: copycat.bool(`${seed}_cancelled`)
			? copycat.dateString(`${seed}_cancelled_at`, { min: issuedDate })
			: null,
		client_city: hasClientData ? copycat.city(`${seed}_client_city`) : undefined,
		client_country: hasClientData ? copycat.oneOf(`${seed}_client_country`, [...countries]) : undefined,
		client_delivery_city: hasClientData && hasDeliveryAddress ? copycat.city(`${seed}_client_delivery_city`) : null,
		client_delivery_country:
			hasClientData && hasDeliveryAddress ? copycat.oneOf(`${seed}_client_delivery_country`, [...countries]) : null,
		client_delivery_name: hasClientData && hasDeliveryAddress ? copycat.username(`${seed}_client_delivery_name`) : null,
		client_delivery_street:
			hasClientData && hasDeliveryAddress ? copycat.streetAddress(`${seed}_client_delivery_street`) : null,
		client_delivery_zip:
			hasClientData && hasDeliveryAddress
				? copycat.int(`${seed}_client_delivery_zip`, { min: 10_000, max: 99_999 }).toString()
				: null,
		client_has_delivery_address: hasClientData ? hasDeliveryAddress : undefined,
		client_local_vat_no:
			hasClientData && copycat.bool(`${seed}_client_local_vat_no_null`)
				? null
				: copycat.phoneNumber(`${seed}_client_local_vat_no`).replace(/\D/g, ""),
		client_name: hasClientData ? copycat.username(`${seed}_client_name`) : undefined,
		client_registration_no: hasClientData
			? copycat.phoneNumber(`${seed}_client_registration_no`).replace(/\D/g, "")
			: undefined,
		client_street: hasClientData ? copycat.streetAddress(`${seed}_client_street`) : undefined,
		client_vat_no: hasClientData ? copycat.phoneNumber(`${seed}_client_vat_no`).replace(/\D/g, "") : undefined,
		client_zip: hasClientData ? copycat.int(`${seed}_client_zip`, { min: 10_000, max: 99_999 }).toString() : undefined,
		correction_id: copycat.bool(`${seed}_correction_id_null`)
			? null
			: copycat.int(`${seed}_correction_id`, { min: 1, max: 10_000 }),
		created_at: baseDate,
		currency: copycat.oneOf(`${seed}_currency`, [...currencies]),
		custom_id: copycat.bool(`${seed}_custom_id_null`) ? null : copycat.uuid(`${seed}_custom_id`),
		custom_payment_method: copycat.bool(`${seed}_custom_payment_method_null`)
			? null
			: copycat.word(`${seed}_custom_payment_method`),
		document_type: copycat.oneOf(`${seed}_document_type`, [...INVOICE_DOCUMENT_TYPE]),
		due: copycat.int(`${seed}_due`, { min: 14, max: 90 }),
		due_on: dueDate,
		eet_records: [],
		exchange_rate: copycat.bool(`${seed}_exchange_rate_null`)
			? undefined
			: copycat.float(`${seed}_exchange_rate`, { min: 0.5, max: 2 }).toFixed(4),
		footer_note: copycat.bool(`${seed}_footer_note_null`) ? undefined : copycat.sentence(`${seed}_footer_note`),
		generator_id: copycat.bool(`${seed}_generator_id_null`)
			? null
			: copycat.int(`${seed}_generator_id`, { min: 1, max: 1000 }),
		gopay: copycat.bool(`${seed}_gopay`),
		hide_bank_account: copycat.bool(`${seed}_hide_bank_account_null`)
			? null
			: copycat.bool(`${seed}_hide_bank_account`),
		html_url: copycat.url(`${seed}_html_url`),
		iban: copycat.bool(`${seed}_iban_null`) ? null : generateIBAN(`${seed}_iban`),
		iban_visibility: copycat.oneOf(`${seed}_iban_visibility`, [...INVOICE_IBAN_VISIBILITY]),
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		issued_on: issuedDate,
		language: copycat.oneOf(`${seed}_language`, [...INVOICE_LANGUAGE]),
		lines: lines,
		locked_at: copycat.bool(`${seed}_locked_at_null`)
			? null
			: copycat.dateString(`${seed}_locked_at`, { min: issuedDate }),
		native_subtotal: subtotal.toString(),
		native_total: total.toString(),
		note: copycat.bool(`${seed}_note_null`) ? undefined : copycat.sentence(`${seed}_note`),
		number: copycat.int(`${seed}_number`, { min: 2_024_001, max: 2_024_999 }).toString(),
		number_format_id: copycat.bool(`${seed}_number_format_id_null`)
			? undefined
			: copycat.int(`${seed}_number_format_id`, { min: 1, max: 100 }),
		order_number: copycat.bool(`${seed}_order_number_null`)
			? null
			: copycat.int(`${seed}_order_number`, { min: 1000, max: 9999 }).toString(),
		oss: copycat.oneOf(`${seed}_oss`, [...INVOICE_OSS]),
		paid_advances: paidAdvances,
		paid_on: copycat.bool(`${seed}_paid_on_null`) ? null : copycat.dateString(`${seed}_paid_on`, { min: issuedDate }),
		payment_method: copycat.oneOf(`${seed}_payment_method`, [...INVOICE_PAYMENT_METHOD]),
		payments: payments,
		paypal: copycat.bool(`${seed}_paypal`),
		pdf_url: copycat.url(`${seed}_pdf_url`),
		private_note: copycat.bool(`${seed}_private_note_null`) ? null : copycat.sentence(`${seed}_private_note`),
		proforma_followup_document:
			isProforma && copycat.bool(`${seed}_proforma_followup_null`)
				? null
				: copycat.oneOf(`${seed}_proforma_followup`, [...INVOICE_PROFORMA_FOLLOWUP_DOCUMENT]),
		public_html_url: copycat.url(`${seed}_public_html_url`),
		related_id: copycat.bool(`${seed}_related_id_null`)
			? null
			: copycat.int(`${seed}_related_id`, { min: 1, max: 10_000 }),
		remaining_amount: remainingAmount.toString(),
		remaining_native_amount: remainingAmount.toString(),
		reminder_sent_at: copycat.bool(`${seed}_reminder_sent_at_null`)
			? null
			: copycat.dateString(`${seed}_reminder_sent_at`, { min: issuedDate }),
		sent_at: copycat.bool(`${seed}_sent_at_null`) ? null : copycat.dateString(`${seed}_sent_at`, { min: issuedDate }),
		show_already_paid_note_in_pdf: copycat.bool(`${seed}_show_already_paid_note`),
		status: copycat.oneOf(`${seed}_status`, [...INVOICE_STATUS]),
		subject_custom_id: copycat.bool(`${seed}_subject_custom_id_null`)
			? null
			: copycat.uuid(`${seed}_subject_custom_id`),
		subject_id: copycat.int(`${seed}_subject_id`, { min: 1, max: 10_000 }),
		subject_url: copycat.url(`${seed}_subject_url`),
		subtotal: subtotal.toString(),
		supply_code: copycat.bool(`${seed}_supply_code_null`) ? null : copycat.word(`${seed}_supply_code`),
		swift_bic: copycat.bool(`${seed}_swift_bic_null`) ? null : generateBIC(`${seed}_swift_bic`),
		tags: copycat.bool(`${seed}_tags_null`)
			? undefined
			: copycat.someOf(
					`${seed}_tags`,
					[1, 3],
					["urgent", "important", "recurring", "new-client", "wholesale", "retail"],
				),
		tax_document_ids: copycat.bool(`${seed}_tax_document_ids_null`)
			? undefined
			: [copycat.int(`${seed}_tax_document_id`, { min: 1, max: 1000 })],
		taxable_fulfillment_due: copycat.bool(`${seed}_taxable_fulfillment_due_null`)
			? undefined
			: copycat.dateString(`${seed}_taxable_fulfillment_due`, { min: issuedDate }),
		token: copycat.uuid(`${seed}_token`),
		total: total.toString(),
		transferred_tax_liability: copycat.bool(`${seed}_transferred_tax_liability`),
		uncollectible_at: copycat.bool(`${seed}_uncollectible_at_null`)
			? null
			: copycat.dateString(`${seed}_uncollectible_at`, { min: issuedDate }),
		updated_at: updatedDate,
		url: copycat.url(`${seed}_url`),
		variable_symbol: copycat.bool(`${seed}_variable_symbol_null`)
			? undefined
			: copycat.int(`${seed}_variable_symbol`, { min: 1000, max: 9999 }).toString(),
		vat_price_mode: copycat.bool(`${seed}_vat_price_mode_null`)
			? null
			: copycat.oneOf(`${seed}_vat_price_mode`, [...INVOICE_VAT_PRICE_MODE]),
		vat_rates_summary: vatRatesSummary,
		webinvoice_seen_on: copycat.bool(`${seed}_webinvoice_seen_on_null`)
			? null
			: copycat.dateString(`${seed}_webinvoice_seen_on`, { min: issuedDate }),
		your_city: copycat.city(`${seed}_your_city`),
		your_country: copycat.oneOf(`${seed}_your_country`, [...countries]),
		your_local_vat_no: copycat.bool(`${seed}_your_local_vat_no_null`)
			? null
			: copycat.phoneNumber(`${seed}_your_local_vat_no`).replace(/\D/g, ""),
		your_name: copycat.username(`${seed}_your_name`),
		your_registration_no: copycat.phoneNumber(`${seed}_your_registration_no`).replace(/\D/g, ""),
		your_street: copycat.streetAddress(`${seed}_your_street`),
		your_vat_no: copycat.phoneNumber(`${seed}_your_vat_no`).replace(/\D/g, ""),
		your_zip: copycat.int(`${seed}_your_zip`, { min: 10_000, max: 99_999 }).toString(),

		...initial,
	};
};

export { createInvoice, createLine, createAttachment, createVatRatesSummary, createPayment, createPaidAdvance };
