import type { Pagination } from "../models/pagination.ts";
import type { Subject } from "../models/subject.ts";
import type { SubjectParams } from "../models/subjectParams.ts";
import type { FakturoidClientConfig } from "./_shared.ts";
import { accountEndpoint, request, withRetry } from "./_shared.ts";

export interface GetSubjectParameters extends Pagination {
	since?: string;
	updated_since?: string;
	until?: string;
	updated_until?: string;
	custom_id?: string;
	full_text?: string;
}

export function getSubjects(config: FakturoidClientConfig, params?: GetSubjectParameters): Promise<Subject[]> {
	const queryParams: Record<string, string> = {};
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				queryParams[key] = String(value);
			}
		}
	}
	return withRetry(() =>
		request<Subject[]>(config, accountEndpoint(config, "/subjects.json"), "GET", undefined, queryParams),
	);
}

export function getSubject(config: FakturoidClientConfig, id: number): Promise<Subject> {
	return withRetry(() => request<Subject>(config, accountEndpoint(config, `/subjects/${id}.json`)));
}

export function createSubject(config: FakturoidClientConfig, subject: SubjectParams): Promise<Subject> {
	return withRetry(() => request<Subject>(config, accountEndpoint(config, "/subjects.json"), "POST", subject));
}

export function updateSubject(
	config: FakturoidClientConfig,
	id: number,
	subject: Partial<SubjectParams>,
): Promise<Subject> {
	return withRetry(() => request<Subject>(config, accountEndpoint(config, `/subjects/${id}.json`), "PATCH", subject));
}

export function deleteSubject(config: FakturoidClientConfig, id: number): Promise<void> {
	return withRetry(() => request<void>(config, accountEndpoint(config, `/subjects/${id}.json`), "DELETE"));
}
