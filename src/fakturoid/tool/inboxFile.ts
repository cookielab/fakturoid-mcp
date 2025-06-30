import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInboxFiles = createTool("fakturoid_get_inbox_files", async (client) => {
	const inboxFiles = await client.getInboxFiles();

	return {
		content: [{ text: JSON.stringify(inboxFiles, null, 2), type: "text" }],
	};
});

const createInboxFile = createTool(
	"fakturoid_create_inbox_file",
	async (client, { inboxFileData }) => {
		const inboxFile = await client.createInboxFile(inboxFileData);

		return {
			content: [{ text: JSON.stringify(inboxFile, null, 2), type: "text" }],
		};
	},
	z.object({
		inboxFileData: z.any(), // Using z.any() since CreateInboxFile type is not available here
	}),
);

const sendInboxFileToOcr = createTool(
	"fakturoid_send_inbox_file_to_ocr",
	async (client, { id }) => {
		const result = await client.sendInboxFileToOcr(id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const downloadInboxFile = createTool(
	"fakturoid_download_inbox_file",
	async (client, { id }) => {
		const file = await client.downloadInboxFile(id);

		return {
			content: [{ text: JSON.stringify(file, null, 2), type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const deleteInboxFile = createTool(
	"fakturoid_delete_inbox_file",
	async (client, { id }) => {
		await client.deleteInboxFile(id);

		return {
			content: [{ text: "Inbox file deleted successfully", type: "text" }],
		};
	},
	z.object({
		id: z.number(),
	}),
);

const inboxFile = [
	getInboxFiles,
	createInboxFile,
	sendInboxFileToOcr,
	downloadInboxFile,
	deleteInboxFile,
] as const satisfies ServerToolCreator[];

export { inboxFile };
