import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getGenerators = createTool("fakturoid_get_generators", async (client) => {
	const generators = await client.getGenerators();

	return {
		content: [{ text: JSON.stringify(generators, null, 2), type: "text" }],
	};
});

const getGenerator = createTool(
	"fakturoid_get_generator",
	async (client, { id }) => {
		const generator = await client.getGenerator(id);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const createGenerator = createTool(
	"fakturoid_create_generator",
	async (client, { generatorData }) => {
		const generator = await client.createGenerator(generatorData);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	z.object({
		generatorData: z.any(), // Using z.any() since CreateGenerator type is not available here
	}),
);

const updateGenerator = createTool(
	"fakturoid_update_generator",
	async (client, { id, generatorData }) => {
		const generator = await client.updateGenerator(id, generatorData);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	z.object({
		generatorData: z.any(),
		id: z.number(), // Using z.any() since UpdateGenerator type is not available here
	}),
);

const deleteGenerator = createTool(
	"fakturoid_delete_generator",
	async (client, { id }) => {
		await client.deleteGenerator(id);

		return {
			content: [{ text: "Generator deleted successfully", type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const generator = [
	getGenerators,
	getGenerator,
	createGenerator,
	updateGenerator,
	deleteGenerator,
] as const satisfies ServerToolCreator[];

export { generator };
