import type { Todo } from "../../src/fakturoid/model/todo";
import { copycat, type Input } from "@snaplet/copycat";

const createTodo = (seed: Input, initial: Partial<Todo> = {}): Todo => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });
	const isCompleted = copycat.bool(`${seed}_completed`);
	const completedDate = isCompleted ? copycat.dateString(`${seed}_completed_at`, { min: baseDate }) : null;

	const relatedObjectTypes = [
		"Invoice",
		"Subject",
		"Expense",
		"Generator",
		// biome-ignore lint/nursery/noSecrets: Not a secret
		"RecurringGenerator",
		// biome-ignore lint/nursery/noSecrets: Not a secret
		"ExpenseGenerator",
	] as const;
	const todoNames = [
		"overdue_invoice_reminder",
		"due_expense_reminder",
		"low_inventory_warning",
		"payment_received",
		"document_needs_review",
		"recurring_invoice_generated",
		"expense_approval_required",
		"subject_data_incomplete",
		"tax_period_closing",
		"backup_reminder",
	] as const;

	const todoTexts = [
		"Invoice is overdue and needs follow-up",
		"Expense is due for payment",
		"Inventory item quantity is below minimum",
		"Payment has been received",
		"Document requires review before sending",
		"Recurring invoice has been generated",
		"Expense requires approval",
		"Subject data is incomplete",
		"Tax period is closing soon",
		"Regular backup reminder",
	] as const;

	const relatedObjectCount = copycat.int(`${seed}_related_count`, { min: 1, max: 2 });
	const relatedObjects = Array.from({ length: relatedObjectCount }, (_, i) => ({
		id: copycat.int(`${seed}_related_${i}_id`, { min: 1, max: 10_000 }),
		type: copycat.oneOf(`${seed}_related_${i}_type`, [...relatedObjectTypes]),
	}));

	const todoName = copycat.oneOf(`${seed}_name`, [...todoNames]);
	const todoText = copycat.oneOf(`${seed}_text`, [...todoTexts]);

	// Generate realistic params based on todo type
	const params: Record<string, unknown> = {};
	if (todoName.includes("invoice")) {
		params.invoice_id = copycat.int(`${seed}_invoice_id`, { min: 1, max: 10_000 });
		params.invoice_number = copycat.int(`${seed}_invoice_number`, { min: 2_024_001, max: 2_024_999 }).toString();

		if (todoName.includes("overdue")) {
			params.days_overdue = copycat.int(`${seed}_days_overdue`, { min: 1, max: 90 });
			params.amount = copycat.int(`${seed}_amount`, { min: 100, max: 50_000 }).toString();
			params.currency = copycat.oneOf(`${seed}_currency`, ["CZK", "EUR", "USD"]);
		}
	}

	if (todoName.includes("expense")) {
		params.expense_id = copycat.int(`${seed}_expense_id`, { min: 1, max: 10_000 });
		params.expense_number = copycat.int(`${seed}_expense_number`, { min: 2_024_001, max: 2_024_999 }).toString();

		if (todoName.includes("due")) {
			params.due_date = copycat.dateString(`${seed}_due_date`, { minYear: new Date().getFullYear() });
			params.amount = copycat.int(`${seed}_amount`, { min: 100, max: 50_000 }).toString();
		}
	}

	if (todoName.includes("inventory")) {
		params.inventory_item_id = copycat.int(`${seed}_inventory_item_id`, { min: 1, max: 10_000 });
		params.item_name = copycat.username(`${seed}_item_name`);
		params.current_quantity = copycat.int(`${seed}_current_quantity`, { min: 0, max: 10 });
		params.minimum_quantity = copycat.int(`${seed}_minimum_quantity`, { min: 5, max: 50 });
	}

	if (todoName.includes("payment")) {
		params.payment_id = copycat.int(`${seed}_payment_id`, { min: 1, max: 10_000 });
		params.amount = copycat.int(`${seed}_amount`, { min: 100, max: 50_000 }).toString();
		params.currency = copycat.oneOf(`${seed}_currency`, ["CZK", "EUR", "USD"]);
		params.payment_method = copycat.oneOf(`${seed}_payment_method`, ["bank", "card", "cash", "paypal"]);
	}

	if (todoName.includes("subject")) {
		params.subject_id = copycat.int(`${seed}_subject_id`, { min: 1, max: 10_000 });
		params.subject_name = copycat.username(`${seed}_subject_name`);
		params.missing_fields = copycat.someOf(
			`${seed}_missing_fields`,
			[1, 3],
			["email", "address", "vat_no", "registration_no"],
		);
	}

	if (todoName.includes("recurring") || todoName.includes("generator")) {
		params.generator_id = copycat.int(`${seed}_generator_id`, { min: 1, max: 1000 });
		params.generator_name = copycat.sentence(`${seed}_generator_name`);

		if (todoName.includes("generated")) {
			params.generated_document_id = copycat.int(`${seed}_generated_document_id`, { min: 1, max: 10_000 });
		}
	}

	return {
		completed_at: completedDate,
		created_at: baseDate,
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		name: todoName,
		params: params,
		related_objects: relatedObjects,
		text: todoText,

		...initial,
	};
};

export { createTodo };
