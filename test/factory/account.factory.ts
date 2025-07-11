import { copycat, type Input } from "@snaplet/copycat";
import {
	ACCOUNT_ESTIMATE,
	ACCOUNT_INVOICE_LANGUAGE,
	ACCOUNT_PAYMENT_METHOD,
	ACCOUNT_VAT_MODE,
	ACCOUNT_VAT_PRICE_MODE,
	type Account,
} from "../../src/fakturoid/model/account";

const createAccount = (seed: Input, initial: Partial<Account> = {}): Account => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });

	// Common payment methods and currencies for realistic distribution
	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const plans = ["free", "light", "everyday", "max"] as const;
	const units = ["pcs", "kg", "m", "l", "hours", "days"] as const;

	return {
		city: copycat.city(seed),
		country: copycat.country(seed),
		created_at: baseDate,
		currency: copycat.oneOf(`${seed}_currency`, [...currencies]),
		default_estimate_type: copycat.bool(`${seed}_estimate_null`)
			? null
			: copycat.oneOf(`${seed}_estimate`, [...ACCOUNT_ESTIMATE]),
		digitoo_auto_processing_enabled: copycat.bool(`${seed}_digitoo_auto`),
		digitoo_enabled: copycat.bool(`${seed}_digitoo`),
		digitoo_extractions_remaining: copycat.int(`${seed}_extractions`, { min: 0, max: 1000 }),
		displayed_note: copycat.sentence(`${seed}_note`),
		due: copycat.int(`${seed}_due`, { min: 7, max: 90 }),
		fixed_exchange_rate: copycat.bool(`${seed}_fixed_rate`),
		full_name: copycat.bool(`${seed}_name_null`) ? null : copycat.fullName(`${seed}_name`),
		invoice_email: copycat.email(`${seed}_email`),
		invoice_gopay: copycat.bool(`${seed}_gopay`),
		invoice_hide_bank_account_for_payments: copycat.bool(`${seed}_hide_null`)
			? null
			: (copycat.someOf(
					`${seed}_hide_payments`,
					[0, 3],
					[...ACCOUNT_PAYMENT_METHOD],
				) as Account["invoice_hide_bank_account_for_payments"]),
		invoice_language: copycat.oneOf(`${seed}_lang`, [...ACCOUNT_INVOICE_LANGUAGE]),
		invoice_note: copycat.sentence(`${seed}_invoice_note`),
		invoice_payment_method: copycat.bool(`${seed}_payment_null`)
			? null
			: copycat.oneOf(`${seed}_payment`, [...ACCOUNT_PAYMENT_METHOD]),
		invoice_paypal: copycat.bool(`${seed}_paypal`),
		invoice_proforma: copycat.bool(`${seed}_proforma`),
		invoice_selfbilling: copycat.bool(`${seed}_selfbill`),
		local_vat_no: copycat.bool(`${seed}_local_vat_null`)
			? null
			: copycat.phoneNumber(`${seed}_local_vat`).replace(/\D/g, ""),
		name: copycat.username(`${seed}_company`),
		overdue_email_days: copycat.int(`${seed}_overdue_days`, { min: 1, max: 30 }),
		phone: copycat.bool(`${seed}_phone_null`) ? null : copycat.phoneNumber(`${seed}_phone`),
		plan: copycat.oneOf(`${seed}_plan`, [...plans]),
		plan_paid_users: copycat.int(`${seed}_paid_users`, { min: 1, max: 100 }),
		plan_price: copycat.int(`${seed}_price`, { min: 0, max: 10_000 }),
		registration_no: copycat.phoneNumber(`${seed}_reg`).replace(/\D/g, ""),
		send_invoice_from_proforma_email: copycat.bool(`${seed}_proforma_email`),
		send_overdue_email: copycat.bool(`${seed}_overdue_email`),
		send_repeated_reminders: copycat.bool(`${seed}_repeated`),
		send_thank_you_email: copycat.bool(`${seed}_thank_you`),
		street: copycat.streetAddress(`${seed}_street`),
		subdomain: copycat.username(`${seed}_subdomain`).toLowerCase(),
		unit_name: copycat.oneOf(`${seed}_unit`, [...units]),
		updated_at: updatedDate,
		vat_mode: copycat.oneOf(`${seed}_vat_mode`, [...ACCOUNT_VAT_MODE]),
		vat_no: copycat.phoneNumber(`${seed}_vat_no`).replace(/\D/g, ""),
		vat_price_mode: copycat.oneOf(`${seed}_vat_price`, [...ACCOUNT_VAT_PRICE_MODE]),
		vat_rate: copycat.oneOf(`${seed}_vat_rate`, [0, 10, 15, 20, 21, 25]),
		web: copycat.bool(`${seed}_web_null`) ? null : copycat.url(`${seed}_web`),
		zip: copycat.int(`${seed}_zip`, { min: 10_000, max: 99_999 }).toString(),

		...initial, // Override with any provided initial values
	};
};
export { createAccount };
