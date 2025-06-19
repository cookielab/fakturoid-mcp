import type { CreateGenerator, Generator, UpdateGenerator } from "../model/generator.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all generators.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#generators-index
 *
 * @param configuration
 * @param accountSlug
 *
 * @returns List of all generators.
 */
const getGenerators = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
): Promise<Generator[] | Error> => {
	const path = `/accounts/${accountSlug}/generators.json`;

	return await requestAllPages(configuration, path);
};

/**
 * Get a single generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#generator-detail
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Generator or Error.
 */
const getGenerator = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Generator>> => {
	return await request(configuration, `/accounts/${accountSlug}/generators/${id}.json`, "GET");
};

/**
 * Create a new generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#create-generator
 *
 * @param configuration
 * @param accountSlug
 * @param generatorData
 *
 * @returns Created generator or Error.
 */
const createGenerator = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	generatorData: CreateGenerator,
): ReturnType<typeof request<Generator, CreateGenerator>> => {
	return await request(configuration, `/accounts/${accountSlug}/generators.json`, "POST", generatorData);
};

/**
 * Update a generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#update-generator
 *
 * @param configuration
 * @param accountSlug
 * @param id
 * @param generatorData
 *
 * @returns Updated generator or Error.
 */
const updateGenerator = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
	generatorData: UpdateGenerator,
): ReturnType<typeof request<Generator, UpdateGenerator>> => {
	return await request(configuration, `/accounts/${accountSlug}/generators/${id}.json`, "PATCH", generatorData);
};

/**
 * Delete a generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#delete-generator
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteGenerator = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(configuration, `/accounts/${accountSlug}/generators/${id}.json`, "DELETE");
};

export { getGenerators, getGenerator, createGenerator, updateGenerator, deleteGenerator };
