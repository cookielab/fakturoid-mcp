import type { FakturoidResource } from "./common.ts";

const URI = "fakturoid://subjects/customers";

const subjectsCustomersResourceImplementation: FakturoidResource["implementation"] = async (client, accountSlug) => {
	const subjects = await client.getSubjects(accountSlug);
	if (subjects instanceof Error) {
		throw subjects;
	}

	const customers = subjects.filter(({ type }) => type === "customer");

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(customers, null, 2), uri: URI }],
	};
};

const subjectsCustomersResource: FakturoidResource = {
	description: "All customer contacts in your Fakturoid account",
	implementation: subjectsCustomersResourceImplementation,
	mimeType: "application/json",
	name: "Customer Subjects",
	uri: URI,
};

export { subjectsCustomersResource };
