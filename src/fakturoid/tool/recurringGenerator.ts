import { z } from "zod/v3";
import { CreateRecurringGeneratorSchema, UpdateRecurringGeneratorSchema } from "../model/recurringGenerator.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getRecurringGenerators = createTool(
	"fakturoid_get_recurring_generators",
	"Get Recurring Generators",
	"Retrieve a list of all recurring generators (templates for automatically generated recurring invoices)",
	async (client) => {
		const recurringGenerators = await client.getRecurringGenerators();

		return {
			content: [{ text: JSON.stringify(recurringGenerators, null, 2), type: "text" }],
		};
	},
);

const getRecurringGenerator = createTool(
	"fakturoid_get_recurring_generator",
	"Get Recurring Generator",
	"Retrieve detailed information about a specific recurring generator by its ID",
	async (client, { id }) => {
		const recurringGenerator = await client.getRecurringGenerator(id);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const createRecurringGenerator = createTool(
	"fakturoid_create_recurring_generator",
	"Create Recurring Generator",
	"Create a new recurring generator for automatically generating invoices on a schedule",
	async (client, recurringGeneratorData) => {
		const recurringGenerator = await client.createRecurringGenerator(recurringGeneratorData);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	CreateRecurringGeneratorSchema.shape,
);

const updateRecurringGenerator = createTool(
	"fakturoid_update_recurring_generator",
	"Update Recurring Generator",
	"Update an existing recurring generator with new data",
	async (client, { id, recurringGeneratorData }) => {
		const recurringGenerator = await client.updateRecurringGenerator(id, recurringGeneratorData);

		return {
			content: [{ text: JSON.stringify(recurringGenerator, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		recurringGeneratorData: UpdateRecurringGeneratorSchema,
	},
);

const deleteRecurringGenerator = createTool(
	"fakturoid_delete_recurring_generator",
	"Delete Recurring Generator",
	"Delete a recurring generator by its ID",
	async (client, { id }) => {
		await client.deleteRecurringGenerator(id);

		return {
			content: [{ text: "Recurring generator deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const recurringGenerator = [
	getRecurringGenerators,
	getRecurringGenerator,
	createRecurringGenerator,
	updateRecurringGenerator,
	deleteRecurringGenerator,
] as const satisfies ServerToolCreator[];

export { recurringGenerator };
