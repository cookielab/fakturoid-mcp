import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";
import { z } from "zod";

export function registerFakturoidAccountsTools(server: McpServer, client: FakturoidClient) {
	server.tool("fakturoid_get_account", {}, async () => {
		try {
			const account = await client.getAccount();
			return {
				content: [
					{
						text: JSON.stringify(account, null, 2),
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
	});

	server.tool(
		"fakturoid_update_account",
		{
			accountData: z.object({}).passthrough(),
		},
		async ({ accountData }) => {
			try {
				const account = await client.updateAccount(accountData);
				return {
					content: [
						{
							text: JSON.stringify(account, null, 2),
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
