import { afterEach, beforeEach, describe, expect, type Mock, test } from "vitest";
import {
	createInboxFile,
	deleteInboxFile,
	downloadInboxFile,
	getInboxFiles,
	sendInboxFileToOcr,
} from "../../../src/fakturoid/client/inboxFile";
import { createInboxFile as createInboxFileFactory } from "../../factory/inboxFile.factory";
import { createResponse, mockFetch } from "../../testUtils/mock";
import { TestStrategy } from "../../testUtils/strategy";

describe("Inbox File", () => {
	let mockedFetch: Mock<typeof global.fetch>;

	beforeEach(() => {
		mockedFetch = mockFetch();
	});

	afterEach(() => {
		mockedFetch.mockReset();
	});

	test("Get Inbox Files", async () => {
		const inboxFiles = [createInboxFileFactory("inbox-file-1"), createInboxFileFactory("inbox-file-2")];
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(inboxFiles));

		const result = await getInboxFiles(strategy, "test");

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inboxFiles)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inbox_files.json?page=0", {
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

	test("Create Inbox File", async () => {
		const inboxFile = createInboxFileFactory("inbox-file-new");
		const strategy = new TestStrategy();
		const inboxFileData = {
			filename: "test.pdf",
			content_type: "application/pdf",
			attachment: "base64encodedcontent",
		};

		mockedFetch.mockResolvedValue(createResponse(inboxFile));

		const result = await createInboxFile(strategy, "test", inboxFileData);

		// Stringify to parse just to have the same behavior for keys with undefined
		expect(result).toStrictEqual(JSON.parse(JSON.stringify(inboxFile)));
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inbox_files.json", {
			body: JSON.stringify(inboxFileData),
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

	test("Send Inbox File To OCR", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await sendInboxFileToOcr(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith(
			"https://test.example/accounts/test/inbox_files/123/send_to_ocr.json",
			{
				body: null,
				headers: Object.fromEntries(
					new Headers({
						Authorization: `Bearer ${await strategy.getAccessToken()}`,
						"Content-Type": "application/json",
						"User-Agent": `${strategy.appName} (${await strategy.getContactEmail()})`,
					}).entries(),
				),
				method: "POST",
			},
		);
	});

	test("Download Inbox File", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse("test content", "application/pdf"));

		const result = await downloadInboxFile(strategy, "test", 123);

		expect(result).toStrictEqual("test content");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inbox_files/123/download", {
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

	test("Delete Inbox File", async () => {
		const strategy = new TestStrategy();

		mockedFetch.mockResolvedValue(createResponse(""));

		const result = await deleteInboxFile(strategy, "test", 123);

		expect(result).toBe("");
		expect(mockedFetch).toHaveBeenCalledExactlyOnceWith("https://test.example/accounts/test/inbox_files/123.json", {
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
