import { z } from "zod/v3";
import { CreateInboxFileSchema } from "../model/inboxFile.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getInboxFiles = createTool(
	"fakturoid_get_inbox_files",
	"Get Inbox Files",
	"Retrieve a list of files uploaded to the inbox for processing",
	async (client) => {
		const inboxFiles = await client.getInboxFiles();

		return {
			content: [{ text: JSON.stringify(inboxFiles, null, 2), type: "text" }],
		};
	},
);

const createInboxFile = createTool(
	"fakturoid_create_inbox_file",
	"Create Inbox File",
	"Upload a new file to the inbox for processing",
	async (client, inboxFileData) => {
		const inboxFile = await client.createInboxFile(inboxFileData);

		return {
			content: [{ text: JSON.stringify(inboxFile, null, 2), type: "text" }],
		};
	},
	CreateInboxFileSchema.shape,
);

const sendInboxFileToOcr = createTool(
	"fakturoid_send_inbox_file_to_ocr",
	"Send Inbox File to OCR",
	"Send an inbox file to OCR processing to extract text and data",
	async (client, { id }) => {
		const result = await client.sendInboxFileToOcr(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const downloadInboxFile = createTool(
	"fakturoid_download_inbox_file",
	"Download Inbox File",
	"Download a file from the inbox by its ID",
	async (client, { id }) => {
		const file = await client.downloadInboxFile(id);

		return {
			content: [{ text: JSON.stringify(file, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const deleteInboxFile = createTool(
	"fakturoid_delete_inbox_file",
	"Delete Inbox File",
	"Delete a file from the inbox by its ID",
	async (client, { id }) => {
		await client.deleteInboxFile(id);

		return {
			content: [{ text: "Inbox file deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const inboxFile = [
	getInboxFiles,
	createInboxFile,
	sendInboxFileToOcr,
	downloadInboxFile,
	deleteInboxFile,
] as const satisfies ServerToolCreator[];

export { inboxFile };
