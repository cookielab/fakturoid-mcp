import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./resolveSubject.js", () => ({
	resolveSubject: vi.fn(),
}));

import type { Subject } from "../model/subject.js";
import { resolveSubject } from "./resolveSubject.js";
import { executeSmartCreateInvoice } from "./smartInvoice.js";

const mockClient = {
	getInvoices: vi.fn(),
	createInvoice: vi.fn(),
};

const mockResolveSubject = vi.mocked(resolveSubject);

describe("executeSmartCreateInvoice", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});
	it("creates invoice when subject exists and no duplicate", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" } as Subject;
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject });
		mockClient.getInvoices.mockResolvedValue([]);
		const createdInvoice = { id: 1, number: "2026-001", subject_id: 42 };
		mockClient.createInvoice.mockResolvedValue(createdInvoice);

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
			number: "2026-001",
			lines: [{ name: "Service", unit_price: "1000", quantity: "1", vat_rate: 21 }],
		});

		expect(result).toEqual({
			status: "created",
			subject: { status: "found", data: subject },
			document: { data: createdInvoice },
		});
		expect(mockClient.createInvoice).toHaveBeenCalledWith({
			subject_id: 42,
			number: "2026-001",
			lines: [{ name: "Service", unit_price: "1000", quantity: "1", vat_rate: 21 }],
		});
	});

	it("creates subject and invoice when subject not found", async () => {
		const subject = { id: 99, name: "New Co", registration_no: "87654321" } as Subject;
		mockResolveSubject.mockResolvedValue({ status: "created", data: subject });
		mockClient.getInvoices.mockResolvedValue([]);
		const createdInvoice = { id: 2, number: "2026-002", subject_id: 99 };
		mockClient.createInvoice.mockResolvedValue(createdInvoice);

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "87654321",
			number: "2026-002",
		});

		expect(result).not.toBeInstanceOf(Error);
		if (result instanceof Error) {
			throw result;
		}
		expect(result.status).toBe("created");
		expect(result.subject.status).toBe("created");
	});

	it("returns duplicate when invoice number already exists for subject", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" } as Subject;
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject });
		const existingInvoice = { id: 5, number: "2026-001", subject_id: 42 };
		mockClient.getInvoices.mockResolvedValue([existingInvoice]);

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
			number: "2026-001",
		});

		expect(result).toEqual({
			status: "duplicate_found",
			subject: { status: "found", data: subject },
			document: {
				data: existingInvoice,
				message:
					"Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is.",
			},
		});
		expect(mockClient.createInvoice).not.toHaveBeenCalled();
	});

	it("skips duplicate check when number is not provided", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" } as Subject;
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject });
		const createdInvoice = { id: 3, subject_id: 42 };
		mockClient.createInvoice.mockResolvedValue(createdInvoice);

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
		});

		expect(result).not.toBeInstanceOf(Error);
		if (result instanceof Error) {
			throw result;
		}
		expect(result.status).toBe("created");
		expect(mockClient.getInvoices).not.toHaveBeenCalled();
	});

	it("returns error when subject resolution fails", async () => {
		mockResolveSubject.mockResolvedValue(new Error("API error"));

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
		});

		expect(result).toBeInstanceOf(Error);
	});

	it("returns error when invoice creation fails", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" } as Subject;
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject });
		mockClient.getInvoices.mockResolvedValue([]);
		mockClient.createInvoice.mockResolvedValue(new Error("Validation error"));

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
			number: "2026-001",
		});

		expect(result).toBeInstanceOf(Error);
	});
});
