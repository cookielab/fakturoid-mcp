import type { NumberFormat } from "../../src/fakturoid/model/numberFormat";
import { copycat, type Input } from "@snaplet/copycat";

const createNumberFormat = (seed: Input, initial: Partial<NumberFormat> = {}): NumberFormat => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });

	const formats = [
		"YYYY-####",
		"####/YYYY",
		"YYYY####",
		"####-YYYY",
		"YYYY-MM-####",
		"####/MM/YYYY",
		"YYYY/MM/####",
		"F-YYYY-####",
		"INV-YYYY-####",
		"####-MM-YYYY",
		"YYYY-Q#-####",
		"####/Q#/YYYY",
	] as const;

	const format = copycat.oneOf(`${seed}_format`, [...formats]);
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;
	const currentQuarter = Math.ceil(currentMonth / 3);
	const sampleNumber = copycat.int(`${seed}_sample_number`, { min: 1, max: 999 });

	// Generate preview based on format
	const preview: string = format
		.replace(/YYYY/g, currentYear.toString())
		.replace(/MM/g, currentMonth.toString().padStart(2, "0"))
		.replace(/Q#/g, `Q${currentQuarter}`)
		.replace(/####/g, sampleNumber.toString().padStart(4, "0"));

	const isDefault = copycat.bool(`${seed}_is_default`);

	return {
		created_at: baseDate,
		default: isDefault,
		format: format,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		preview: preview,
		updated_at: updatedDate,

		...initial,
	};
};

export { createNumberFormat };
