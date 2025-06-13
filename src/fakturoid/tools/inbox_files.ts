import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";
import type { InboxFileParams } from "../models/inboxFileParams.ts";
import { z } from "zod/v4";

export function registerFakturoidInboxFilesTools(server: McpServer, client: FakturoidClient) {
	server.tool(
		"fakturoid_get_inbox_files",
		{
			page: z.number(),
			since: z.string(),
			until: z.string(),
			updated_since: z.string(),
			updated_until: z.string(),
		},
		async (params) => {
			try {
				const files = await client.getInboxFiles(params);
				return {
					content: [
						{
							text: JSON.stringify(files, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_get_inbox_file",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				const file = await client.getInboxFile(id);
				return {
					content: [
						{
							text: JSON.stringify(file, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_create_inbox_file",
		{
			fileData: z.object({
				content: z.string(),
				file_name: z.string(), // Base64 encoded content
				name: z.string().optional(),
			}),
		},
		async ({ fileData }) => {
			try {
				const file = await client.createInboxFile(fileData as InboxFileParams);
				return {
					content: [
						{
							text: JSON.stringify(file, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_update_inbox_file",
		{
			id: z.number(),
			name: z.string(),
		},
		async ({ id, name }) => {
			try {
				const file = await client.updateInboxFile(id, { name: name });
				return {
					content: [
						{
							text: JSON.stringify(file, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_delete_inbox_file",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				await client.deleteInboxFile(id);
				return {
					content: [
						{
							text: "Inbox file deleted successfully",
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);
}
