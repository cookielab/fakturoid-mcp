import type { FakturoidResource } from "./common.ts";

const URI = "fakturoid://expenses/open";

const expensesOpenResourceImplementation: FakturoidResource["implementation"] = async (client) => {
	const openExpenses = await client.getExpenses({ status: "open" });
	if (openExpenses instanceof Error) {
		throw openExpenses;
	}

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(openExpenses, null, 2), uri: URI }],
	};
};

const expensesOpenResource: FakturoidResource = {
	description: "All unpaid expenses requiring attention",
	implementation: expensesOpenResourceImplementation,
	mimeType: "application/json",
	name: "Open Expenses",
	uri: URI,
};

export { expensesOpenResource };
