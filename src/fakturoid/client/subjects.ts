import type { Subject, SubjectParams, Pagination } from '../models.js';
import { withRetry, request, accountEndpoint } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getSubjects(
  config: FakturoidClientConfig,
  params?: Pagination & {
    since?: string;
    updated_since?: string;
    until?: string;
    updated_until?: string;
    custom_id?: string;
    full_text?: string;
  }
): Promise<Subject[]> {
  const queryParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });
  }
  return withRetry(() =>
    request<Subject[]>(
      config,
      accountEndpoint(config, '/subjects.json'),
      'GET',
      undefined,
      queryParams
    )
  );
}

export async function getSubject(config: FakturoidClientConfig, id: number): Promise<Subject> {
  return withRetry(() =>
    request<Subject>(config, accountEndpoint(config, `/subjects/${id}.json`))
  );
}

export async function createSubject(config: FakturoidClientConfig, subject: SubjectParams): Promise<Subject> {
  return withRetry(() =>
    request<Subject>(config, accountEndpoint(config, '/subjects.json'), 'POST', subject)
  );
}

export async function updateSubject(
  config: FakturoidClientConfig,
  id: number,
  subject: Partial<SubjectParams>
): Promise<Subject> {
  return withRetry(() =>
    request<Subject>(config, accountEndpoint(config, `/subjects/${id}.json`), 'PATCH', subject)
  );
}

export async function deleteSubject(config: FakturoidClientConfig, id: number): Promise<void> {
  return withRetry(() =>
    request<void>(config, accountEndpoint(config, `/subjects/${id}.json`), 'DELETE')
  );
} 