import type { InventoryItem } from "../../src/fakturoid/model/inventoryItem";
import { copycat, type Input } from "@snaplet/copycat";

const createInventoryItem = (seed: Input, initial: Partial<InventoryItem> = {}): InventoryItem => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });

	const articleNumberTypes = ["ian", "ean", "isbn"] as const;
	const suggestForValues = ["invoices", "expenses", "both"] as const;
	const supplyTypes = ["goods", "service"] as const;
	const vatRates = ["standard", "reduced", "reduced2", "zero"] as const;
	const units = ["pcs", "kg", "m", "l", "hours", "days", "m²", "m³", "box", "set"] as const;

	const trackQuantity = copycat.bool(`${seed}_track_quantity`);
	const isArchived = copycat.bool(`${seed}_archived`);
	const purchasePrice = copycat.int(`${seed}_purchase_price`, { min: 10, max: 5000 });
	const retailPrice = copycat.int(`${seed}_retail_price`, { min: purchasePrice, max: purchasePrice * 3 });
	const currentQuantity = copycat.int(`${seed}_quantity`, { min: 0, max: 1000 });
	const minQuantity = copycat.int(`${seed}_min_quantity`, { min: 1, max: 50 });
	const maxQuantity = copycat.int(`${seed}_max_quantity`, { min: minQuantity + 50, max: 1000 });
	const isLowQuantity = currentQuantity < minQuantity;

	const productNames = [
		"Professional Service",
		"Consulting Hours",
		"Software License",
		"Hardware Component",
		"Office Supplies",
		"Marketing Materials",
		"Training Course",
		"Maintenance Contract",
		"Premium Support",
		"Custom Development",
	];

	return {
		allow_below_zero: copycat.bool(`${seed}_allow_below_zero`),
		archived: isArchived,
		article_number: copycat.bool(`${seed}_article_number_null`)
			? null
			: copycat.uuid(`${seed}_article_number`).slice(0, 12),
		article_number_type: copycat.oneOf(`${seed}_article_number_type`, [...articleNumberTypes]),
		average_native_purchase_price: (
			purchasePrice * copycat.float(`${seed}_avg_multiplier`, { min: 0.8, max: 1.2 })
		).toFixed(2),
		created_at: baseDate,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		low_quantity_date: isLowQuantity ? copycat.dateString(`${seed}_low_quantity_date`, { min: baseDate }) : null,
		max_quantity: trackQuantity && copycat.bool(`${seed}_max_quantity_null`) ? null : maxQuantity.toString(),
		min_quantity: trackQuantity && copycat.bool(`${seed}_min_quantity_null`) ? null : minQuantity.toString(),
		name: copycat.oneOf(`${seed}_name`, productNames),
		native_purchase_price: purchasePrice.toString(),
		native_retail_price: retailPrice.toString(),
		private_note: copycat.bool(`${seed}_private_note_null`) ? null : copycat.sentence(`${seed}_private_note`),
		quantity: currentQuantity.toString(),
		sku: copycat.uuid(`${seed}_sku`).slice(0, 8).toUpperCase(),
		suggest_for: copycat.oneOf(`${seed}_suggest_for`, [...suggestForValues]),
		supply_type: copycat.oneOf(`${seed}_supply_type`, [...supplyTypes]),
		track_quantity: trackQuantity,
		unit_name: copycat.bool(`${seed}_unit_name_null`) ? null : copycat.oneOf(`${seed}_unit_name`, [...units]),
		updated_at: updatedDate,
		vat_rate: copycat.bool(`${seed}_vat_rate_null`) ? null : copycat.oneOf(`${seed}_vat_rate`, [...vatRates]),

		...initial,
	};
};

export { createInventoryItem };
