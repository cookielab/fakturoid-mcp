import type { FakturoidResource } from "./common.ts";

const URI = "fakturoid://subjects/recent";

const subjectsRecentResourceImplementation: FakturoidResource["implementation"] = async (client, accountSlug) => {
	const recentSubjects = await client.getSubjects(accountSlug, { page_count: 1 });
	if (recentSubjects instanceof Error) {
		throw recentSubjects;
	}

	return {
		contents: [{ mimeType: "application/json", text: JSON.stringify(recentSubjects, null, 2), uri: URI }],
	};
};

const subjectsRecentResource: FakturoidResource = {
	description: "Recently added or updated contacts and companies",
	implementation: subjectsRecentResourceImplementation,
	mimeType: "application/json",
	name: "Recent Subjects",
	uri: URI,
};

export { subjectsRecentResource };
