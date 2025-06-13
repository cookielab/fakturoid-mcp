import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { FakturoidClient } from "./fakturoid/client.ts";
import { registerFakturoidPrompts } from "./fakturoid/prompts.ts";
import { registerFakturoidResources } from "./fakturoid/resources.ts";
import { registerFakturoidTools } from "./fakturoid/tools.ts";
import { environment } from "./utils/env.ts";
import { logger } from "./utils/logger.ts";

// Create an MCP server with full capabilities
const server = new McpServer(
	{
		name: "Fakturoid MCP",
		version: "1.0.0",
	},
	{
		capabilities: {
			prompts: {},
			resources: {},
			tools: {},
		},
	},
);

// Initialize Fakturoid client
const fakturoidClient = new FakturoidClient({
	accountSlug: environment.fakturoid.accountSlug,
	appName: environment.fakturoid.appName,
	clientId: environment.fakturoid.clientID,
	clientSecret: environment.fakturoid.clientSecret,
	contactEmail: environment.fakturoid.contactEmail,
});

// Register all MCP features
registerFakturoidTools(server, fakturoidClient);

// Register resources and prompts using the underlying server instance
// Access the underlying Server instance from McpServer to use low-level handlers
const underlyingServer = server.server;
registerFakturoidResources(underlyingServer, fakturoidClient);
registerFakturoidPrompts(underlyingServer);

// For Claude and similar AI tools, always prefer stdio mode
// This ensures better compatibility when run as a child process
const isRunningFromAI = environment.isAIRuntime || process.argv.includes("--ai-runtime");
const isStdioMode =
	environment.forceMode === "stdio" || isRunningFromAI || !process.stdin.isTTY || !process.stdout.isTTY;

if (isStdioMode) {
	// Running in stdio mode
	logger.error("Running in stdio mode. Processing MCP messages from stdin.");

	try {
		const stdioTransport = new StdioServerTransport();
		server.connect(stdioTransport).catch((error) => {
			logger.error("Error connecting stdio transport:", error);
			process.exit(1);
		});
	} catch (error) {
		logger.error("Failed to initialize stdio transport:", error);
		process.exit(1);
	}
} else {
	// Running in interactive terminal mode - use SSE/HTTP
	// Create Express app
	const app = express();

	// Set up SSE transport
	let transport: SSEServerTransport | undefined;

	app.get("/sse", async (req, res) => {
		logger.error("SSE connection established.");
		transport = new SSEServerTransport("/messages", res);
		await server.connect(transport);
		req.on("close", () => {
			logger.error("SSE connection closed.");
		});
	});

	app.post("/messages", async (req, res) => {
		if (!transport) {
			logger.error("SSE transport not ready for POST /messages");
			res.status(400);
			res.json({ error: "No transport" });
			return;
		}
		await transport.handlePostMessage(req, res);
	});

	// Start the Express server
	app.listen(environment.port, () => {
		logger.error(`SSE Server is running on port ${environment.port}`);
		logger.error(`Connect to SSE endpoint at http://localhost:${environment.port}/sse`);
		logger.error(`Send messages to http://localhost:${environment.port}/messages`);
	});
}
