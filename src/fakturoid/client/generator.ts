import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { CreateGenerator, Generator, UpdateGenerator } from "../model/generator.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all generators.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#generators-index
 *
 * @param strategy
 * @param accountSlug
 *
 * @returns List of all generators.
 */
const getGenerators = async (strategy: AuthenticationStrategy, accountSlug: string): Promise<Generator[] | Error> => {
	const path = `/accounts/${accountSlug}/generators.json`;

	return await requestAllPages(strategy, path);
};

/**
 * Get a single generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#generator-detail
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Generator or Error.
 */
const getGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Generator>> => {
	return await request(strategy, `/accounts/${accountSlug}/generators/${id}.json`, "GET");
};

/**
 * Create a new generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#create-generator
 *
 * @param strategy
 * @param accountSlug
 * @param generatorData
 *
 * @returns Created generator or Error.
 */
const createGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	generatorData: CreateGenerator,
): ReturnType<typeof request<Generator, CreateGenerator>> => {
	return await request(strategy, `/accounts/${accountSlug}/generators.json`, "POST", generatorData);
};

/**
 * Update a generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#update-generator
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param generatorData
 *
 * @returns Updated generator or Error.
 */
const updateGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	generatorData: UpdateGenerator,
): ReturnType<typeof request<Generator, UpdateGenerator>> => {
	return await request(strategy, `/accounts/${accountSlug}/generators/${id}.json`, "PATCH", generatorData);
};

/**
 * Delete a generator.
 *
 * @see https://www.fakturoid.cz/api/v3/generators#delete-generator
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined, UpdateGenerator>> => {
	return await request(strategy, `/accounts/${accountSlug}/generators/${id}.json`, "DELETE");
};

export { getGenerators, getGenerator, createGenerator, updateGenerator, deleteGenerator };
