import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { CreateInboxFile, InboxFile } from "../model/inboxFile.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all inbox files.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#inbox-files-index
 *
 * @param strategy
 * @param accountSlug
 *
 * @returns List of all inbox files.
 */
const getInboxFiles = async (strategy: AuthenticationStrategy, accountSlug: string): Promise<InboxFile[] | Error> => {
	const path = `/accounts/${accountSlug}/inbox_files.json`;

	return await requestAllPages(strategy, path);
};

/**
 * Create a new inbox file.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#create-inbox-file
 *
 * @param strategy
 * @param accountSlug
 * @param inboxFileData
 *
 * @returns Created inbox file or Error.
 */
const createInboxFile = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	inboxFileData: CreateInboxFile,
): ReturnType<typeof request<InboxFile, CreateInboxFile>> => {
	return await request(strategy, `/accounts/${accountSlug}/inbox_files.json`, "POST", inboxFileData);
};

/**
 * Send inbox file to OCR.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#send-inbox-file-to-ocr
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const sendInboxFileToOcr = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/inbox_files/${id}/send_to_ocr.json`, "POST");
};

/**
 * Download an inbox file.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#download-inbox-file
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns File content as ArrayBuffer or Error.
 */
const downloadInboxFile = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): Promise<Blob | Error> => {
	return await request<Blob>(strategy, `/accounts/${accountSlug}/inbox_files/${id}/download`, "GET");
};

/**
 * Delete an inbox file.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#delete-inbox-file
 *
 * @param strategy
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteInboxFile = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(strategy, `/accounts/${accountSlug}/inbox_files/${id}.json`, "DELETE");
};

export { getInboxFiles, createInboxFile, sendInboxFileToOcr, downloadInboxFile, deleteInboxFile };
