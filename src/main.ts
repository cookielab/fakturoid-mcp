import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import process from "node:process";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { createServer } from "./server.ts";
import { environment } from "./utils/env.ts";
import { logger } from "./utils/logger.ts";

const startStdio = async (server: McpServer): Promise<void> => {
	logger.info("Running in stdio mode. Processing MCP messages from stdin.");

	try {
		const stdioTransport = new StdioServerTransport();

		await server.connect(stdioTransport);
	} catch (error: unknown) {
		logger.error("Failed to initialize stdio transport.");
		logger.error(error);

		process.exit(1);
	}
};

const startSSEMode = (server: McpServer): void => {
	const app = express();
	app.disable("x-powered-by");

	let transport: SSEServerTransport | undefined;

	app.get("/sse", async (request: express.Request, response: express.Response): Promise<void> => {
		logger.info("SSE connection established.");

		transport = new SSEServerTransport("/message", response);

		await server.connect(transport);

		request.on("close", () => {
			logger.info("SSE connection closed.");
		});
	});

	app.post("/message", async (request: express.Request, response: express.Response): Promise<void> => {
		if (transport == null) {
			logger.error("SSE transport is not ready for POST /messages");
			response.status(400);
			response.json({ error: "No transport" });

			return;
		}

		await transport.handlePostMessage(request, response);
	});

	app.listen(environment.port, () => {
		logger.info(`SSE server is running on port ${environment.port}`);
		logger.info(`Connect to the SSE endpoint at http://localhost:${environment.port}/sse`);
		logger.info(`Send messages to http://localhost:${environment.port}/messages`);
	});
};

const startServer = async (): Promise<void> => {
	const server = createServer();

	const isAIRuntime = environment.isAIRuntime || process.argv.includes("--ai-runtime");
	const isStdioMode = environment.forceMode === "stdio" || isAIRuntime || !process.stdin.isTTY || !process.stdout.isTTY;

	if (isStdioMode) {
		await startStdio(server);
	} else {
		startSSEMode(server);
	}
};

await startServer();
