import process from "node:process";
import dotenv from "dotenv";
import { z } from "zod/v4";
import { logger } from "./logger.ts";

const boolean = () =>
	z.preprocess((value: unknown) => {
		const normalized = String(value).toLowerCase();

		return normalized === "true" || normalized === "1";
	}, z.boolean());

const environmentCommonSchema = z.object({
	AI_RUNTIME: boolean(),
	MCP_FORCE_MODE: z.string().toLowerCase().default("stdio"),
	PORT: z
		.string()
		.optional()
		.transform((val) => (val ? Number.parseInt(val, 10) : 3456)),
});

const developmentEnvironmentSchema = environmentCommonSchema.extend({
	FAKTUROID_ACCOUNT_SLUG: z.string().default("development-account"),
	FAKTUROID_APP_NAME: z.string().default("Fakturoid MCP Dev"),
	FAKTUROID_CLIENT_ID: z.string().default("dev-client-id"),
	FAKTUROID_CLIENT_SECRET: z.string().default("dev-client-secret"),
	FAKTUROID_CONTACT_EMAIL: z.string().email().default("dev-contact@example.com"),
	NODE_ENV: z.preprocess((value: unknown) => String(value).toLowerCase(), z.literal("development")),
});

const productionEnvironmentSchema = environmentCommonSchema.extend({
	FAKTUROID_ACCOUNT_SLUG: z.string().min(1),
	FAKTUROID_APP_NAME: z.string().min(1),
	FAKTUROID_CLIENT_ID: z.string().min(1),
	FAKTUROID_CLIENT_SECRET: z.string().min(1),
	FAKTUROID_CONTACT_EMAIL: z.email(),
	NODE_ENV: z.preprocess(
		(value: unknown) => String(value).toLowerCase(),
		z.literal("production").default("production"),
	),
});

const environmentSchema = z.union([developmentEnvironmentSchema, productionEnvironmentSchema]).transform((parsed) => {
	return {
		environment: parsed.NODE_ENV,
		fakturoid: {
			accountSlug: parsed.FAKTUROID_ACCOUNT_SLUG,
			appName: parsed.FAKTUROID_APP_NAME,
			clientID: parsed.FAKTUROID_CLIENT_ID,
			clientSecret: parsed.FAKTUROID_CLIENT_SECRET,
			contactEmail: parsed.FAKTUROID_CONTACT_EMAIL,
		},
		forceMode: parsed.MCP_FORCE_MODE,
		isAIRuntime: parsed.AI_RUNTIME,
		port: parsed.PORT,
	};
});

type Environment = z.infer<typeof environmentSchema>;

const parseEnvironment = (): Environment => {
	dotenv.config();

	const environment = environmentSchema.safeParse(process.env);

	if (!environment.success) {
		logger.error("Could not properly parse environment variables.");
		logger.error("Please check your .env file or set these variables manually.");
		logger.error(z.prettifyError(environment.error));

		process.exit(1);
	}

	logger.info(`Environment mode: ${environment.data.environment}`);
	logger.info(`Claude/AI runtime detected: ${environment.data.isAIRuntime ? "yes" : "no"}`);

	return environment.data;
};

const environment = parseEnvironment();

export { environment };
export type { Environment };
