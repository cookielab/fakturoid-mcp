import type { FakturoidResource } from "./common.ts";

const URI = "fakturoid://expenses/recent";

const expensesRecentResourceImplementation: FakturoidResource["implementation"] = async (client) => {
	const recentExpenses = await client.getExpenses({ page_count: 1 });
	if (recentExpenses instanceof Error) {
		throw recentExpenses;
	}

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(recentExpenses, null, 2), uri: URI }],
	};
};

const expensesRecentResource: FakturoidResource = {
	description: "Latest 20 expenses from your Fakturoid account",
	implementation: expensesRecentResourceImplementation,
	mimeType: "application/json",
	name: "Recent Expenses",
	uri: URI,
};

export { expensesRecentResource };
