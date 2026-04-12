import type { OAuthHelpers } from "@cloudflare/workers-oauth-provider";
import type { BlankSchema } from "hono/types";
import type { OAuthStrategy } from "../auth/oauthStrategy.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { html } from "hono/html";
import { logger as honoLogger } from "hono/logger";
import { KVFileStaging } from "../staging/kvStorage.js";
import { handleFileDownload, handleFileUpload } from "../staging/routes.js";
import { uploadPageHtml } from "../staging/upload-page.js";
import { logger } from "../utils/logger.js";
import { Dialog } from "./Dialog.js";

type HonoEnvironment = { Bindings: Env & { OAUTH_PROVIDER: OAuthHelpers } };
type HonoSchema = BlankSchema;
type HonoBasePath = "/";

const createHandler = (strategy: OAuthStrategy) => {
	const app = new Hono<HonoEnvironment, HonoSchema, HonoBasePath>();
	app.use(honoLogger());
	app.use(cors());

	// Upload page
	app.get("/upload", (context) => {
		const baseUrl = new URL(context.req.url).origin;
		return context.html(uploadPageHtml(baseUrl));
	});

	// Upload endpoint
	app.post("/upload", async (context) => {
		try {
			const staging = new KVFileStaging(context.env.FILE_STAGING);
			const formData = await context.req.raw.formData();
			const file = formData.get("file");

			if (!(file instanceof File)) {
				return context.json({ error: "No file provided" }, 400);
			}

			const result = await handleFileUpload(staging, {
				content: await file.arrayBuffer(),
				filename: file.name,
				mimeType: file.type || "application/octet-stream",
			});

			return context.json(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			return context.json({ error: message }, 400);
		}
	});

	// Download endpoint
	app.get("/download/:ref", async (context) => {
		const ref = context.req.param("ref");
		const staging = new KVFileStaging(context.env.FILE_STAGING);
		const file = await handleFileDownload(staging, ref);

		if (file == null) {
			return context.json({ error: "File not found or expired" }, 404);
		}

		return new Response(file.content, {
			headers: {
				"Content-Type": file.mimeType,
				"Content-Disposition": `inline; filename="${file.filename}"`,
			},
		});
	});

	app.get("/authorize", async (context) => {
		const authorizationRequest = await context.env.OAUTH_PROVIDER.parseAuthRequest(context.req.raw);

		return await context.html(
			<>
				{html`<!DOCTYPE html>`}
				<Dialog authorizationRequest={btoa(JSON.stringify(authorizationRequest))} />
			</>,
		);
	});

	app.post("/authorize", async (context) => {
		const formData = await context.req.raw.formData();
		const authorizationRequest = formData.get("authRequest");
		const oauthRequestInfo = JSON.parse(atob(authorizationRequest?.toString() ?? ""));

		const query = new URLSearchParams({
			client_id: context.env.FAKTUROID_CLIENT_ID,
			redirect_uri: new URL("/callback", context.req.raw.url).href,
			response_type: "code",
			scope: "email profile",
			state: btoa(JSON.stringify(oauthRequestInfo)),
		});

		return context.redirect(`${context.env.API_URL}/oauth?${query}`);
	});

	app.get("/callback", async (context) => {
		const authorizationRequest = JSON.parse(atob(context.req.query("state") as string));
		const code = context.req.query("code") ?? "";

		try {
			const redirectURI = new URL(context.req.url);
			redirectURI.search = "";

			const { userId, accessToken } = await strategy.exchangeCodeForToken(code, redirectURI.toString());

			const { redirectTo } = await context.env.OAUTH_PROVIDER.completeAuthorization({
				request: authorizationRequest,
				userId: userId,
				metadata: null,
				scope: authorizationRequest.scope,
				props: {
					accessToken: accessToken,
					userId: userId,
				},
			});

			strategy.setCurrentUser(userId);

			return context.redirect(redirectTo);
		} catch (error) {
			logger.error("OAuth callback error:", error);

			return context.text("Internal Server Error", 500);
		}
	});

	return app;
};

export { createHandler };
