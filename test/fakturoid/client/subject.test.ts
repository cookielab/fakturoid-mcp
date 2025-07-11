import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createSubject,
	deleteSubject,
	getSubjectDetail,
	getSubjects,
	searchSubjects,
	updateSubject,
} from "../../../src/fakturoid/client/subject";
import { createSubject as createSubjectFactory } from "../../factory/subject.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Subject", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Subjects", async () => {
		const subjects = [createSubjectFactory("subject-1"), createSubjectFactory("subject-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(subjects));

		const result = await getSubjects(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(subjects)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/subjects.json?page=0", {
			body: null,
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "GET",
		});
	});

	test("Get Subjects With Filters", async () => {
		const subjects = [createSubjectFactory("subject-filtered")];
		const strategy = new TestStrategy();
		const filters = { since: "2023-01-01", updated_since: "2023-01-01" };

		mockedFetch.mockResolvedValue(createResponse(subjects));

		const result = await getSubjects(strategy, "test", filters);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(subjects)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/subjects.json?since=2023-01-01&updated_since=2023-01-01&page=0",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "GET",
			},
		);
	});

	test("Search Subjects", async () => {
		const subjects = [createSubjectFactory("subject-search")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(subjects));

		const result = await searchSubjects(strategy, "test", "search query");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(subjects)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			// biome-ignore lint/nursery/noSecrets: Not a secret
			"https://test.example/accounts/test/subjects/search.json?query=search+query&page=0",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "GET",
			},
		);
	});

	test("Get Subject Detail", async () => {
		const subject = createSubjectFactory("subject-detail");
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(subject));

		const result = await getSubjectDetail(strategy, "test", 123);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(subject)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/subjects/123.json", {
			body: null,
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "GET",
		});
	});

	test("Create Subject", async () => {
		const subject = createSubjectFactory("subject-new");
		const strategy = new TestStrategy();
		const subjectData = {
			name: "Test Subject",
			email: "test@example.com",
		};

		mockedFetch.mockResolvedValue(createResponse(subject));

		const result = await createSubject(strategy, "test", subjectData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(subject)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/subjects.json", {
			body: JSON.stringify(subjectData),
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "POST",
		});
	});

	test("Update Subject", async () => {
		const subject = createSubjectFactory("subject-updated");
		const strategy = new TestStrategy();
		const updateData = {
			name: "Updated Subject",
		};

		mockedFetch.mockResolvedValue(createResponse(subject));

		const result = await updateSubject(strategy, "test", 123, updateData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(subject)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/subjects/123.json", {
			body: JSON.stringify(updateData),
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "PATCH",
		});
	});

	test("Delete Subject", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteSubject(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/subjects/123.json", {
			body: null,
			headers: Object.fromEntries(
				new Headers({
					Authorization: `Bearer ${await strategy.getAccessToken()}`,
					"Content-Type": "application/json",
					"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
				}).entries(),
			),
			method: "DELETE",
		});
	});
});
