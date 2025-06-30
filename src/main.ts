import process from "node:process";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import dotenv from "dotenv";
import express from "express";
import { z } from "zod/v4";
import { LocalStrategy } from "./auth/localStrategy.ts";
import { createServer } from "./server.ts";
import { logger } from "./utils/logger.ts";

const EnvironmentSchema = z.object({
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

const startServer = async (): Promise<void> => {
	const { PORT } = loadEnvironment();
	const server = await createServer(new LocalStrategy());

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

	app.listen(PORT, () => {
		logger.info(`SSE server is running on port ${PORT}`);
		logger.info(`Connect to the SSE endpoint at http://localhost:${PORT}/sse`);
		logger.info(`Send messages to http://localhost:${PORT}/messages`);
	});
};

await startServer();
