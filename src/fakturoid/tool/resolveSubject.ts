import type { FakturoidClient } from "../client.js";
import type { Subject } from "../model/subject.js";

type SubjectResolution =
	| { status: "found"; data: Subject }
	| { status: "created"; data: Subject };

const resolveSubject = async (
	client: FakturoidClient<any, any>,
	registrationNo: string,
	type: "customer" | "supplier",
): Promise<SubjectResolution | Error> => {
	const searchResult = await client.searchSubjects(registrationNo);
	if (searchResult instanceof Error) {
		return new Error(`Subject search failed: ${searchResult.message}`);
	}

	const match = searchResult.find(
		(subject) => subject.registration_no === registrationNo,
	);

	if (match != null) {
		return { status: "found", data: match };
	}

	const created = await client.createSubject({
		name: registrationNo,
		registration_no: registrationNo,
		type,
	});

	if (created instanceof Error) {
		return new Error(`Subject creation failed: ${created.message}`);
	}

	return { status: "created", data: created };
};

export { resolveSubject };
export type { SubjectResolution };
