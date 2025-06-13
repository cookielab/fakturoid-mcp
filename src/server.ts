import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import packageJSON from "../package.json" with { type: "json" };
import { FakturoidClient } from "./fakturoid/client.ts";
import { registerFakturoidPrompts } from "./fakturoid/prompts.ts";
import { registerFakturoidResources } from "./fakturoid/resources.ts";
import { registerFakturoidTools } from "./fakturoid/tools.ts";
import { environment } from "./utils/env.ts";

const createServer = (): McpServer => {
	const fakturoidClient = new FakturoidClient({
		accountSlug: environment.fakturoid.accountSlug,
		appName: environment.fakturoid.appName,
		clientId: environment.fakturoid.clientID,
		clientSecret: environment.fakturoid.clientSecret,
		contactEmail: environment.fakturoid.contactEmail,
	});

	const server = new McpServer({
		name: "Fakturoid MCP",
		version: packageJSON.version,
	});

	registerFakturoidTools(server, fakturoidClient);
	registerFakturoidResources(server.server, fakturoidClient);
	registerFakturoidPrompts(server.server);

	return server;
};

export { createServer };
