import { z } from "zod/v3";
import { CreateInboxFileToolSchema } from "../model/inboxFile.js";
import { resolveFileSource, bufferToBase64 } from "../../staging/resolver.js";
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
	"Upload a new file to the inbox for processing. Provide exactly one file source: file_ref (from /upload page - preferred), source_url, file_path (local server only), or attachment (base64 - avoid, exhausts context).",
	async (client, input, staging) => {
		const resolved = await resolveFileSource(
			{
				...(input.file_ref != null && { file_ref: input.file_ref }),
				...(input.source_url != null && { source_url: input.source_url }),
				...(input.file_path != null && { file_path: input.file_path }),
				...(input.attachment != null && { data: input.attachment }),
				...(input.filename != null && { filename: input.filename }),
			},
			staging,
		);

		const inboxFile = await client.createInboxFile({
			attachment: bufferToBase64(resolved.content),
			filename: input.filename ?? resolved.filename,
			send_to_ocr: input.send_to_ocr,
		});

		return {
			content: [{ text: JSON.stringify(inboxFile, null, 2), type: "text" }],
		};
	},
	CreateInboxFileToolSchema.shape,
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
	"Download a file from the inbox by its ID. Returns a file reference that can be opened via /download/:ref",
	async (client, { id }, staging) => {
		const file = await client.downloadInboxFile(id);

		if (file instanceof Blob) {
			const buffer = await file.arrayBuffer();
			const ref = await staging.store({
				content: buffer,
				filename: `inbox-file-${id}`,
				mimeType: file.type || "application/octet-stream",
			});
			const sizeKB = (buffer.byteLength / 1024).toFixed(1);

			return {
				content: [
					{
						text: `File downloaded successfully. File ref: ${ref} (expires in 5 minutes). Size: ${sizeKB} KB. Open in browser: /download/${ref}`,
						type: "text" as const,
					},
				],
			};
		}

		return {
			content: [{ text: `Error downloading file: ${String(file)}`, type: "text" as const }],
			isError: true,
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
