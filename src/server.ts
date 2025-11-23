import type { AuthenticationStrategy } from "./auth/strategy.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJSON from "../package.json" with { type: "json" };
import { FakturoidClient } from "./fakturoid/client.js";
import { registerFakturoidPrompts } from "./fakturoid/prompts.js";
import { registerFakturoidResources } from "./fakturoid/resources.js";
import { registerFakturoidTools } from "./fakturoid/tools.js";

type ServerContext = {
	transport: "stdio" | "sse" | "http" | "cloudflare";
	capabilities: {
		fileSystemAccess: boolean;
	};
	uploadConfig: {
		allowUrlDownloads: boolean;
		maxDownloadSizeMB: number;
		downloadTimeoutMs: number;
	};
};

const createServer = async <Configuration extends object, Strategy extends AuthenticationStrategy<Configuration>>(
	strategy: Strategy,
	context: ServerContext,
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

	registerFakturoidTools(server, fakturoidClient, context);
	registerFakturoidResources(server.server, fakturoidClient);
	registerFakturoidPrompts(server.server);

	return server;
};

export { createServer };
