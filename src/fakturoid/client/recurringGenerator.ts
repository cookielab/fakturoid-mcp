import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type {
	CreateRecurringGenerator,
	RecurringGenerator,
	UpdateRecurringGenerator,
} from "../model/recurringGenerator.js";
import { request, requestAllPages } from "./request.js";

/**
 * Get all recurring generators.
 *
 * @see https://www.fakturoid.cz/api/v3/recurring-generators#recurring-generators-index
 *
 * @param strategy
 * @param accountSlug
 *
 * @returns List of all recurring generators.
 */
const getRecurringGenerators = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): Promise<RecurringGenerator[] | Error> => {
	const path = `/accounts/${accountSlug}/recurring_generators.json`;

	return await requestAllPages(strategy, path);
};

/**
 * Get a single recurring generator.
 *
 * @see https://www.fakturoid.cz/api/v3/recurring-generators#recurring-generator-detail
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Recurring generator or Error.
 */
const getRecurringGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<RecurringGenerator>> => {
	return await request(strategy, `/accounts/${accountSlug}/recurring_generators/${id}.json`, "GET");
};

/**
 * Create a new recurring generator.
 *
 * @see https://www.fakturoid.cz/api/v3/recurring-generators#create-recurring-generator
 *
 * @param strategy
 * @param accountSlug
 * @param recurringGeneratorData
 *
 * @returns Created recurring generator or Error.
 */
const createRecurringGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	recurringGeneratorData: CreateRecurringGenerator,
): ReturnType<typeof request<RecurringGenerator, CreateRecurringGenerator>> => {
	return await request(strategy, `/accounts/${accountSlug}/recurring_generators.json`, "POST", recurringGeneratorData);
};

/**
 * Update a recurring generator.
 *
 * @see https://www.fakturoid.cz/api/v3/recurring-generators#update-recurring-generator
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param recurringGeneratorData
 *
 * @returns Updated recurring generator or Error.
 */
const updateRecurringGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	recurringGeneratorData: UpdateRecurringGenerator,
): ReturnType<typeof request<RecurringGenerator, UpdateRecurringGenerator>> => {
	return await request(
		strategy,
		`/accounts/${accountSlug}/recurring_generators/${id}.json`,
		"PATCH",
		recurringGeneratorData,
	);
};

/**
 * Delete a recurring generator.
 *
 * @see https://www.fakturoid.cz/api/v3/recurring-generators#delete-recurring-generator
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteRecurringGenerator = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/recurring_generators/${id}.json`, "DELETE");
};

export {
	getRecurringGenerators,
	getRecurringGenerator,
	createRecurringGenerator,
	updateRecurringGenerator,
	deleteRecurringGenerator,
};
