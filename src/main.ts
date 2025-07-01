import type { AuthenticationStrategy } from "./auth/strategy.ts";
import { randomUUID } from "node:crypto";
import process from "node:process";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import dotenv from "dotenv";
import express, { type Request, type Response } from "express";
import { z } from "zod/v4";
import { LocalStrategy } from "./auth/localStrategy.ts";
import { createServer } from "./server.ts";
import { logger } from "./utils/logger.ts";

const EnvironmentSchema = z.object({
	MCP_TRANSPORT: z.preprocess(
		(value) => (typeof value === "string" ? value.toLocaleLowerCase() : value),
		z.union([z.literal("stdio"), z.literal("sse"), z.literal("http")]).default("stdio"),
	),
	PORT: z.preprocess((value) => (value != null ? Number(value) : undefined), z.int().positive().default(5173)),
});

const loadEnvironment = (): z.infer<typeof EnvironmentSchema> => {
	dotenv.config();

	try {
		return EnvironmentSchema.parse(process.env);
	} catch (error: unknown) {
		logger.error("Unexpected error when trying to read the environment");
		logger.error(error);

		// Fatal error - should be ok to end the process
		process.exit(1);
	}
};

const startSTDIO = async (strategy: AuthenticationStrategy): Promise<void> => {
	logger.info("Starting the server in STDIO transport mode.");

	const transport = new StdioServerTransport();
	const server = await createServer(strategy);

	await server.connect(transport);
};

const startSSE = async (strategy: AuthenticationStrategy, port: number): Promise<void> => {
	logger.info("Starting the server in SSE transport mode.");

	logger.warn("Please note that SSE transport mode is DEPRECATED.");
	logger.warn('Streamable HTTP transport mode ("http") is the recommended replacement.');
	logger.warn(
		"See the documentation for more information https://modelcontextprotocol.io/docs/concepts/transports#server-sent-events-sse-deprecated",
	);

	const server = await createServer(strategy);

	const app = express();
	app.use(express.json());
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

	app.listen(port, () => {
		logger.info(`SSE server is running on port ${port}`);
		logger.info(`Connect to the SSE endpoint at http://localhost:${port}/sse`);
		logger.info(`Send messages to http://localhost:${port}/messages`);
	});
};

interface HttpTransports {
	[sessionID: string]: StreamableHTTPServerTransport;
}

const startHTTP = (strategy: AuthenticationStrategy, port: number): void => {
	logger.info(`Starting the server in Streamable HTTP transport mode on port ${port}.`);

	const app = express();
	app.use(express.json());
	app.disable("x-powered-by");

	const transports: HttpTransports = {};

	app.post("/mcp", async (request: Request, response: Response) => {
		const sessionID = request.get("mcp-session-id");

		logger.info(`Received POST /mcp request for session ID "${sessionID ?? "undefined"}"`);

		let transport = sessionID != null ? transports[sessionID] : undefined;
		if (transport == null && !isInitializeRequest(request.body)) {
			response.status(400).json({
				error: {
					code: -32_000,
					message: "Bad Request: No valid session ID provided",
				},
				id: null,
				jsonrpc: "2.0",
			});

			return;
		}

		if (transport == null) {
			transport = new StreamableHTTPServerTransport({
				onsessioninitialized: (sessionId) => {
					transports[sessionId] = transport as StreamableHTTPServerTransport;
				},
				sessionIdGenerator: () => randomUUID(),
			});

			transport.onclose = () => {
				if (transport?.sessionId != null) {
					delete transports[transport.sessionId];
				}
			};

			const server = await createServer(strategy);
			await server.connect(transport);
		}

		await transport.handleRequest(request, response, request.body);
	});

	const handleSessionRequest = async (request: Request, response: Response) => {
		const sessionID = request.get("mcp-session-id");
		logger.info(`Received ${request.method} /mcp request for session ID "${sessionID ?? "undefined"}"`);

		if (sessionID == null || transports[sessionID] == null) {
			response.status(400).send("Invalid or missing session ID.");

			return;
		}

		const transport = transports[sessionID];
		await transport.handleRequest(request, response);
	};

	app.get("/mcp", handleSessionRequest);
	app.delete("/mcp", handleSessionRequest);

	app.listen(port, () => {
		logger.info(`Streamable HTTP server is running on port ${port}`);
		logger.info(`Connect to the endpoint at http://localhost:${port}/mcp`);
	});
};

const startServer = async (): Promise<void> => {
	const { PORT, MCP_TRANSPORT } = loadEnvironment();

	try {
		if (MCP_TRANSPORT === "stdio") {
			return await startSTDIO(new LocalStrategy());
		}

		if (MCP_TRANSPORT === "sse") {
			return await startSSE(new LocalStrategy(), PORT);
		}

		return startHTTP(new LocalStrategy(), PORT);
	} catch (error: unknown) {
		logger.error(`Could not start the ${MCP_TRANSPORT} transport mode`);
		logger.error(error);

		process.exit(1);
	}
};

await startServer();
