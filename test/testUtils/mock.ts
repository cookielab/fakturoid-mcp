import { type Mock, vi } from "vitest";

const mockFetch = (): Mock<typeof global.fetch> => {
	global.fetch = vi.fn();

	return global.fetch as Mock<typeof global.fetch>;
};

const createResponse = <Data>(data: Data, type: BlobPropertyBag["type"] = "application/json"): Response => {
	return {
		blob: () => Promise.resolve(new Blob([JSON.stringify(data)], { type: type })),
		text: () => Promise.resolve(JSON.stringify(data)),
		json: () => Promise.resolve(data),
		ok: true,
		headers: new Headers({
			"Content-Type": "application/json",
		}),
	} as Response;
};

export { mockFetch, createResponse };
