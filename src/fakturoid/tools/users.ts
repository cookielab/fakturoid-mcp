import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";

export function registerFakturoidUsersTools(server: McpServer, client: FakturoidClient) {
	server.tool("fakturoid_get_current_user", {}, async () => {
		try {
			const user = await client.getCurrentUser();
			return {
				content: [
					{
						text: JSON.stringify(user, null, 2),
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
}
