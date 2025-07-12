import type { FakturoidResource } from "./common.js";

const URI = "fakturoid://invoices/recent";

const invoicesRecentResourceImplementation: FakturoidResource["implementation"] = async (client) => {
	const recentInvoices = await client.getInvoices({ page_count: 1 });
	if (recentInvoices instanceof Error) {
		throw recentInvoices;
	}

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(recentInvoices, null, 2), uri: URI }],
	};
};

const invoicesRecentResource: FakturoidResource = {
	description: "Latest 20 invoices from your Fakturoid account",
	implementation: invoicesRecentResourceImplementation,
	mimeType: "application/json",
	name: "Recent Invoices",
	uri: "fakturoid://invoices/recent",
};

export { invoicesRecentResource };
