import {
	APIErrorSchema,
	type GeneralError as GeneralErrorType,
	type InvalidDataError as InvalidDataErrorType,
} from "../model/error.ts";
import { type FakturoidClientConfig, getTokenManager } from "./auth.ts";

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

const getHeaders = async (
	clientConfiguration: Omit<FakturoidClientConfig, "accountSlug">,
	contentType = true,
): Promise<Record<string, string>> => {
	const tokenManager = getTokenManager(clientConfiguration);
	const accessToken = await tokenManager.getToken(clientConfiguration);

	const headers: Record<string, string> = {
		Authorization: `Bearer ${accessToken}`,
		"User-Agent": `${clientConfiguration.appName} (${clientConfiguration.contactEmail})`,
	};

	if (contentType) {
		headers["Content-Type"] = "application/json";
	}

	return headers;
};

const request = async <Response, Body = undefined>(
	clientConfiguration: Omit<FakturoidClientConfig, "accountSlug">,
	endpoint: string,
	method: "GET" | "POST" | "PATCH" | "PUT" | "DELETE",
	body?: Body,
	queryParameters?: Record<string, string>,
): Promise<Response | InvalidDataError | GeneralError | UnexpectedError> => {
	const parameters = new URLSearchParams(Object.entries(queryParameters ?? {})).toString();
	const url = `${clientConfiguration.url}/${endpoint}?${parameters}`;

	const headers = await getHeaders(clientConfiguration, body != null);

	const requestData: RequestInit = {
		body: body != null ? JSON.stringify(body) : null,
		headers: headers,
		method: method,
	};

	const response = await fetch(url, requestData);
	const responseBody = await response.text();
	if (!response.ok) {
		const parsedError = APIErrorSchema.safeParse(responseBody);
		if (!parsedError.success) {
			return new UnexpectedError(responseBody);
		}

		if ("errors" in parsedError.data) {
			return new InvalidDataError(parsedError.data);
		}

		return new GeneralError(parsedError.data);
	}

	const isJSON = response.headers.get("content-type")?.includes("application/json") ?? false;

	return (isJSON ? JSON.parse(responseBody) : responseBody) as Response;
};

async function* paginatedRequest<Item>(
	clientConfiguration: FakturoidClientConfig,
	endpoint: string,
	queryParameters?: Record<string, string>,
	page?: number,
): AsyncGenerator<Item[], undefined | InvalidDataError | GeneralError | UnexpectedError, undefined> {
	let currentPage = page ?? 0;

	while (true) {
		// biome-ignore lint/nursery/noAwaitInLoop: Usage in generator
		const response = await request<Item[]>(clientConfiguration, endpoint, "GET", undefined, {
			...queryParameters,
			page: String(currentPage),
		});

		if (response instanceof Error) {
			return response;
		}

		if (response.length < PAGE_SIZE) {
			return;
		}

		yield response;

		currentPage += 1;
	}
}

const requestAllPages = async <Item>(
	clientConfiguration: FakturoidClientConfig,
	endpoint: string,
	pageCount?: number,
): Promise<Item[] | InvalidDataError | GeneralError | UnexpectedError> => {
	const items: Item[] = [];
	let currentPage = 0;

	for await (const itemsPage of paginatedRequest<Item>(clientConfiguration, endpoint)) {
		if (itemsPage instanceof Error) {
			return itemsPage;
		}

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
