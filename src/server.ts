import type { AuthenticationStrategy } from "./auth/strategy.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJSON from "../package.json" with { type: "json" };
import { FakturoidClient } from "./fakturoid/client.js";
import { registerFakturoidPrompts } from "./fakturoid/prompts.js";
import { registerFakturoidResources } from "./fakturoid/resources.js";
import { registerFakturoidTools } from "./fakturoid/tools.js";

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
