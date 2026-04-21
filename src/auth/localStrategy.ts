import process from "node:process";
import dotenv from "dotenv";
import { z } from "zod/v3";
import { logger } from "../utils/logger.js";
import { AuthenticationStrategy } from "./strategy.js";

interface Configuration {
	clientID: string;
	clientSecret: string;
	baseURL: string;
	appName: string;
	email: string;
}

const TokenResponseSchema = z
	.object({
		access_token: z.string().min(1),
		expires_in: z.number().int().positive(),
		token_type: z.string().min(1),
	})
	.passthrough();

const EnvironmentConfigurationSchema = z
	.object({
		// Support both FAKTUROID_ prefixed and non-prefixed environment variables
		API_URL: z.string().url().optional(),
		FAKTUROID_API_URL: z.string().url().optional(),
		APP_NAME: z.string().min(1).optional(),
		FAKTUROID_APP_NAME: z.string().min(1).optional(),
		CLIENT_ID: z.string().min(1).optional(),
		FAKTUROID_CLIENT_ID: z.string().min(1).optional(),
		CLIENT_SECRET: z.string().min(1).optional(),
		FAKTUROID_CLIENT_SECRET: z.string().min(1).optional(),
		CONTACT_EMAIL: z.string().email().optional(),
		FAKTUROID_CONTACT_EMAIL: z.string().email().optional(),
		ACCOUNT_SLUG: z.string().min(1).optional(),
		FAKTUROID_ACCOUNT_SLUG: z.string().min(1).optional(),
	})
	.transform((parsed) => {
		const apiUrl = parsed.FAKTUROID_API_URL ?? parsed.API_URL;
		const clientId = parsed.FAKTUROID_CLIENT_ID ?? parsed.CLIENT_ID;
		const clientSecret = parsed.FAKTUROID_CLIENT_SECRET ?? parsed.CLIENT_SECRET;
		const appName = parsed.FAKTUROID_APP_NAME ?? parsed.APP_NAME ?? "FakturoidMCP";
		const email = parsed.FAKTUROID_CONTACT_EMAIL ?? parsed.CONTACT_EMAIL ?? "test@example.com";

		if (!apiUrl) {
			throw new Error("API_URL or FAKTUROID_API_URL is required");
		}
		if (!clientId) {
			throw new Error("CLIENT_ID or FAKTUROID_CLIENT_ID is required");
		}
		if (!clientSecret) {
			throw new Error("CLIENT_SECRET or FAKTUROID_CLIENT_SECRET is required");
		}

		return {
			appName,
			baseURL: apiUrl,
			clientID: clientId,
			clientSecret,
			email,
		} satisfies Configuration;
	});

const loadEnvironmentConfiguration = (): Configuration => {
	dotenv.config({ quiet: true });

	const configuration = EnvironmentConfigurationSchema.safeParse(process.env);
	if (!configuration.success) {
		logger.error("Could not load the configuration from ENV!");
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
				logger.error("Unexpected response from the API: ", tokenResponse.error);

				throw new Error(tokenResponse.error.message);
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

	async getHeaders(headers: Record<string, string> | Headers) {
		const token = await this.getAccessToken();
		const initHeaders = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;

		return new Headers({
			...initHeaders,
			Authorization: `Bearer ${token}`,
		});
	}
}

export { LocalStrategy };
