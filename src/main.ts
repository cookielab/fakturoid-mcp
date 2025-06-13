import process from "node:process";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { FakturoidClient } from "./fakturoid/client.ts";
import { registerFakturoidPrompts } from "./fakturoid/prompts.ts";
import { registerFakturoidResources } from "./fakturoid/resources.ts";
import { registerFakturoidTools } from "./fakturoid/tools.ts";
import { env } from "./utils/env.ts";

// TODO: Get rid off the error
// biome-ignore-start lint/suspicious/noConsole: Skipping noConsole
// biome-ignore-start lint/complexity/useLiteralKeys: Skipping useLiteralKeys

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

// Log environment variables in development mode (without sensitive values)
if (process.env["NODE_ENV"] === "development") {
	console.error("Environment variables detected:");
	console.error(`- FAKTUROID_ACCOUNT_SLUG: ${process.env["FAKTUROID_ACCOUNT_SLUG"] ? "[set]" : "[not set]"}`);
	console.error(`- FAKTUROID_CLIENT_ID: ${process.env["FAKTUROID_CLIENT_ID"] ? "[set]" : "[not set]"}`);
	console.error(`- FAKTUROID_CLIENT_SECRET: ${process.env["FAKTUROID_CLIENT_SECRET"] ? "[set]" : "[not set]"}`);
	console.error(`- FAKTUROID_APP_NAME: ${process.env["FAKTUROID_APP_NAME"] ? "[set]" : "[not set]"}`);
	console.error(`- FAKTUROID_CONTACT_EMAIL: ${process.env["FAKTUROID_CONTACT_EMAIL"] ? "[set]" : "[not set]"}`);
}

// Initialize Fakturoid client
const fakturoidClient = new FakturoidClient({
	accountSlug: env.FAKTUROID_ACCOUNT_SLUG,
	appName: env.FAKTUROID_APP_NAME,
	clientId: env.FAKTUROID_CLIENT_ID,
	clientSecret: env.FAKTUROID_CLIENT_SECRET,
	contactEmail: env.FAKTUROID_CONTACT_EMAIL,
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
const forcedMode = process.env["MCP_FORCE_MODE"];
const isRunningFromAI = process.env["AI_RUNTIME"] === "true" || process.argv.includes("--ai-runtime");
const isStdioMode = forcedMode === "stdio" || isRunningFromAI || !process.stdin.isTTY || !process.stdout.isTTY;

if (isStdioMode) {
	// Running in stdio mode
	console.error("Running in stdio mode. Processing MCP messages from stdin.");
	try {
		const stdioTransport = new StdioServerTransport();
		server.connect(stdioTransport).catch((error) => {
			console.error("Error connecting stdio transport:", error);
			process.exit(1);
		});
	} catch (error) {
		console.error("Failed to initialize stdio transport:", error);
		process.exit(1);
	}
} else {
	// Running in interactive terminal mode - use SSE/HTTP
	// Create Express app
	const app = express();
	const PORT = env.PORT;

	// Set up SSE transport
	let transport: SSEServerTransport | undefined;

	app.get("/sse", async (req, res) => {
		console.error("SSE connection established.");
		transport = new SSEServerTransport("/messages", res);
		await server.connect(transport);
		req.on("close", () => {
			console.error("SSE connection closed.");
		});
	});

	app.post("/messages", async (req, res) => {
		if (!transport) {
			console.error("SSE transport not ready for POST /messages");
			res.status(400);
			res.json({ error: "No transport" });
			return;
		}
		await transport.handlePostMessage(req, res);
	});

	// Start the Express server
	app.listen(PORT, () => {
		console.error(`SSE Server is running on port ${PORT}`);
		console.error(`Connect to SSE endpoint at http://localhost:${PORT}/sse`);
		console.error(`Send messages to http://localhost:${PORT}/messages`);
	});
}

// biome-ignore-end lint/suspicious/noConsole: Skipping noConsole
// biome-ignore-end lint/complexity/useLiteralKeys: Skipping useLiteralKeys
