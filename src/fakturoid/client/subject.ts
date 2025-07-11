import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { GetSubjectsFilters, Subject, SubjectCreate, SubjectUpdate } from "../model/subject.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all subjects.
 *
 * @see https://www.fakturoid.cz/api/v3/subjects#subjects-index
 *
 * @param strategy
 * @param accountSlug
 * @param filters - Optional filters for the subject list
 *
 * @returns List of all subjects.
 */
const getSubjects = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	filters?: GetSubjectsFilters,
): Promise<Subject[] | Error> => {
	const queryParams = Object.fromEntries(
		[
			["since", filters?.since],
			["updated_since", filters?.updated_since],
			["custom_id", filters?.custom_id],
		].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/subjects.json`;

	return await requestAllPages(strategy, path, queryParams);
};

/**
 * Search for subjects with a query.
 *
 * @see https://www.fakturoid.cz/api/v3/subjects#subjects-search
 *
 * @param strategy
 * @param accountSlug
 * @param query - Search query
 *
 * @returns List of matching subjects.
 */
const searchSubjects = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	query?: string,
): Promise<Subject[] | Error> => {
	const queryParams = Object.fromEntries(
		[["query", query]].filter((value): value is [string, string] => value[1] != null),
	);

	const path = `/accounts/${accountSlug}/subjects/search.json`;

	return await requestAllPages(strategy, path, queryParams);
};

/**
 * Get a detail of a subject.
 *
 * @see https://www.fakturoid.cz/api/v3/subjects#subject-detail
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Subject detail.
 */
const getSubjectDetail = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<Subject>> => {
	return await request(strategy, `/accounts/${accountSlug}/subjects/${id}.json`, "GET");
};

/**
 * Create a new subject.
 *
 * @see https://www.fakturoid.cz/api/v3/subjects#create-subject
 *
 * @param strategy
 * @param accountSlug
 * @param subjectData
 *
 * @returns Created subject or Error.
 */
const createSubject = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	subjectData: SubjectCreate,
): ReturnType<typeof request<Subject, SubjectCreate>> => {
	return await request(strategy, `/accounts/${accountSlug}/subjects.json`, "POST", subjectData);
};

/**
 * Update a subject.
 *
 * @see https://www.fakturoid.cz/api/v3/subjects#update-subject
 *
 * @param strategy
 * @param accountSlug
 * @param id
 * @param updateData
 *
 * @returns Updated subject or Error.
 */
const updateSubject = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
	updateData: SubjectUpdate,
): ReturnType<typeof request<Subject, SubjectUpdate>> => {
	return await request(strategy, `/accounts/${accountSlug}/subjects/${id}.json`, "PATCH", updateData);
};

/**
 * Delete a subject.
 *
 * @see https://www.fakturoid.cz/api/v3/subjects#delete-subject
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteSubject = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/subjects/${id}.json`, "DELETE");
};

export { getSubjects, searchSubjects, getSubjectDetail, createSubject, updateSubject, deleteSubject };
