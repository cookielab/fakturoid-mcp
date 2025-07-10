import process from "node:process";
import { type Logger, type LoggerOptions, pino } from "pino";

const DEVELOPMENT_OPTIONS = {
	name: "fakturoid-mcp",
	transport: {
		level: "debug",
		options: {
			colorize: true,
		},
		target: "pino-pretty",
	},
	level: "debug",
} as const satisfies LoggerOptions<never, boolean>;

const PRODUCTION_OPTIONS = {
	level: "info",
	name: "fakturoid-mcp",
} as const satisfies LoggerOptions<never, boolean>;

const initializeLogger = (): Logger<never, boolean> => {
	// biome-ignore lint/complexity/useLiteralKeys: It's better to access it through index here. Not using environment.ts to prevent cycles.
	const isDevelopment = (process.env["NODE_ENV"]?.toLowerCase() ?? "development") === "development";
	const options = isDevelopment ? DEVELOPMENT_OPTIONS : PRODUCTION_OPTIONS;

	const logger = pino(options);

	return logger;
};

const logger = initializeLogger();

export { logger };
