import fetch from "node-fetch";
import { logger } from "../../utils/logger.ts";

// Fakturoid API base URL
const BASE_URL = "https://app.fakturoid.cz/api/v3";

interface FakturoidClientConfig {
	accountSlug: string;
	clientId: string;
	clientSecret: string;
	appName: string;
	contactEmail: string;
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

class TokenManager {
	private accessToken: string | null = null;
	private tokenExpiry: Date | null = null;
	private config: OAuthConfig;

	constructor(config: OAuthConfig) {
		this.config = config;
	}

	/**
	 * Get a valid access token, obtaining a new one if needed
	 */
	async getToken(): Promise<string> {
		// Check if we have a valid token
		if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
			return this.accessToken;
		}

		// Get a new token
		return await this.refreshToken();
	}

	/**
	 * Force refresh the token
	 */
	async refreshToken(): Promise<string> {
		try {
			const response = await fetch(`${BASE_URL}/oauth/token`, {
				body: JSON.stringify({
					grant_type: "client_credentials",
				}),
				headers: {
					Accept: "application/json",
					Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64")}`,
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

			// Store the token and calculate expiry (subtract 5 minutes for safety margin)
			this.accessToken = data.access_token;
			this.tokenExpiry = new Date(Date.now() + (data.expires_in - 300) * 1000);

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
	const key = `${config.clientId}:${config.accountSlug}`;

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

export { getTokenManager, TokenManager, BASE_URL };
export type { TokenResponse, OAuthConfig, FakturoidClientConfig };
