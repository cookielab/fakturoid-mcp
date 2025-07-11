import type { Generator, Inventory, Line } from "../../src/fakturoid/model/generator";
import { copycat, type Input } from "@snaplet/copycat";

const createGeneratorInventory = (seed: Input, initial: Partial<Inventory> = {}): Inventory => {
	const articleNumberTypes = ["ian", "ean", "isbn"] as const;

	return {
		article_number: copycat.bool(`${seed}_article_number_null`)
			? undefined
			: copycat.uuid(`${seed}_article_number`).slice(0, 8),
		article_number_type: copycat.oneOf(`${seed}_article_number_type`, [...articleNumberTypes]),
		item_id: copycat.int(`${seed}_item_id`, { min: 1, max: 10_000 }),
		move_id: copycat.int(`${seed}_move_id`, { min: 1, max: 10_000 }),
		sku: copycat.uuid(`${seed}_sku`).slice(0, 12),

		...initial,
	};
};

const createGeneratorLine = (seed: Input, initial: Partial<Line> = {}): Line => {
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
		inventory: copycat.bool(`${seed}_inventory_null`) ? null : createGeneratorInventory(`${seed}_inventory`),
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

const createGenerator = (seed: Input, initial: Partial<Generator> = {}): Generator => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });

	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const languages = ["cz", "sk", "en", "de", "fr", "it", "es", "ru", "pl", "hu", "ro"] as const;
	const paymentMethods = ["bank", "cash", "cod", "card", "paypal", "custom"] as const;
	const ossValues = ["disabled", "service", "goods"] as const;
	const ibanVisibilityValues = ["automatically", "always"] as const;
	const vatPriceModeValues = ["without_vat", "from_total_with_vat"] as const;

	const subtotal = copycat.int(`${seed}_subtotal`, { min: 1000, max: 100_000 });
	const vatRate = copycat.oneOf(`${seed}_vat_rate`, [0, 10, 15, 20, 21, 25]);
	const vat = Math.round((subtotal * vatRate) / 100);
	const total = subtotal + vat;

	const lineCount = copycat.int(`${seed}_line_count`, { min: 1, max: 5 });
	const lines = Array.from({ length: lineCount }, (_, i) => createGeneratorLine(`${seed}_line_${i}`));

	const tagCount = copycat.int(`${seed}_tag_count`, { min: 0, max: 4 });
	const tags =
		tagCount > 0
			? copycat.someOf(
					`${seed}_tags`,
					[tagCount, tagCount],
					["template", "recurring", "service", "product", "monthly", "quarterly", "annual"],
				)
			: [];

	const generatorNames = [
		"Monthly Service Invoice",
		"Product Sales Template",
		"Consulting Services",
		"Recurring License Fee",
		"Maintenance Contract",
		"Hosting Services",
		"Support Package",
		"Training Course",
		"Software Development",
		"Marketing Services",
	] as const;

	return {
		bank_account_id: copycat.bool(`${seed}_bank_account_id_null`)
			? null
			: copycat.int(`${seed}_bank_account_id`, { min: 1, max: 100 }),
		created_at: baseDate,
		currency: copycat.oneOf(`${seed}_currency`, [...currencies]),
		custom_id: copycat.bool(`${seed}_custom_id_null`) ? null : copycat.uuid(`${seed}_custom_id`),
		custom_payment_method: copycat.bool(`${seed}_custom_payment_method_null`)
			? null
			: copycat.word(`${seed}_custom_payment_method`),
		due: copycat.int(`${seed}_due`, { min: 14, max: 90 }),
		exchange_rate: copycat.bool(`${seed}_exchange_rate_null`)
			? undefined
			: copycat.float(`${seed}_exchange_rate`, { min: 0.5, max: 2 }).toFixed(4),
		footer_note: copycat.bool(`${seed}_footer_note_null`) ? undefined : copycat.sentence(`${seed}_footer_note`),
		gopay: copycat.bool(`${seed}_gopay`),
		html_url: copycat.url(`${seed}_html_url`),
		iban_visibility: copycat.oneOf(`${seed}_iban_visibility`, [...ibanVisibilityValues]),
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		language: copycat.oneOf(`${seed}_language`, [...languages]),
		legacy_bank_details: copycat.bool(`${seed}_legacy_bank_details_null`)
			? null
			: {
					bank_account: copycat.phoneNumber(`${seed}_bank_account`).replace(/\D/g, ""),
					iban: copycat.uuid(`${seed}_iban`).slice(0, 22),
					swift_bic: copycat.uuid(`${seed}_swift_bic`).slice(0, 11),
				},
		lines: lines,
		name: copycat.oneOf(`${seed}_name`, [...generatorNames]),
		native_subtotal: subtotal.toString(),
		native_total: total.toString(),
		note: copycat.bool(`${seed}_note_null`) ? undefined : copycat.sentence(`${seed}_note`),
		number_format_id: copycat.bool(`${seed}_number_format_id_null`)
			? null
			: copycat.int(`${seed}_number_format_id`, { min: 1, max: 100 }),
		order_number: copycat.bool(`${seed}_order_number_null`)
			? undefined
			: copycat.int(`${seed}_order_number`, { min: 1000, max: 9999 }).toString(),
		oss: copycat.oneOf(`${seed}_oss`, [...ossValues]),
		payment_method: copycat.oneOf(`${seed}_payment_method`, [...paymentMethods]),
		paypal: copycat.bool(`${seed}_paypal`),
		proforma: copycat.bool(`${seed}_proforma`),
		subject_id: copycat.int(`${seed}_subject_id`, { min: 1, max: 10_000 }),
		subject_url: copycat.url(`${seed}_subject_url`),
		subtotal: subtotal.toString(),
		supply_code: copycat.bool(`${seed}_supply_code_null`)
			? undefined
			: copycat.int(`${seed}_supply_code`, { min: 1, max: 999 }),
		tags: tags,
		tax_date_at_end_of_last_month: copycat.bool(`${seed}_tax_date_at_end_of_last_month`),
		total: total.toString(),
		transferred_tax_liability: copycat.bool(`${seed}_transferred_tax_liability`),
		updated_at: updatedDate,
		url: copycat.url(`${seed}_url`),
		vat_price_mode: copycat.oneOf(`${seed}_vat_price_mode`, [...vatPriceModeValues]),

		...initial,
	};
};

export { createGenerator, createGeneratorLine, createGeneratorInventory };
