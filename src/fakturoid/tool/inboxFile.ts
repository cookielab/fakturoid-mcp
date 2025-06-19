import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getInboxFiles = createTool(
	"fakturoid_get_inbox_files",
	async (client, { accountSlug }) => {
		const inboxFiles = await client.getInboxFiles(accountSlug);

		return {
			content: [{ text: JSON.stringify(inboxFiles, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const createInboxFile = createTool(
	"fakturoid_create_inbox_file",
	async (client, { accountSlug, inboxFileData }) => {
		const inboxFile = await client.createInboxFile(accountSlug, inboxFileData);

		return {
			content: [{ text: JSON.stringify(inboxFile, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		inboxFileData: z.any(), // Using z.any() since CreateInboxFile type is not available here
	}),
);

const sendInboxFileToOcr = createTool(
	"fakturoid_send_inbox_file_to_ocr",
	async (client, { accountSlug, id }) => {
		const result = await client.sendInboxFileToOcr(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const downloadInboxFile = createTool(
	"fakturoid_download_inbox_file",
	async (client, { accountSlug, id }) => {
		const file = await client.downloadInboxFile(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(file, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const deleteInboxFile = createTool(
	"fakturoid_delete_inbox_file",
	async (client, { accountSlug, id }) => {
		await client.deleteInboxFile(accountSlug, id);

		return {
			content: [{ text: "Inbox file deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
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
