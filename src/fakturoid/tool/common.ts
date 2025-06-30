import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { z as zodV3 } from "zod/v3";
import type { z } from "zod/v4";
import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { FakturoidClient } from "../client.ts";
import { logger } from "../../utils/logger.ts";

type ServerToolCreator<
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
> = (server: McpServer, client: FakturoidClient<Configuration, Strategy>) => void;

const createTool = <
	InputSchema extends z.ZodObject | undefined = undefined,
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
>(
	name: string,
	implementation: (
		client: FakturoidClient<Configuration, Strategy>,
		input: InputSchema extends z.ZodObject ? z.infer<InputSchema> : undefined,
	) => CallToolResult | Promise<CallToolResult>,
	inputSchema?: InputSchema,
): ServerToolCreator<Configuration, Strategy> => {
	return (server, client) => {
		try {
			if (inputSchema == null) {
				return server.tool(name, () =>
					implementation(client, undefined as InputSchema extends z.ZodObject ? z.infer<InputSchema> : undefined),
				);
			}

			return server.tool(name, inputSchema as unknown as zodV3.ZodRawShape, (input) =>
				implementation(client, input as InputSchema extends z.ZodObject ? z.infer<InputSchema> : undefined),
			);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);

			logger.error("Failed to execute a tool.");
			logger.error(message);

			return {
				content: [{ text: `Error: ${message}`, type: "text" }],
			};
		}
	};
};

export { createTool };
export type { ServerToolCreator };
