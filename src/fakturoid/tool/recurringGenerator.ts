import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getRecurringGenerators = createTool(
	"fakturoid_get_recurring_generators",
	async (client, { accountSlug }) => {
		const recurringGenerators = await client.getRecurringGenerators(accountSlug);

		return {
			content: [{ text: JSON.stringify(recurringGenerators, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const getRecurringGenerator = createTool(
	"fakturoid_get_recurring_generator",
	async (client, { accountSlug, id }) => {
		const recurringGenerator = await client.getRecurringGenerator(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const createRecurringGenerator = createTool(
	"fakturoid_create_recurring_generator",
	async (client, { accountSlug, recurringGeneratorData }) => {
		const recurringGenerator = await client.createRecurringGenerator(accountSlug, recurringGeneratorData);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		recurringGeneratorData: z.any(), // Using z.any() since CreateRecurringGenerator type is not available here
	}),
);

const updateRecurringGenerator = createTool(
	"fakturoid_update_recurring_generator",
	async (client, { accountSlug, id, recurringGeneratorData }) => {
		const recurringGenerator = await client.updateRecurringGenerator(accountSlug, id, recurringGeneratorData);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
		recurringGeneratorData: z.any(), // Using z.any() since UpdateRecurringGenerator type is not available here
	}),
);

const deleteRecurringGenerator = createTool(
	"fakturoid_delete_recurring_generator",
	async (client, { accountSlug, id }) => {
		await client.deleteRecurringGenerator(accountSlug, id);

		return {
			content: [{ text: "Recurring generator deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const recurringGenerator = [
	getRecurringGenerators,
	getRecurringGenerator,
	createRecurringGenerator,
	updateRecurringGenerator,
	deleteRecurringGenerator,
] as const satisfies ServerToolCreator[];

export { recurringGenerator };
