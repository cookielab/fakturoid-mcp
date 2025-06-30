import type { FakturoidResource } from "./common.ts";

const URI = "fakturoid://subjects/suppliers";

const subjectsSuppliersResourceImplementation: FakturoidResource["implementation"] = async (client) => {
	const subjects = await client.getSubjects();
	if (subjects instanceof Error) {
		throw subjects;
	}

	const customers = subjects.filter(({ type }) => type === "supplier");

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(customers, null, 2), uri: URI }],
	};
};

const subjectsSuppliersResource: FakturoidResource = {
	description: "All supplier contacts in your Fakturoid account",
	implementation: subjectsSuppliersResourceImplementation,
	mimeType: "application/json",
	name: "Supplier Subjects",
	uri: URI,
};

export { subjectsSuppliersResource };
