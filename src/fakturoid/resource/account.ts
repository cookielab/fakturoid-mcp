import type { FakturoidResource } from "./common.js";

const URI = "fakturoid://account";

const accountResourceImplementation: FakturoidResource["implementation"] = async (client) => {
	const account = await client.getCurrentUser();
	if (account instanceof Error) {
		throw account;
	}

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(account, null, 2), uri: URI }],
	};
};

const accountResource: FakturoidResource = {
	description: "Current Fakturoid account details and settings",
	implementation: accountResourceImplementation,
	mimeType: "application/json",
	name: "Account Information",
	uri: URI,
};

export { accountResource };
