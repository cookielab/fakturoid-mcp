import fetch, { type RequestInit } from "node-fetch";
import { z } from "zod";
import { logger } from "../../utils/logger.ts";
import { BASE_URL, type FakturoidClientConfig, getTokenManager } from "./auth.ts";

const ErrorResponseSchema = z.object({
	error: z.string().optional(),
	error_description: z.string().optional(),
	errors: z.record(z.array(z.string())).optional(),
});

export async function getHeaders(config: FakturoidClientConfig, contentType = true): Promise<Record<string, string>> {
	const tokenManager = getTokenManager(config);
	const accessToken = await tokenManager.getToken();

	const headers: Record<string, string> = {
		Authorization: `Bearer ${accessToken}`,
		"User-Agent": `${config.appName} (${config.contactEmail})`,
	};

	if (contentType) {
		headers["Content-Type"] = "application/json";
	}

	return headers;
}

export function accountEndpoint(config: FakturoidClientConfig, path: string): string {
	return `/accounts/${config.accountSlug}${path}`;
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: It is what it is for now
export async function request<Output, Body = undefined>(
	config: FakturoidClientConfig,
	endpoint: string,
	method: "GET" | "POST" | "PATCH" | "DELETE" = "GET",
	data?: Body,
	queryParams?: Record<string, string>,
): Promise<Output> {
	let url = `${BASE_URL}${endpoint}`;
	if (queryParams) {
		const params = new URLSearchParams();
		for (const [key, value] of Object.entries(queryParams)) {
			if (value !== undefined) {
				params.append(key, value);
			}
		}

		const queryString = params.toString();
		if (queryString) {
			url += `?${queryString}`;
		}
	}

	const headers = await getHeaders(config, !!data);
	const options: RequestInit = {
		headers: headers,
		method: method,
	};

	if (data) {
		options.body = JSON.stringify(data);
	}

	const response = await fetch(url, options);
	const contentType = response.headers.get("content-type");
	const isJson = contentType?.includes("application/json") ?? false;
	const body = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		if (isJson) {
			const errorData = ErrorResponseSchema.parse(body);
			if (errorData.error && errorData.error_description) {
				throw new Error(`${errorData.error}: ${errorData.error_description}`);
			}
			if (errorData.errors) {
				const messages = Object.entries(errorData.errors)
					.map(([field, errors]) => `${field}: ${errors.join(", ")}`)
					.join("; ");
				throw new Error(`Validation error: ${messages}`);
			}
		}
		throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
	}

	return body as Output;
}

export async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
	let retries = 0;
	while (true) {
		try {
			// biome-ignore lint/nursery/noAwaitInLoop: It is what it is for now
			return await fn();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);

			if (retries < maxRetries && message.includes("429 Too Many Requests")) {
				const delay = 2 ** retries * 1000;

				logger.warn(`Rate limited, retrying in ${delay}ms...`);

				await new Promise((resolve) => setTimeout(resolve, delay));
				retries++;
			} else {
				throw error;
			}
		}
	}
}

export { ErrorResponseSchema };
