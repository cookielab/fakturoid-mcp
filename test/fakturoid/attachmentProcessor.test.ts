import { readFile } from "node:fs/promises";
import { afterEach, beforeEach, describe, expect, type Mock, test, vi } from "vitest";
import { processAttachment } from "../../src/fakturoid/attachmentProcessor";
import { FakturoidClient } from "../../src/fakturoid/client";
import type { ServerContext } from "../../src/server";
import { createInboxFile } from "../factory/inboxFile.factory";
import { createUser } from "../factory/user.factory";
import { createResponse, mockFetch } from "../testUtils/mock";
import { TestStrategy } from "../testUtils/strategy";

describe("Attachment Processor", () => {
	let mockedFetch: Mock<typeof global.fetch>;
	let client: FakturoidClient<object, TestStrategy>;
	let stdioContext: ServerContext;
	let cloudflareContext: ServerContext;

	beforeEach(async () => {
		mockedFetch = mockFetch();
		const strategy = new TestStrategy();

		// Mock the user fetch that happens during client creation
		mockedFetch.mockResolvedValueOnce(createResponse(createUser("test-user")));
		client = await FakturoidClient.create(strategy);

		stdioContext = {
			transport: "stdio",
			capabilities: { fileSystemAccess: true },
			uploadConfig: {
				allowUrlDownloads: true,
				maxDownloadSizeMB: 10,
				downloadTimeoutMs: 30_000,
			},
		};

		cloudflareContext = {
			transport: "cloudflare",
			capabilities: { fileSystemAccess: false },
			uploadConfig: {
				allowUrlDownloads: true,
				maxDownloadSizeMB: 10,
				downloadTimeoutMs: 30_000,
			},
		};
	});

	afterEach(() => {
		mockedFetch.mockReset();
		vi.restoreAllMocks();
	});

	describe("Strategy 1: data_url", () => {
		test("passes through data_url unchanged", async () => {
			const input = {
				data_url: "data:application/pdf;base64,JVBERi0xLjQK",
				filename: "test.pdf",
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result).toEqual({
				data_url: "data:application/pdf;base64,JVBERi0xLjQK",
				filename: "test.pdf",
			});
		});

		test("works without filename", async () => {
			const input = {
				data_url: "data:image/png;base64,iVBORw0KGgo=",
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result).toEqual({
				data_url: "data:image/png;base64,iVBORw0KGgo=",
				filename: undefined,
			});
		});
	});

	describe("Strategy 2: file_path", () => {
		test("reads PDF fixture file and converts to data_url", async () => {
			const input = {
				file_path: `${process.cwd()}/test/fixtures/test-document.pdf`,
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result.data_url).toMatch(/^data:application\/pdf;base64,/);
			expect(result.filename).toBe("test-document.pdf");

			// Verify the base64 content can be decoded
			const base64Content = result.data_url.split(",")[1];
			const decoded = Buffer.from(base64Content, "base64").toString();
			expect(decoded).toContain("%PDF-1.4");
			expect(decoded).toContain("Test Document");
		});

		test("reads JPG fixture file and converts to data_url", async () => {
			const input = {
				file_path: `${process.cwd()}/test/fixtures/test-image.jpg`,
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result.data_url).toMatch(/^data:image\/jpeg;base64,/);
			expect(result.filename).toBe("test-image.jpg");

			// Verify the base64 content starts with JPEG signature
			const base64Content = result.data_url.split(",")[1];
			const decoded = Buffer.from(base64Content, "base64");
			// JPEG files start with FF D8 FF
			expect(decoded[0]).toBe(0xff);
			expect(decoded[1]).toBe(0xd8);
			expect(decoded[2]).toBe(0xff);
		});

		test("uses custom filename when provided", async () => {
			const input = {
				file_path: `${process.cwd()}/test/fixtures/test-document.pdf`,
				filename: "my-custom-invoice.pdf",
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result.filename).toBe("my-custom-invoice.pdf");
			expect(result.data_url).toMatch(/^data:application\/pdf;base64,/);
		});

		test("throws error when file_path used in non-stdio transport", async () => {
			const input = {
				file_path: "/tmp/test.pdf",
			};

			await expect(processAttachment(input, cloudflareContext, client)).rejects.toThrow(
				/file_path strategy is only available in stdio transport mode/,
			);
		});
	});

	describe("Strategy 3: inbox_file_id", () => {
		test("downloads from inbox and converts to data_url", async () => {
			const inboxFile = createInboxFile("test-inbox", {
				id: 123,
				filename: "invoice.pdf",
			});

			const pdfContent = "PDF content here";
			const mockBlob = new Blob([pdfContent], { type: "application/pdf" });

			mockedFetch.mockResolvedValueOnce(createResponse([inboxFile]));
			mockedFetch.mockResolvedValueOnce({
				ok: true,
				blob: () => Promise.resolve(mockBlob),
				headers: new Headers({ "content-type": "application/pdf" }),
			} as Response);

			const input = {
				inbox_file_id: 123,
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result.data_url).toMatch(/^data:application\/pdf;base64,/);
			expect(result.filename).toBe("invoice.pdf");
		});

		test("throws error when inbox file not found", async () => {
			mockedFetch.mockResolvedValueOnce(createResponse([]));

			const input = {
				inbox_file_id: 999,
			};

			await expect(processAttachment(input, stdioContext, client)).rejects.toThrow(
				/Inbox file with ID 999 not found/,
			);
		});
	});

	describe("Strategy 4: url", () => {
		test("downloads from public URL and converts to data_url", async () => {
			mockedFetch.mockResolvedValueOnce({
				ok: true,
				headers: new Headers({
					"content-type": "application/pdf",
					"content-length": "1024",
				}),
				body: {
					getReader: () => ({
						read: vi
							.fn()
							.mockResolvedValueOnce({
								done: false,
								value: new Uint8Array([0x25, 0x50, 0x44, 0x46]),
							})
							.mockResolvedValueOnce({ done: true }),
						cancel: vi.fn(),
					}),
				},
			} as unknown as Response);

			const input = {
				url: "https://example.com/document.pdf",
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result.data_url).toMatch(/^data:application\/pdf;base64,/);
			expect(result.filename).toBe("document.pdf");
		});

		test("uses custom filename if provided", async () => {
			mockedFetch.mockResolvedValueOnce({
				ok: true,
				headers: new Headers({
					"content-type": "image/jpeg",
				}),
				body: {
					getReader: () => ({
						read: vi
							.fn()
							.mockResolvedValueOnce({ done: false, value: new Uint8Array([0xff, 0xd8]) })
							.mockResolvedValueOnce({ done: true }),
						cancel: vi.fn(),
					}),
				},
			} as unknown as Response);

			const input = {
				url: "https://example.com/image.jpg",
				filename: "my-photo.jpg",
			};

			const result = await processAttachment(input, stdioContext, client);

			expect(result.filename).toBe("my-photo.jpg");
		});

		test("throws error when URL downloads disabled", async () => {
			const restrictedContext = {
				...stdioContext,
				uploadConfig: {
					...stdioContext.uploadConfig,
					allowUrlDownloads: false,
				},
			};

			const input = {
				url: "https://example.com/document.pdf",
			};

			await expect(processAttachment(input, restrictedContext, client)).rejects.toThrow(
				/URL-based attachment downloads are disabled/,
			);
		});

		test("rejects private network URLs (SSRF protection)", async () => {
			const privateUrls = [
				"http://localhost/file.pdf",
				"http://127.0.0.1/file.pdf",
				"http://192.168.1.1/file.pdf",
				"http://10.0.0.1/file.pdf",
				"http://172.16.0.1/file.pdf",
			];

			for (const url of privateUrls) {
				const input = { url };
				await expect(processAttachment(input, stdioContext, client)).rejects.toThrow(
					/blocked for security reasons/,
				);
			}
		});

		test("rejects non-http protocols", async () => {
			const input = {
				url: "file:///etc/passwd",
			};

			await expect(processAttachment(input, stdioContext, client)).rejects.toThrow(
				/Protocol file: not allowed/,
			);
		});

		test("rejects files exceeding size limit", async () => {
			mockedFetch.mockResolvedValueOnce({
				ok: true,
				headers: new Headers({
					"content-length": "20971520", // 20MB, exceeds 10MB limit
				}),
			} as Response);

			const input = {
				url: "https://example.com/large-file.pdf",
			};

			await expect(processAttachment(input, stdioContext, client)).rejects.toThrow(
				/File too large/,
			);
		});

		test("handles streaming size limit during download", async () => {
			const largeChunk = new Uint8Array(11 * 1024 * 1024); // 11MB

			mockedFetch.mockResolvedValueOnce({
				ok: true,
				headers: new Headers({
					"content-type": "application/pdf",
				}),
				body: {
					getReader: () => ({
						read: vi
							.fn()
							.mockResolvedValueOnce({ done: false, value: largeChunk })
							.mockResolvedValueOnce({ done: true }),
						cancel: vi.fn(),
					}),
				},
			} as unknown as Response);

			const input = {
				url: "https://example.com/large.pdf",
			};

			await expect(processAttachment(input, stdioContext, client)).rejects.toThrow(
				/File exceeds maximum size/,
			);
		});
	});

	describe("Invalid input", () => {
		test("throws error for invalid attachment input", async () => {
			const input = {} as never;

			await expect(processAttachment(input, stdioContext, client)).rejects.toThrow(
				/Invalid attachment input/,
			);
		});
	});
});
