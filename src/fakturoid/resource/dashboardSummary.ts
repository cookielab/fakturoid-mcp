import type { FakturoidResource } from "./common.js";

const URI = "fakturoid://dashboard/summary";

const dashboardSummaryResourceImplementation: FakturoidResource["implementation"] = async (client) => {
	// Create a summary by fetching key data
	const [summaryAccount, summaryInvoices, summaryExpenses] = await Promise.all([
		client.getAccountDetail(),
		client.getInvoices(),
		client.getExpenses(),
	]);

	if (summaryAccount instanceof Error) {
		throw summaryAccount;
	}

	if (summaryInvoices instanceof Error) {
		throw summaryInvoices;
	}

	if (summaryExpenses instanceof Error) {
		throw summaryExpenses;
	}

	const summary = {
		account: summaryAccount,
		generated_at: new Date().toISOString(),
		recent_expenses: summaryExpenses.slice(0, 5),
		recent_invoices: summaryInvoices.slice(0, 5),
	};

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(summary, null, 2), uri: URI }],
	};
};

const dashboardSummaryResource: FakturoidResource = {
	description: "Summary of key accounting metrics and recent activity",
	implementation: dashboardSummaryResourceImplementation,
	mimeType: "application/json",
	name: "Dashboard Summary",
	uri: URI,
};

export { dashboardSummaryResource };
