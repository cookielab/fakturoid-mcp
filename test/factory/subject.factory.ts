import { copycat, type Input } from "@snaplet/copycat";
import {
	SUBJECT_SETTING,
	SUBJECT_TYPE,
	SUBJECT_WEBINVOICE_HISTORY,
	type Subject,
} from "../../src/fakturoid/model/subject";

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

const createSubject = (seed: Input, initial: Partial<Subject> = {}): Subject => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });
	const unreliableCheckedDate = copycat.bool(`${seed}_unreliable_checked`)
		? copycat.dateString(`${seed}_unreliable_checked_date`, { min: baseDate })
		: null;

	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF", "CHF", "SEK", "NOK", "DKK"] as const;
	const countries = ["CZ", "SK", "DE", "AT", "US", "GB", "FR", "IT", "ES", "NL", "BE", "PL", "HU"] as const;
	const languages = ["cz", "sk", "en", "de", "fr", "it", "es", "ru", "pl", "hu", "ro"] as const;
	const legalForms = ["112", "121", "205", "301", "421", "601", "701", "801"] as const;
	const vatModes = ["vat_payer", "non_vat_payer", "identified_person"] as const;

	const isCompany = copycat.bool(`${seed}_is_company`);
	const hasDeliveryAddress = copycat.bool(`${seed}_has_delivery`);
	const unreliable = copycat.bool(`${seed}_unreliable_null`) ? null : copycat.bool(`${seed}_unreliable`);

	return {
		ares_update: copycat.bool(`${seed}_ares_update`),
		bank_account: copycat.bool(`${seed}_bank_null`) ? null : generateAccountNumber(`${seed}_bank`),
		city: copycat.bool(`${seed}_city_null`) ? null : copycat.city(`${seed}_city`),
		country: copycat.bool(`${seed}_country_null`) ? null : copycat.oneOf(`${seed}_country`, [...countries]),
		created_at: baseDate,
		currency: copycat.bool(`${seed}_currency_null`) ? null : copycat.oneOf(`${seed}_currency`, [...currencies]),
		custom_email_text: copycat.bool(`${seed}_custom_email_null`) ? null : copycat.sentence(`${seed}_custom_email`),
		custom_estimate_email_text: copycat.bool(`${seed}_custom_estimate_email_null`)
			? null
			: copycat.sentence(`${seed}_custom_estimate_email`),
		custom_id: copycat.bool(`${seed}_custom_id_null`) ? null : copycat.uuid(`${seed}_custom_id`),
		delivery_city:
			hasDeliveryAddress && !copycat.bool(`${seed}_delivery_city_null`) ? copycat.city(`${seed}_delivery_city`) : null,
		delivery_country:
			hasDeliveryAddress && !copycat.bool(`${seed}_delivery_country_null`)
				? copycat.oneOf(`${seed}_delivery_country`, [...countries])
				: null,
		delivery_name:
			hasDeliveryAddress && !copycat.bool(`${seed}_delivery_name_null`)
				? copycat.username(`${seed}_delivery_name`)
				: null,
		delivery_street:
			hasDeliveryAddress && !copycat.bool(`${seed}_delivery_street_null`)
				? copycat.streetAddress(`${seed}_delivery_street`)
				: null,
		delivery_zip:
			hasDeliveryAddress && !copycat.bool(`${seed}_delivery_zip_null`)
				? copycat.int(`${seed}_delivery_zip`, { min: 10_000, max: 99_999 }).toString()
				: null,
		due: copycat.bool(`${seed}_due_null`) ? null : copycat.int(`${seed}_due`, { min: 7, max: 90 }),
		email: copycat.bool(`${seed}_email_null`) ? null : copycat.email(`${seed}_email`),
		email_copy: copycat.bool(`${seed}_email_copy_null`) ? null : copycat.email(`${seed}_email_copy`),
		full_name: copycat.bool(`${seed}_full_name_null`) ? null : copycat.fullName(`${seed}_full_name`),
		has_delivery_address: hasDeliveryAddress,
		html_url: copycat.url(`${seed}_html_url`),
		iban: copycat.bool(`${seed}_iban_null`) ? null : generateIBAN(`${seed}_iban`),
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		invoice_from_proforma_email_text: copycat.bool(`${seed}_invoice_proforma_email_null`)
			? null
			: copycat.sentence(`${seed}_invoice_proforma_email`),
		language: copycat.bool(`${seed}_language_null`) ? null : copycat.oneOf(`${seed}_language`, [...languages]),
		legal_form: copycat.bool(`${seed}_legal_form_null`) ? null : copycat.oneOf(`${seed}_legal_form`, [...legalForms]),
		local_vat_no: copycat.bool(`${seed}_local_vat_null`)
			? null
			: copycat.phoneNumber(`${seed}_local_vat`).replace(/\D/g, ""),
		name: isCompany ? copycat.username(`${seed}_name`) : copycat.fullName(`${seed}_name`),
		overdue_email_text: copycat.bool(`${seed}_overdue_email_null`) ? null : copycat.sentence(`${seed}_overdue_email`),
		phone: copycat.bool(`${seed}_phone_null`) ? null : copycat.phoneNumber(`${seed}_phone`),
		private_note: copycat.bool(`${seed}_private_note_null`) ? null : copycat.paragraph(`${seed}_private_note`),
		registration_no: copycat.bool(`${seed}_registration_null`)
			? null
			: copycat.phoneNumber(`${seed}_registration`).replace(/\D/g, ""),
		setting_estimate_pdf_attachments: copycat.oneOf(`${seed}_setting_estimate`, [...SUBJECT_SETTING]),
		setting_invoice_pdf_attachments: copycat.oneOf(`${seed}_setting_invoice`, [...SUBJECT_SETTING]),
		setting_invoice_send_reminders: copycat.oneOf(`${seed}_setting_reminders`, [...SUBJECT_SETTING]),
		setting_update_from_ares: copycat.oneOf(`${seed}_setting_ares`, [...SUBJECT_SETTING]),
		street: copycat.bool(`${seed}_street_null`) ? null : copycat.streetAddress(`${seed}_street`),
		suggestion_enabled: copycat.bool(`${seed}_suggestion`),
		swift_bic: copycat.bool(`${seed}_swift_bic_null`) ? null : generateBIC(`${seed}_swift_bic`),
		thank_you_email_text: copycat.bool(`${seed}_thank_you_email_null`)
			? null
			: copycat.sentence(`${seed}_thank_you_email`),
		type: copycat.oneOf(`${seed}_type`, [...SUBJECT_TYPE]),
		unreliable: unreliable,
		unreliable_checked_at: unreliableCheckedDate,
		updated_at: updatedDate,
		url: copycat.url(`${seed}_url`),
		user_id: copycat.bool(`${seed}_user_id_null`) ? null : copycat.int(`${seed}_user_id`, { min: 1, max: 10_000 }),
		variable_symbol: copycat.bool(`${seed}_variable_symbol_null`)
			? null
			: copycat.int(`${seed}_variable_symbol`, { min: 1000, max: 9999 }).toString(),
		vat_mode: copycat.bool(`${seed}_vat_mode_null`) ? null : copycat.oneOf(`${seed}_vat_mode`, [...vatModes]),
		vat_no: copycat.bool(`${seed}_vat_no_null`) ? null : copycat.phoneNumber(`${seed}_vat_no`).replace(/\D/g, ""),
		web: copycat.bool(`${seed}_web_null`) ? null : copycat.url(`${seed}_web`),
		webinvoice_history: copycat.bool(`${seed}_webinvoice_history_null`)
			? null
			: copycat.oneOf(`${seed}_webinvoice_history`, [...SUBJECT_WEBINVOICE_HISTORY]),
		zip: copycat.bool(`${seed}_zip_null`) ? null : copycat.int(`${seed}_zip`, { min: 10_000, max: 99_999 }).toString(),

		...initial,
	};
};

export { createSubject };
