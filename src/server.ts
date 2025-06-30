import type { AuthenticationStrategy } from "./auth/strategy.ts";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJSON from "../package.json" with { type: "json" };
import { FakturoidClient } from "./fakturoid/client.ts";
import { registerFakturoidPrompts } from "./fakturoid/prompts.ts";
import { registerFakturoidResources } from "./fakturoid/resources.ts";
import { registerFakturoidTools } from "./fakturoid/tools.ts";

const createServer = async <Configuration extends object, Strategy extends AuthenticationStrategy<Configuration>>(
	strategy: Strategy,
): Promise<McpServer> => {
	const fakturoidClient = await FakturoidClient.create(strategy);

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
