import type { BankAccount } from "../../src/fakturoid/model/bankAccount";
import { copycat, type Input } from "@snaplet/copycat";

const generateBIC = (seed: Input): string => {
	const bankCode = copycat.oneOf(`${seed}_bank`, ["BACX", "CEKO", "CNBA", "AGBA", "FIOB", "RZBP", "GIBACZPX"]);
	const countryCode = copycat.oneOf(`${seed}_country`, ["CZ", "SK", "DE", "AT"]);
	const locationCode = copycat.oneOf(`${seed}_location`, ["PP", "PX", "22", "33"]);
	return `${bankCode}${countryCode}${locationCode}`;
};

const generateIBAN = (seed: Input): string => {
	const countryCode = copycat.oneOf(`${seed}_country`, ["CZ", "SK", "DE", "AT", "NL", "BE", "FR", "IT"]);
	const checkDigits = copycat.int(`${seed}_check`, { min: 10, max: 99 }).toString();
	const bankCode = copycat.int(`${seed}_bank`, { min: 1000, max: 9999 }).toString();
	const accountNumber = copycat.int(`${seed}_acc`, { min: 1_000_000_000, max: 9_999_999_999 }).toString();
	return `${countryCode}${checkDigits}${bankCode}${accountNumber}`;
};

const generateAccountNumber = (seed: Input): string => {
	const prefix = copycat.bool(`${seed}_prefix`) ? `${copycat.int(`${seed}_pre`, { min: 1, max: 999 })}-` : "";
	const mainNumber = copycat.int(`${seed}_main`, { min: 1_000_000, max: 9_999_999_999 });
	const suffix = copycat.int(`${seed}_suffix`, { min: 1000, max: 9999 });
	return `${prefix}${mainNumber}/${suffix}`;
};

const createBankAccount = (seed: Input, initial: Partial<BankAccount> = {}): BankAccount => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });

	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF", "CHF", "SEK", "NOK", "DKK"] as const;
	const bankNames = [
		"Main Account",
		"Business Account",
		"Savings Account",
		"Current Account",
		"EUR Account",
		"USD Account",
		"Reserve Account",
		"Operating Account",
	];

	return {
		created_at: baseDate,
		currency: copycat.oneOf(`${seed}_currency`, [...currencies]),
		default: copycat.bool(`${seed}_default`),
		expense_pairing: copycat.bool(`${seed}_expense_pairing`),
		iban: copycat.bool(`${seed}_iban_null`) ? null : generateIBAN(`${seed}_iban`),
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		name: copycat.oneOf(`${seed}_name`, bankNames),
		number: generateAccountNumber(`${seed}_number`),
		pairing: copycat.bool(`${seed}_pairing`),
		payment_adjustment: copycat.bool(`${seed}_payment_adjustment`),
		swift_bic: copycat.bool(`${seed}_bic_null`) ? null : generateBIC(`${seed}_bic`),
		updated_at: updatedDate,

		...initial,
	};
};

export { createBankAccount };
