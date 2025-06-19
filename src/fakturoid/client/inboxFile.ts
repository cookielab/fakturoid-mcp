import type { CreateInboxFile, InboxFile } from "../model/inboxFile.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, requestAllPages } from "./request.ts";

/**
 * Get all inbox files.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#inbox-files-index
 *
 * @param configuration
 * @param accountSlug
 *
 * @returns List of all inbox files.
 */
const getInboxFiles = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
): Promise<InboxFile[] | Error> => {
	const path = `/accounts/${accountSlug}/inbox_files.json`;

	return await requestAllPages(configuration, path);
};

/**
 * Create a new inbox file.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#create-inbox-file
 *
 * @param configuration
 * @param accountSlug
 * @param inboxFileData
 *
 * @returns Created inbox file or Error.
 */
const createInboxFile = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	inboxFileData: CreateInboxFile,
): ReturnType<typeof request<InboxFile, CreateInboxFile>> => {
	return await request(configuration, `/accounts/${accountSlug}/inbox_files.json`, "POST", inboxFileData);
};

/**
 * Send inbox file to OCR.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#send-inbox-file-to-ocr
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const sendInboxFileToOcr = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(configuration, `/accounts/${accountSlug}/inbox_files/${id}/send_to_ocr.json`, "POST");
};

/**
 * Download an inbox file.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#download-inbox-file
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns File content as ArrayBuffer or Error.
 */
const downloadInboxFile = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): Promise<Blob | Error> => {
	return await request<Blob>(configuration, `/accounts/${accountSlug}/inbox_files/${id}/download`, "GET");
};

/**
 * Delete an inbox file.
 *
 * @see https://www.fakturoid.cz/api/v3/inbox-files#delete-inbox-file
 *
 * @param configuration
 * @param accountSlug
 * @param id
 *
 * @returns Success or Error.
 */
const deleteInboxFile = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	id: number,
): ReturnType<typeof request<undefined>> => {
	return await request(configuration, `/accounts/${accountSlug}/inbox_files/${id}.json`, "DELETE");
};

export { getInboxFiles, createInboxFile, sendInboxFileToOcr, downloadInboxFile, deleteInboxFile };
