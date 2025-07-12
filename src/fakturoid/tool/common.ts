import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod/v3";
import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { FakturoidClient } from "../client.js";
import { logger } from "../../utils/logger.js";

type ServerToolCreator<
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
> = (server: McpServer, client: FakturoidClient<Configuration, Strategy>) => void;

const createTool = <
	InputSchema extends z.ZodRawShape | undefined = undefined,
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
>(
	name: string,
	title: string,
	description: string,
	implementation: (
		client: FakturoidClient<Configuration, Strategy>,
		input: InputSchema extends z.ZodRawShape ? z.objectOutputType<InputSchema, z.ZodTypeAny> : undefined,
	) => CallToolResult | Promise<CallToolResult>,
	inputSchema?: InputSchema,
): ServerToolCreator<Configuration, Strategy> => {
	return (server, client) => {
		try {
			if (inputSchema == null) {
				return server.registerTool(name, { title: title, description: description }, () =>
					implementation(
						client,
						undefined as InputSchema extends z.ZodRawShape ? z.objectOutputType<InputSchema, z.ZodTypeAny> : undefined,
					),
				);
			}

			// Yeah, we don't care for that, Typescript.
			// @ts-expect-error "Type instantiation is excessively deep and possibly infinite"
			return server.registerTool(name, { title: title, description: description, inputSchema: inputSchema }, (input) =>
				implementation(
					client,
					input as InputSchema extends z.ZodRawShape ? z.objectOutputType<InputSchema, z.ZodTypeAny> : undefined,
				),
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
