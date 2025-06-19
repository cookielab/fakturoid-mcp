import fetch from "node-fetch";
import { logger } from "../../utils/logger.ts";

interface ClientCredentialsGrant {
	grant_type: "client_credentials";
}

interface AuthorizationCodeGrant {
	grant_type: "authorization_code";
	code: string;
	redirectUri: string;
}

interface RefreshTokenGrant {
	grant_type: "refresh_token";
	refresh_token: string;
}

type TokenGrant = ClientCredentialsGrant | AuthorizationCodeGrant | RefreshTokenGrant;

type FakturoidClientConfig = OAuthConfig & {
	accountSlug: string;
	url: string;
};

interface TokenResponse {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token?: string;
}

type OAuthConfig = {
	clientId: string;
	clientSecret: string;
	appName: string;
	contactEmail: string;
	grant: TokenGrant;
};

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
	async getToken(clientConfiguration: Omit<FakturoidClientConfig, "accountSlug">): Promise<string> {
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
	async refreshToken(clientConfiguration: Omit<FakturoidClientConfig, "accountSlug">): Promise<string> {
		try {
			const authorizationToken = Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString("base64");

			const response = await fetch(`${clientConfiguration.url}/oauth/token`, {
				body: JSON.stringify(this.config.grant),
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
			if (data.refresh_token != null) {
				this.config.grant = {
					grant_type: "refresh_token",
					refresh_token: data.refresh_token,
				};
			}

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

let tokenManager: TokenManager;

const getTokenManager = (config: OAuthConfig): TokenManager => {
	tokenManager ??= new TokenManager(config);

	return tokenManager;
};

export { getTokenManager, TokenManager };
export type { TokenResponse, OAuthConfig, FakturoidClientConfig };
