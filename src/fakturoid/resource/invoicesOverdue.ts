import type { FakturoidResource } from "./common.ts";

const URI = "fakturoid://invoices/overdue";

const invoicesOverdueResourceImplementation: FakturoidResource["implementation"] = async (client, accountSlug) => {
	const overdueInvoices = await client.getInvoices(accountSlug, { status: "overdue" });
	if (overdueInvoices instanceof Error) {
		throw overdueInvoices;
	}

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(overdueInvoices, null, 2), uri: URI }],
	};
};

const invoicesOverdueResource: FakturoidResource = {
	description: "Invoices that are past their due date",
	implementation: invoicesOverdueResourceImplementation,
	mimeType: "application/json",
	name: "Overdue Invoices",
	uri: URI,
};

export { invoicesOverdueResource };
