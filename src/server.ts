import type { OAuthConfig } from "./fakturoid/client/auth.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJSON from "../package.json" with { type: "json" };
import { FakturoidClient } from "./fakturoid/client.ts";
import { registerFakturoidPrompts } from "./fakturoid/prompts.ts";
import { registerFakturoidResources } from "./fakturoid/resources.ts";
import { registerFakturoidTools } from "./fakturoid/tools.ts";
import { environment } from "./utils/env.ts";

const createServer = async (
	config: OAuthConfig = {
		appName: environment.fakturoid.appName,
		clientId: environment.fakturoid.clientID,
		clientSecret: environment.fakturoid.clientSecret,
		contactEmail: environment.fakturoid.contactEmail,
		grant: { grant_type: "client_credentials" },
	},
	accountSlug: string = environment.fakturoid.accountSlug,
): Promise<McpServer> => {
	const fakturoidClient = await FakturoidClient.create(config, "https://app.fakturoid.cz/api/v3", accountSlug);

	const server = new McpServer(
		{
			name: "Fakturoid MCP",
			version: packageJSON.version,
		},
		{
			capabilities: {
				prompts: {},
				resources: {},
				tools: {},
			},
		},
	);

	registerFakturoidTools(server, fakturoidClient);
	registerFakturoidResources(server.server, fakturoidClient);
	registerFakturoidPrompts(server.server);

	return server;
};

export { createServer };
