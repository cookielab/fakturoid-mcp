import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./resolveSubject.js", () => ({
	resolveSubject: vi.fn(),
}));

import { resolveSubject } from "./resolveSubject.js";
import { executeSmartCreateExpense } from "./smartExpense.js";

const mockClient = {
	getExpenses: vi.fn(),
	createExpense: vi.fn(),
};

const mockResolveSubject = vi.mocked(resolveSubject);

describe("executeSmartCreateExpense", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("creates expense when subject exists and no duplicate", async () => {
		const subject = { id: 42, name: "Supplier Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		mockClient.getExpenses.mockResolvedValue([]);
		const createdExpense = { id: 1, original_number: "FV-2026-001", subject_id: 42 };
		mockClient.createExpense.mockResolvedValue(createdExpense);

		const result = await executeSmartCreateExpense(mockClient as any, {
			registration_no: "12345678",
			original_number: "FV-2026-001",
			lines: [{ name: "Material", unit_price: "500", quantity: "1", vat_rate: 21 }],
		});

		expect(result).toEqual({
			status: "created",
			subject: { status: "found", data: subject },
			document: { data: createdExpense },
		});
		expect(mockClient.createExpense).toHaveBeenCalledWith({
			subject_id: 42,
			original_number: "FV-2026-001",
			lines: [{ name: "Material", unit_price: "500", quantity: "1", vat_rate: 21 }],
		});
	});

	it("creates subject and expense when subject not found", async () => {
		const subject = { id: 99, name: "New Supplier", registration_no: "87654321" };
		mockResolveSubject.mockResolvedValue({ status: "created", data: subject as any });
		mockClient.getExpenses.mockResolvedValue([]);
		const createdExpense = { id: 2, original_number: "FV-2026-002", subject_id: 99 };
		mockClient.createExpense.mockResolvedValue(createdExpense);

		const result = await executeSmartCreateExpense(mockClient as any, {
			registration_no: "87654321",
			original_number: "FV-2026-002",
		});

		expect((result as any).status).toBe("created");
		expect((result as any).subject.status).toBe("created");
	});

	it("returns duplicate when original_number already exists for subject", async () => {
		const subject = { id: 42, name: "Supplier Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		const existingExpense = { id: 5, original_number: "FV-2026-001", subject_id: 42 };
		const otherExpense = { id: 6, original_number: "FV-2026-999", subject_id: 42 };
		mockClient.getExpenses.mockResolvedValue([otherExpense, existingExpense]);

		const result = await executeSmartCreateExpense(mockClient as any, {
			registration_no: "12345678",
			original_number: "FV-2026-001",
		});

		expect(result).toEqual({
			status: "duplicate_found",
			subject: { status: "found", data: subject },
			document: {
				data: existingExpense,
				message: "Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is.",
			},
		});
		expect(mockClient.createExpense).not.toHaveBeenCalled();
	});

	it("skips duplicate check when original_number is not provided", async () => {
		const subject = { id: 42, name: "Supplier Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		const createdExpense = { id: 3, subject_id: 42 };
		mockClient.createExpense.mockResolvedValue(createdExpense);

		const result = await executeSmartCreateExpense(mockClient as any, {
			registration_no: "12345678",
		});

		expect((result as any).status).toBe("created");
		expect(mockClient.getExpenses).not.toHaveBeenCalled();
	});

	it("resolves subject as supplier type", async () => {
		const subject = { id: 42, name: "Supplier Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		mockClient.getExpenses.mockResolvedValue([]);
		mockClient.createExpense.mockResolvedValue({ id: 1, subject_id: 42 });

		await executeSmartCreateExpense(mockClient as any, {
			registration_no: "12345678",
		});

		expect(mockResolveSubject).toHaveBeenCalledWith(mockClient, "12345678", "supplier");
	});

	it("returns error when subject resolution fails", async () => {
		mockResolveSubject.mockResolvedValue(new Error("API error"));

		const result = await executeSmartCreateExpense(mockClient as any, {
			registration_no: "12345678",
		});

		expect(result).toBeInstanceOf(Error);
	});

	it("returns error when expense creation fails", async () => {
		const subject = { id: 42, name: "Supplier Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		mockClient.getExpenses.mockResolvedValue([]);
		mockClient.createExpense.mockResolvedValue(new Error("Validation error"));

		const result = await executeSmartCreateExpense(mockClient as any, {
			registration_no: "12345678",
			original_number: "FV-2026-001",
		});

		expect(result).toBeInstanceOf(Error);
	});
});
