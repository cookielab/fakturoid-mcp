import type { FakturoidResource } from "./common.js";

const URI = "fakturoid://invoices/open";

const invoicesOpenResourceImplementation: FakturoidResource["implementation"] = async (client) => {
	const openInvoices = await client.getInvoices({ status: "open" });
	if (openInvoices instanceof Error) {
		throw openInvoices;
	}

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(openInvoices, null, 2), uri: URI }],
	};
};

const invoicesOpenResource: FakturoidResource = {
	description: "All unpaid invoices requiring attention",
	implementation: invoicesOpenResourceImplementation,
	mimeType: "application/json",
	name: "Open Invoices",
	uri: "fakturoid://invoices/open",
};

export { invoicesOpenResource };
