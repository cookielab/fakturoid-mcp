import { z } from "zod/v3";
import { CreateGeneratorSchema, UpdateGeneratorSchema } from "../model/generator.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getGenerators = createTool(
	"fakturoid_get_generators",
	"Get Generators",
	"Retrieve a list of all invoice generators (templates for recurring invoices)",
	async (client) => {
		const generators = await client.getGenerators();

		return {
			content: [{ text: JSON.stringify(generators, null, 2), type: "text" }],
		};
	},
);

const getGenerator = createTool(
	"fakturoid_get_generator",
	"Get Generator",
	"Retrieve detailed information about a specific invoice generator by its ID",
	async (client, { id }) => {
		const generator = await client.getGenerator(id);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const createGenerator = createTool(
	"fakturoid_create_generator",
	"Create Generator",
	"Create a new invoice generator (template for recurring invoices)",
	async (client, generatorData) => {
		const generator = await client.createGenerator(generatorData);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	CreateGeneratorSchema.shape,
);

const updateGenerator = createTool(
	"fakturoid_update_generator",
	"Update Generator",
	"Update an existing invoice generator with new data",
	async (client, { id, generatorData }) => {
		const generator = await client.updateGenerator(id, generatorData);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	{
		generatorData: UpdateGeneratorSchema,
		id: z.number(),
	},
);

const deleteGenerator = createTool(
	"fakturoid_delete_generator",
	"Delete Generator",
	"Delete an invoice generator by its ID",
	async (client, { id }) => {
		await client.deleteGenerator(id);

		return {
			content: [{ text: "Generator deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const generator = [
	getGenerators,
	getGenerator,
	createGenerator,
	updateGenerator,
	deleteGenerator,
] as const satisfies ServerToolCreator[];

export { generator };
