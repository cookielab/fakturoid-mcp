import { z } from "zod";
import { logger } from "../utils/logger.js";
import { AuthenticationStrategy } from "./strategy.js";

interface OAuthConfiguration {
	clientID: string;
	clientSecret: string;
	baseURL: string;
	appName: string;
	contactEmail: string;
	tokensStore: KVNamespace<string>;
}

const TokenSchema = z.object({
	accessToken: z.string().nonempty(),
	expiresAt: z.union([z.date(), z.iso.datetime(), z.iso.date()]).transform((value) => {
		if (typeof value === "string") {
			return new Date(value);
		}

		return value;
	}),
	refreshToken: z.string().nonempty().optional(),
	userEmail: z.email().optional(),
});

type TokenInfo = z.infer<typeof TokenSchema>;

interface UserContext {
	userId: string;
	accessToken: string;
}

const TokenResponseSchema = z.looseObject({
	access_token: z.string().min(1),
	expires_in: z.number().int().positive().optional(),
	refresh_token: z.string().min(1).optional(),
	token_type: z.string().min(1),
});

const UserResponseSchema = z.looseObject({
	id: z.number().int(),
	full_name: z.string(),
	email: z.email(),
});

const EXPIRATION_MARGIN = 1000 * 60 * 5;

class OAuthStrategy extends AuthenticationStrategy<OAuthConfiguration> {
	private currentUserId?: string;
	private readonly tokensStore: KVNamespace<string>;

	constructor(configuration: OAuthConfiguration) {
		super(configuration, configuration.appName, configuration.baseURL);

		this.tokensStore = configuration.tokensStore;
	}

	setCurrentUser(userId: string): void {
		this.currentUserId = userId;
	}

	async setUser(context: UserContext): Promise<void> {
		this.currentUserId = context.userId;

		const token = await this.getToken(context.userId);
		if (token != null) {
			return;
		}

		await this.setToken(context.userId, {
			accessToken: context.accessToken,
			expiresAt: new Date(Date.now() + 3600 * 1000 - EXPIRATION_MARGIN),
		});
	}

	async exchangeCodeForToken(
		code: string,
		redirectUri: string,
	): Promise<{ accessToken: string; userId: string; userData: unknown }> {
		const credentials = Buffer.from(`${this.configuration.clientID}:${this.configuration.clientSecret}`).toString(
			"base64",
		);

		const tokenResponse = await fetch(`${this.configuration.baseURL}/oauth/token`, {
			method: "POST",
			headers: {
				Accept: "application/json",
				Authorization: `Basic ${credentials}`,
				"Content-Type": "application/x-www-form-urlencoded",
				"User-Agent": `${this.configuration.appName} (${this.configuration.contactEmail})`,
			},
			body: new URLSearchParams({
				code: code,
				redirect_uri: redirectUri,
				grant_type: "authorization_code",
			}).toString(),
		});

		if (!tokenResponse.ok) {
			const errorText = await tokenResponse.text();
			logger.error("Failed to exchange code for token:", errorText);

			throw new Error(`Failed to obtain token: ${tokenResponse.status} ${tokenResponse.statusText}`);
		}

		const tokenData = TokenResponseSchema.parse(await tokenResponse.json());

		const userResponse = await fetch(`${this.configuration.baseURL}/user.json`, {
			headers: {
				Authorization: `Bearer ${tokenData.access_token}`,
				"User-Agent": `${this.configuration.appName} (${this.configuration.contactEmail})`,
			},
		});

		if (!userResponse.ok) {
			const errorText = await userResponse.text();
			logger.error("Failed to fetch user information:", errorText);

			throw new Error(`Failed to fetch user: ${userResponse.status} ${userResponse.statusText}`);
		}

		const userData = UserResponseSchema.safeParse(await userResponse.json());
		if (!userData.success) {
			logger.error("Could not parse user response.");
			logger.error(z.prettifyError(userData.error));

			throw new Error(`Failed to parse user: ${z.prettifyError(userData.error)}`);
		}

		const expiresAt = tokenData.expires_in
			? new Date(Date.now() + tokenData.expires_in * 1000 - EXPIRATION_MARGIN)
			: new Date(Date.now() + 3600 * 1000 - EXPIRATION_MARGIN); // Default to 1 hour if not provided

		await this.setToken(String(userData.data.id), {
			accessToken: tokenData.access_token,
			expiresAt: expiresAt,
			refreshToken: tokenData.refresh_token,
			userEmail: userData.data.email,
		});

		return {
			accessToken: tokenData.access_token,
			userId: String(userData.data.id),
			userData: userData.data,
		};
	}

	/**
	 * Builds the authorization URL for OAuth flow
	 */
	getAuthorizationUrl(redirectUri: string, state: string): string {
		const query = new URLSearchParams({
			client_id: this.configuration.clientID,
			redirect_uri: redirectUri,
			scope: "email profile",
			response_type: "code",
			state: state,
		});

		return `${this.configuration.baseURL}/oauth?${query}`;
	}

	override getContactEmail(): string {
		return this.configuration.contactEmail;
	}

	override async getHeaders(headers: Record<string, string> | Headers): Promise<Headers> {
		const token = await this.getAccessToken();
		const initHeaders = headers instanceof Headers ? Object.fromEntries(headers.entries()) : headers;

		return new Headers({
			...initHeaders,
			Authorization: `Bearer ${token}`,
			"User-Agent": `${this.configuration.appName} (${this.getContactEmail()})`,
		});
	}

	override async getAccessToken(): Promise<string> {
		if (this.currentUserId == null) {
			throw new Error("No user context set. Call setCurrentUser() or setExternalUserContext() first.");
		}

		const token = await this.getToken(this.currentUserId);
		if (token == null) {
			throw new Error(`No token found for user ${this.currentUserId}`);
		}

		if (token.expiresAt > new Date()) {
			return token.accessToken;
		}

		if (token.refreshToken != null) {
			return await this.refreshToken();
		}

		throw new Error("Token expired and no refresh token available");
	}

	override async refreshToken(): Promise<string> {
		if (this.currentUserId == null) {
			throw new Error("No user context set. Call setCurrentUser() first.");
		}

		const tokenInfo = await this.getToken(this.currentUserId);
		if (tokenInfo?.refreshToken == null) {
			throw new Error("No refresh token available");
		}

		try {
			const credentials = Buffer.from(`${this.configuration.clientID}:${this.configuration.clientSecret}`).toString(
				"base64",
			);

			const response = await fetch(`${this.configuration.baseURL}/oauth/token`, {
				method: "POST",
				headers: {
					Accept: "application/json",
					Authorization: `Basic ${credentials}`,
					"Content-Type": "application/x-www-form-urlencoded",
					"User-Agent": `${this.configuration.appName} (${this.getContactEmail()})`,
				},
				body: new URLSearchParams({
					grant_type: "refresh_token",
					refresh_token: tokenInfo.refreshToken,
				}).toString(),
			});

			if (!response.ok) {
				const errorText = await response.text();
				logger.error("Failed to refresh token:", errorText);

				throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`);
			}

			const tokenData = TokenResponseSchema.parse(await response.json());

			const expiresAt = tokenData.expires_in
				? new Date(Date.now() + tokenData.expires_in * 1000 - EXPIRATION_MARGIN)
				: new Date(Date.now() + 3600 * 1000 - EXPIRATION_MARGIN); // Default to 1 hour

			await this.setToken(this.currentUserId, {
				accessToken: tokenData.access_token,
				expiresAt: expiresAt,
				refreshToken: tokenData.refresh_token ?? tokenInfo.refreshToken,
				userEmail: tokenInfo.userEmail,
			});

			return tokenData.access_token;
		} catch (error) {
			logger.error("Error refreshing OAuth token:", error);
			throw error;
		}
	}

	private async setToken(userID: string, token: TokenInfo): Promise<void> {
		await this.tokensStore.put(userID, JSON.stringify(token));
	}

	private async getToken(userID: string): Promise<TokenInfo | null> {
		const savedToken = await this.tokensStore.get(userID);
		if (savedToken == null) {
			return savedToken;
		}

		const parsingResult = TokenSchema.safeParse(JSON.parse(savedToken));
		if (!parsingResult.success) {
			logger.error(`Could not parse token of user ${userID}. Removing the invalid token from store.`);
			logger.error(z.prettifyError(parsingResult.error));

			this.tokensStore.delete(userID);

			return null;
		}

		return parsingResult.data;
	}
}

export { OAuthStrategy, type OAuthConfiguration, type UserContext };
