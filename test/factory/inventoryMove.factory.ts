import type { InventoryMove } from "../../src/fakturoid/model/inventoryMove";
import { copycat, type Input } from "@snaplet/copycat";

const createInventoryMove = (seed: Input, initial: Partial<InventoryMove> = {}): InventoryMove => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const updatedDate = copycat.dateString(`${seed}_updated`, { min: baseDate });
	const movedDate = copycat.dateString(`${seed}_moved`, { min: baseDate });

	const directions = ["in", "out"] as const;
	const direction = copycat.oneOf(`${seed}_direction`, [...directions]);

	// biome-ignore lint/nursery/noSecrets: Not a secret
	const documentTypes = ["Estimate", "Expense", "ExpenseGenerator", "Generator", "Invoice"] as const;
	const hasDocument = copycat.bool(`${seed}_has_document`);

	const currencies = ["USD", "EUR", "GBP", "CZK", "PLN", "HUF"] as const;
	const purchaseCurrency = copycat.oneOf(`${seed}_purchase_currency`, [...currencies]);
	const retailCurrency = copycat.oneOf(`${seed}_retail_currency`, [...currencies]);

	const purchasePrice = copycat.int(`${seed}_purchase_price`, { min: 10, max: 5000 });
	const retailPrice = copycat.int(`${seed}_retail_price`, { min: purchasePrice, max: purchasePrice * 3 });
	const nativePurchasePrice = copycat.int(`${seed}_native_purchase_price`, { min: 10, max: 5000 });
	const nativeRetailPrice = copycat.int(`${seed}_native_retail_price`, {
		min: nativePurchasePrice,
		max: nativePurchasePrice * 3,
	});

	// Quantity change - positive for "in", can be negative for "out"
	const maxQuantity = direction === "in" ? 1000 : 500;
	const minQuantity = direction === "in" ? 1 : -500;
	const quantityChange = copycat.int(`${seed}_quantity_change`, { min: minQuantity, max: maxQuantity });

	return {
		created_at: baseDate,
		direction: direction,
		document: hasDocument
			? {
					id: copycat.int(`${seed}_document_id`, { min: 1, max: 10_000 }),
					line_id: copycat.int(`${seed}_line_id`, { min: 1, max: 10_000 }),
					type: copycat.oneOf(`${seed}_document_type`, [...documentTypes]),
				}
			: null,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		inventory_item_id: copycat.int(`${seed}_inventory_item_id`, { min: 1, max: 10_000 }),
		moved_on: movedDate,
		native_purchase_price: copycat.bool(`${seed}_native_purchase_price_null`) ? null : nativePurchasePrice,
		native_retail_price: copycat.bool(`${seed}_native_retail_price_null`) ? null : nativeRetailPrice,
		private_note: copycat.bool(`${seed}_private_note_null`) ? null : copycat.sentence(`${seed}_private_note`),
		purchase_currency: copycat.bool(`${seed}_purchase_currency_null`) ? null : purchaseCurrency,
		purchase_price: purchasePrice,
		quantity_change: quantityChange,
		retail_currency: copycat.bool(`${seed}_retail_currency_null`) ? null : retailCurrency,
		retail_price: copycat.bool(`${seed}_retail_price_null`) ? null : retailPrice,
		updated_at: updatedDate,

		...initial,
	};
};

export { createInventoryMove };
