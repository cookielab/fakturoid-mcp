import type { InboxFile, InboxFileParams, Pagination } from '../models.js';
import { withRetry, request, accountEndpoint } from './_shared.js';
import type { FakturoidClientConfig } from './_shared.js';

export async function getInboxFiles(
  config: FakturoidClientConfig,
  params?: Pagination & {
    since?: string;
    updated_since?: string;
    until?: string;
    updated_until?: string;
  }
): Promise<InboxFile[]> {
  const queryParams: Record<string, string> = {};
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams[key] = String(value);
      }
    });
  }
  return withRetry(() =>
    request<InboxFile[]>(
      config,
      accountEndpoint(config, '/inbox/files.json'),
      'GET',
      undefined,
      queryParams
    )
  );
}

export async function getInboxFile(config: FakturoidClientConfig, id: number): Promise<InboxFile> {
  return withRetry(() =>
    request<InboxFile>(config, accountEndpoint(config, `/inbox/files/${id}.json`))
  );
}

export async function createInboxFile(config: FakturoidClientConfig, file: InboxFileParams): Promise<InboxFile> {
  return withRetry(() =>
    request<InboxFile>(config, accountEndpoint(config, '/inbox/files.json'), 'POST', file)
  );
}

export async function updateInboxFile(
  config: FakturoidClientConfig,
  id: number,
  fileData: { name: string }
): Promise<InboxFile> {
  return withRetry(() =>
    request<InboxFile>(config, accountEndpoint(config, `/inbox/files/${id}.json`), 'PATCH', fileData)
  );
}

export async function deleteInboxFile(config: FakturoidClientConfig, id: number): Promise<void> {
  return withRetry(() =>
    request<void>(config, accountEndpoint(config, `/inbox/files/${id}.json`), 'DELETE')
  );
} 