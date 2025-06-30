import process from "node:process";
import dotenv from "dotenv";
import { z } from "zod/v4";
import { logger } from "../utils/logger.ts";
import { AuthenticationStrategy } from "./strategy.ts";

interface Configuration {
	clientID: string;
	clientSecret: string;
	baseURL: string;
	appName: string;
	email: string;
}

const TokenResponseSchema = z.looseObject({
	access_token: z.string().min(1),
	expires_in: z.int().positive(),
	token_type: z.string().min(1),
});

const EnvironmentConfigurationSchema = z
	.object({
		API_URL: z.url(),
		APP_NAME: z.string().min(1).default("FakturoidMCP"),
		CLIENT_ID: z.string().min(1),
		CLIENT_SECRET: z.string().min(1),
		CONTACT_EMAIL: z.email().default("test@example.com"),
	})
	.transform(
		(parsed) =>
			({
				appName: parsed.APP_NAME,
				baseURL: parsed.API_URL,
				clientID: parsed.CLIENT_ID,
				clientSecret: parsed.CLIENT_SECRET,
				email: parsed.CONTACT_EMAIL,
			}) satisfies Configuration,
	);

const loadEnvironmentConfiguration = (): Configuration => {
	dotenv.config();

	const configuration = EnvironmentConfigurationSchema.safeParse(process.env);
	if (!configuration.success) {
		logger.error("Could not load the configuration from ENV!");
		logger.error(z.prettifyError(configuration.error));
		logger.error(configuration.error);

		// Fatal error - should be ok to exit completely
		process.exit(1);
	}

	return configuration.data;
};

// Five minutes for now
const EXPIRATION_MARGIN = 1000 * 60 * 5;

class LocalStrategy extends AuthenticationStrategy<Configuration> {
	private accessToken: string | undefined;
	private tokenExpiry: Date | undefined;

	private readonly contactEmail: string;

	constructor(configuration: Configuration = loadEnvironmentConfiguration()) {
		super(configuration, configuration.appName, configuration.baseURL);

		this.contactEmail = configuration.email;
	}

	async getAccessToken() {
		if (this.accessToken != null && this.tokenExpiry != null && this.tokenExpiry > new Date()) {
			return this.accessToken;
		}

		this.tokenExpiry = undefined;
		this.accessToken = undefined;

		return await this.refreshToken();
	}

	async refreshToken(): Promise<string> {
		try {
			const authorizationToken = Buffer.from(
				`${this.configuration.clientID}:${this.configuration.clientSecret}`,
			).toString("base64");

			const response = await fetch(`${this.configuration.baseURL}/oauth/token`, {
				body: JSON.stringify({
					grant_type: "client_credentials",
				}),
				headers: {
					Accept: "application/json",
					Authorization: `Basic ${authorizationToken}`,
					"Content-Type": "application/json",
					"User-Agent": `${this.configuration.appName} (${this.configuration.email})`,
				},
				method: "POST",
			});

			const body = await response.text();

			if (!response.ok) {
				logger.error("Could not authenticate with the local strategy.", body);

				throw new Error(`Failed to obtain token: ${response.status} ${response.statusText}, ${body}`);
			}

			const tokenResponse = TokenResponseSchema.safeParse(JSON.parse(body));
			if (!tokenResponse.success) {
				logger.error("Unexpected response from the API: ", z.prettifyError(tokenResponse.error));

				throw new Error(z.prettifyError(tokenResponse.error));
			}

			this.tokenExpiry = new Date(Date.now() + tokenResponse.data.expires_in * 1000 - EXPIRATION_MARGIN);
			this.accessToken = tokenResponse.data.access_token;

			return this.accessToken;
		} catch (error: unknown) {
			logger.error("Error obtaining OAuth token: ", error);

			throw error;
		}
	}

	getContactEmail(): string {
		return this.contactEmail;
	}

	async getHeaders(headers: Record<string, string>) {
		const token = await this.getAccessToken();

		return {
			...headers,
			Authorization: `Bearer ${token}`,
		};
	}
}

export { LocalStrategy };
