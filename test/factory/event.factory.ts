import type { Event } from "../../src/fakturoid/model/event";
import { copycat, type Input } from "@snaplet/copycat";

const createEvent = (seed: Input, initial: Partial<Event> = {}): Event => {
	const baseDate = copycat.dateString(seed, { minYear: new Date().getFullYear() });

	const relatedObjectTypes = [
		"Invoice",
		"Subject",
		"Expense",
		"Generator",
		// biome-ignore lint/nursery/noSecrets: Not a secret
		"RecurringGenerator",
		// biome-ignore lint/nursery/noSecrets: Not a secret
		"ExpenseGenerator",
		"Estimate",
	] as const;
	const eventNames = [
		"document_created",
		"document_updated",
		"document_sent",
		"document_paid",
		"document_cancelled",
		"subject_created",
		"subject_updated",
		"expense_created",
		"expense_updated",
		"generator_created",
		"generator_updated",
	] as const;

	const eventTexts = [
		"Document was created",
		"Document was updated",
		"Document was sent via email",
		"Document was marked as paid",
		"Document was cancelled",
		"Subject was created",
		"Subject was updated",
		"Expense was created",
		"Expense was updated",
		"Generator was created",
		"Generator was updated",
	] as const;

	const relatedObjectCount = copycat.int(`${seed}_related_count`, { min: 1, max: 3 });
	const relatedObjects = Array.from({ length: relatedObjectCount }, (_, i) => ({
		id: copycat.int(`${seed}_related_${i}_id`, { min: 1, max: 10_000 }),
		type: copycat.oneOf(`${seed}_related_${i}_type`, [...relatedObjectTypes]),
	}));

	const eventName = copycat.oneOf(`${seed}_name`, [...eventNames]);
	const eventText = copycat.oneOf(`${seed}_text`, [...eventTexts]);

	const params: Record<string, unknown> = {};
	if (eventName.includes("document")) {
		params.document_id = copycat.int(`${seed}_document_id`, { min: 1, max: 10_000 });
		params.document_number = copycat.int(`${seed}_document_number`, { min: 2_024_001, max: 2_024_999 }).toString();

		if (eventName.includes("sent")) {
			params.email = copycat.email(`${seed}_email`);
		}

		if (eventName.includes("paid")) {
			params.amount = copycat.int(`${seed}_amount`, { min: 100, max: 50_000 }).toString();
			params.currency = copycat.oneOf(`${seed}_currency`, ["CZK", "EUR", "USD"]);
		}
	}

	if (eventName.includes("subject")) {
		params.subject_id = copycat.int(`${seed}_subject_id`, { min: 1, max: 10_000 });
		params.subject_name = copycat.username(`${seed}_subject_name`);
	}

	if (eventName.includes("expense")) {
		params.expense_id = copycat.int(`${seed}_expense_id`, { min: 1, max: 10_000 });
		params.expense_number = copycat.int(`${seed}_expense_number`, { min: 2_024_001, max: 2_024_999 }).toString();
	}

	if (eventName.includes("generator")) {
		params.generator_id = copycat.int(`${seed}_generator_id`, { min: 1, max: 1000 });
		params.generator_name = copycat.sentence(`${seed}_generator_name`);
	}

	return {
		created_at: baseDate,
		name: eventName,
		params: params,
		related_objects: relatedObjects,
		text: eventText,
		user: {
			avatar: copycat.bool(`${seed}_user_avatar_null`) ? null : copycat.url(`${seed}_user_avatar`),
			full_name: copycat.fullName(`${seed}_user_full_name`),
			id: copycat.int(`${seed}_user_id`, { min: 1, max: 10_000 }),
		},

		...initial,
	};
};

export { createEvent };
