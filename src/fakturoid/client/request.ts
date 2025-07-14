import type { AuthenticationStrategy } from "../../auth/strategy.js";
import {
	APIErrorSchema,
	type GeneralError as GeneralErrorType,
	type InvalidDataError as InvalidDataErrorType,
} from "../model/error.js";

const PAGE_SIZE = 40 as const;

class InvalidDataError extends Error {
	readonly data: InvalidDataErrorType;

	constructor(data: InvalidDataErrorType) {
		super("The request has failed due to invalid data being submitted.");

		this.data = data;
	}
}

class GeneralError extends Error {
	readonly data: GeneralErrorType;

	constructor(data: GeneralErrorType) {
		super(data.error_description);

		this.data = data;
	}
}

class UnexpectedError extends Error {
	constructor(message: string) {
		super(`The request has failed unexpectedly: ${message}`);
	}
}

const request = async <Response, Body = undefined>(
	strategy: AuthenticationStrategy,
	endpoint: string,
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
	body?: Body,
	queryParameters?: Record<string, string>,
): Promise<Response> => {
	const params = Object.entries(queryParameters ?? {})
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
		.join("&");

	const url = `${strategy.apiURL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}${params.length > 0 ? `?${params}` : ""}`;

	const headers = await strategy.getHeaders({
		"Content-Type": "application/json",
		"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
	});

	const requestData: RequestInit = {
		body: body != null ? JSON.stringify(body) : null,
		headers: Object.fromEntries(headers.entries()),
		method: method,
	};

	const response = await fetch(url.toString(), requestData);
	const responseBody = await response.blob();

	if (!response.ok) {
		const parsedError = APIErrorSchema.safeParse(responseBody);
		if (!parsedError.success) {
			throw new UnexpectedError(await responseBody.text());
		}

		if ("errors" in parsedError.data) {
			throw new InvalidDataError(parsedError.data);
		}

		throw new GeneralError(parsedError.data);
	}

	const isJSON = response.headers.get("content-type")?.includes("application/json") ?? false;

	return (isJSON ? JSON.parse(await responseBody.text()) : responseBody) as Response;
};

async function* paginatedRequest<Item>(
	strategy: AuthenticationStrategy,
	endpoint: string,
	queryParameters?: Record<string, string>,
	page?: number,
): AsyncGenerator<Item[], undefined, undefined> {
	let currentPage = page ?? 1;

	while (true) {
		// biome-ignore lint/nursery/noAwaitInLoop: Usage in generator
		const response = await request<Item[]>(strategy, endpoint, "GET", undefined, {
			...queryParameters,
			page: String(currentPage),
		});

		if (response.length < PAGE_SIZE) {
			// Must yield, as returned values are not consumed in `for await` loops.
			yield response;

			return;
		}

		yield response;

		currentPage += 1;
	}
}

const requestAllPages = async <Item>(
	strategy: AuthenticationStrategy,
	endpoint: string,
	queryParameters?: Record<string, string>,
	pageCount?: number,
): Promise<Item[]> => {
	const items: Item[] = [];
	let currentPage = 0;

	for await (const itemsPage of paginatedRequest<Item>(strategy, endpoint, queryParameters)) {
		if (itemsPage == null) {
			break;
		}

		items.push(...itemsPage);
		currentPage++;

		if (currentPage >= (pageCount ?? Number.MAX_VALUE)) {
			break;
		}
	}

	return items;
};

export { request, paginatedRequest, requestAllPages, GeneralError, InvalidDataError, UnexpectedError };
