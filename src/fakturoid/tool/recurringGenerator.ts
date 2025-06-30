import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getRecurringGenerators = createTool("fakturoid_get_recurring_generators", async (client) => {
	const recurringGenerators = await client.getRecurringGenerators();

	return {
		content: [{ text: JSON.stringify(recurringGenerators, null, 2), type: "text" }],
	};
});

const getRecurringGenerator = createTool(
	"fakturoid_get_recurring_generator",
	async (client, { id }) => {
		const recurringGenerator = await client.getRecurringGenerator(id);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const createRecurringGenerator = createTool(
	"fakturoid_create_recurring_generator",
	async (client, { recurringGeneratorData }) => {
		const recurringGenerator = await client.createRecurringGenerator(recurringGeneratorData);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	z.object({
		recurringGeneratorData: z.any(), // Using z.any() since CreateRecurringGenerator type is not available here
	}),
);

const updateRecurringGenerator = createTool(
	"fakturoid_update_recurring_generator",
	async (client, { id, recurringGeneratorData }) => {
		const recurringGenerator = await client.updateRecurringGenerator(id, recurringGeneratorData);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
		recurringGeneratorData: z.any(), // Using z.any() since UpdateRecurringGenerator type is not available here
	}),
);

const deleteRecurringGenerator = createTool(
	"fakturoid_delete_recurring_generator",
	async (client, { id }) => {
		await client.deleteRecurringGenerator(id);

		return {
			content: [{ text: "Recurring generator deleted successfully", type: "text" }],
		};
	},
	z.object({
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
