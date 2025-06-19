import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getGenerators = createTool(
	"fakturoid_get_generators",
	async (client, { accountSlug }) => {
		const generators = await client.getGenerators(accountSlug);

		return {
			content: [{ text: JSON.stringify(generators, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const getGenerator = createTool(
	"fakturoid_get_generator",
	async (client, { accountSlug, id }) => {
		const generator = await client.getGenerator(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const createGenerator = createTool(
	"fakturoid_create_generator",
	async (client, { accountSlug, generatorData }) => {
		const generator = await client.createGenerator(accountSlug, generatorData);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		generatorData: z.any(), // Using z.any() since CreateGenerator type is not available here
	}),
);

const updateGenerator = createTool(
	"fakturoid_update_generator",
	async (client, { accountSlug, id, generatorData }) => {
		const generator = await client.updateGenerator(accountSlug, id, generatorData);

		return {
			content: [{ text: JSON.stringify(generator, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		generatorData: z.any(),
		id: z.number(), // Using z.any() since UpdateGenerator type is not available here
	}),
);

const deleteGenerator = createTool(
	"fakturoid_delete_generator",
	async (client, { accountSlug, id }) => {
		await client.deleteGenerator(accountSlug, id);

		return {
			content: [{ text: "Generator deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
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
