import crypto from "node:crypto";
import fetch from "node-fetch";
import { logger } from "../../utils/logger.ts";

interface FakturoidClientConfig {
	accountSlug: string;
	clientId: string;
	clientSecret: string;
	appName: string;
	contactEmail: string;
	url: string;
}

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
}

interface OAuthConfig {
	clientId: string;
	clientSecret: string;
	appName: string;
	contactEmail: string;
}

// Five minutes for now
const EXPIRATION_MARGIN = 1000 * 60 * 5;

class TokenManager {
	private accessToken: string | null = null;
	private tokenExpiry: Date | null = null;
	private readonly config: OAuthConfig;

	constructor(config: OAuthConfig) {
		this.config = config;
	}

	/**
	 * Get a valid access token, obtaining a new one if needed
	 */
	async getToken(clientConfiguration: FakturoidClientConfig): Promise<string> {
		// Check if we have a valid token
		if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
			return this.accessToken;
		}

		// Get a new token
		return await this.refreshToken(clientConfiguration);
	}

	/**
	 * Force refresh the token
	 */
	async refreshToken(clientConfiguration: FakturoidClientConfig): Promise<string> {
		try {
			const authorizationToken = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64");

			const response = await fetch(`${clientConfiguration.url}/oauth/token`, {
				body: JSON.stringify({
					grant_type: "client_credentials",
				}),
				headers: {
					Accept: "application/json",
					Authorization: `Basic ${authorizationToken}`,
					"Content-Type": "application/json",
					"User-Agent": `${this.config.appName} (${this.config.contactEmail})`,
				},
				method: "POST",
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Failed to obtain token: ${response.status} ${response.statusText}, ${errorText}`);
			}

			const data = (await response.json()) as TokenResponse;

			// Store the token and calculate expiry
			this.accessToken = data.access_token;
			this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000 - EXPIRATION_MARGIN);

			return this.accessToken;
		} catch (error) {
			logger.error("Error obtaining OAuth token:", error);
			throw error;
		}
	}
}

// Create and store a token manager instance per client config
const tokenManagers = new Map<string, TokenManager>();

function getTokenManager(config: FakturoidClientConfig): TokenManager {
	// Create a unique key for this client configuration
	const key = crypto.createHash("sha256").update(`${config.clientId}:${config.accountSlug}`).digest("hex");

	let tokenManager = tokenManagers.get(key);
	if (tokenManager == null) {
		const oauthConfig: OAuthConfig = {
			appName: config.appName,
			clientId: config.clientId,
			clientSecret: config.clientSecret,
			contactEmail: config.contactEmail,
		};

		tokenManager = new TokenManager(oauthConfig);

		tokenManagers.set(key, tokenManager);
	}

	return tokenManager;
}

export { getTokenManager, TokenManager };
export type { TokenResponse, OAuthConfig, FakturoidClientConfig };
