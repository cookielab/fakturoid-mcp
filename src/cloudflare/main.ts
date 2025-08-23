import { env } from "cloudflare:workers";
import OAuthProvider, { type OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { type OAuthConfiguration, OAuthStrategy } from "../auth/oauthStrategy.js";
import { createServer } from "../server.js";
import { logger } from "../utils/logger.js";
import { createHandler } from "./handler.js";

const createOAuthStrategy = (environment: Env): OAuthStrategy => {
	const configuration: OAuthConfiguration = {
		clientID: env.FAKTUROID_CLIENT_ID,
		clientSecret: env.FAKTUROID_CLIENT_SECRET,
		baseURL: environment.API_URL,
		appName: environment.APP_NAME,
		contactEmail: environment.CONTACT_EMAIL,
		tokensStore: environment.OAUTH_TOKENS,
	};

	return new OAuthStrategy(configuration);
};

class FakturoidMCP extends McpAgent<Env, never, Record<string, string>> {
	server = new McpServer({
		name: "Fakturoid",
		version: "1.0.0",
	});
	static strategy: OAuthStrategy = createOAuthStrategy(env);

	override async init(): Promise<void> {
		FakturoidMCP.strategy = createOAuthStrategy(this.env);

		// biome-ignore lint/complexity/useLiteralKeys: Making TS happy
		const userId = this.props["userId"];
		if (userId != null) {
			FakturoidMCP.strategy.setCurrentUser(userId);

			// biome-ignore lint/complexity/useLiteralKeys: Making TS happy
			const accessToken = this.props["accessToken"];
			if (accessToken != null) {
				await FakturoidMCP.strategy.setUser({
					userId: userId,
					accessToken: accessToken,
				});
			}
		}

		this.server = await createServer(FakturoidMCP.strategy);
	}
}

// Cloudlfare workers don't export this directly for some reason. Copying it here for clarity.
type APIHandlerInterface = ExportedHandler<Env & { OAUTH_PROVIDER: OAuthHelpers }, unknown, unknown> &
	Pick<Required<ExportedHandler<Env & { OAUTH_PROVIDER: OAuthHelpers }, unknown, unknown>>, "fetch">;

class APIHandler implements APIHandlerInterface {
	private readonly path: string;

	constructor(path: string) {
		this.path = path;
	}

	async fetch(
		request: Request<unknown, IncomingRequestCfProperties<unknown>>,
		environment: Env & { OAUTH_PROVIDER: OAuthHelpers },
		context: ExecutionContext,
	): Promise<Response> {
		logger.info(JSON.stringify(context.props));

		return await FakturoidMCP.serve(this.path).fetch(request, environment, context);
	}
}

class DefaultAPIHandler implements APIHandlerInterface {
	async fetch(
		request: Request<unknown, IncomingRequestCfProperties<unknown>>,
		environment: Env & { OAUTH_PROVIDER: OAuthHelpers },
		context: ExecutionContext,
	): Promise<Response> {
		return await createHandler(FakturoidMCP.strategy).fetch(request, environment, context);
	}
}

const cloudflareProvider = new OAuthProvider({
	apiRoute: ["/mcp", "/sse"],
	apiHandlers: {
		// @ts-expect-error Cloudflare typing is so broken that even in their examples they cast any handler `as any`. Who would have thought that only prompting Claude would produce (at least slightly) broken code.
		"/mcp": new APIHandler("/mcp"),
		// @ts-expect-error Cloudflare typing is so broken that even in their examples they cast any handler `as any`. Who would have thought that only prompting Claude would produce (at least slightly) broken code.
		"/sse": new APIHandler("/sse"),
	},
	// @ts-expect-error Cloudflare typing is so broken that even in their examples they cast any handler `as any`. Who would have thought that only prompting Claude would produce (at least slightly) broken code.
	defaultHandler: new DefaultAPIHandler(),
	authorizeEndpoint: "/authorize",
	clientRegistrationEndpoint: "/register",
	tokenEndpoint: "/token",
});

// biome-ignore lint/style/noDefaultExport: Cloudflare requirement
export default cloudflareProvider;
export { FakturoidMCP };
