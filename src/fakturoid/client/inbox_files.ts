import type { InboxFileParams } from "../models/inboxFileParams.ts";
import type { InboxFile } from "../models/inboxFiles.ts";
import type { Pagination } from "../models/pagination.ts";
import type { FakturoidClientConfig } from "./_shared.js";
import { accountEndpoint, request, withRetry } from "./_shared.js";

export interface GetInboxFilesParameters extends Pagination {
	since?: string;
	updated_since?: string;
	until?: string;
	updated_until?: string;
}

export function getInboxFiles(config: FakturoidClientConfig, params?: GetInboxFilesParameters): Promise<InboxFile[]> {
	const queryParams: Record<string, string> = {};
	if (params) {
		for (const [key, value] of Object.entries(params)) {
			if (value !== undefined) {
				queryParams[key] = String(value);
			}
		}
	}

	return withRetry(() =>
		request<InboxFile[]>(config, accountEndpoint(config, "/inbox/files.json"), "GET", undefined, queryParams),
	);
}

export function getInboxFile(config: FakturoidClientConfig, id: number): Promise<InboxFile> {
	return withRetry(() => request<InboxFile>(config, accountEndpoint(config, `/inbox/files/${id}.json`)));
}

export function createInboxFile(config: FakturoidClientConfig, file: InboxFileParams): Promise<InboxFile> {
	return withRetry(() => request<InboxFile>(config, accountEndpoint(config, "/inbox/files.json"), "POST", file));
}

export function updateInboxFile(
	config: FakturoidClientConfig,
	id: number,
	fileData: { name: string },
): Promise<InboxFile> {
	return withRetry(() =>
		request<InboxFile>(config, accountEndpoint(config, `/inbox/files/${id}.json`), "PATCH", fileData),
	);
}

export function deleteInboxFile(config: FakturoidClientConfig, id: number): Promise<void> {
	return withRetry(() => request<void>(config, accountEndpoint(config, `/inbox/files/${id}.json`), "DELETE"));
}
