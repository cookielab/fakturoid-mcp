import { describe, expect, it, vi } from "vitest";
import { resolveSubject } from "./resolveSubject.js";

const mockClient = {
	searchSubjects: vi.fn(),
	createSubject: vi.fn(),
};

describe("resolveSubject", () => {
	it("returns existing subject when IČO matches", async () => {
		const existingSubject = { id: 42, name: "Test Company", registration_no: "12345678" };
		mockClient.searchSubjects.mockResolvedValue([existingSubject]);

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toEqual({ status: "found", data: existingSubject });
		expect(mockClient.searchSubjects).toHaveBeenCalledWith("12345678");
		expect(mockClient.createSubject).not.toHaveBeenCalled();
	});

	it("creates subject when no IČO match found", async () => {
		mockClient.searchSubjects.mockResolvedValue([]);
		const createdSubject = { id: 99, name: "New Co", registration_no: "87654321" };
		mockClient.createSubject.mockResolvedValue(createdSubject);

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await resolveSubject(mockClient as any, "87654321", "customer");

		expect(result).toEqual({ status: "created", data: createdSubject });
		expect(mockClient.createSubject).toHaveBeenCalledWith({
			name: "87654321",
			registration_no: "87654321",
			type: "customer",
		});
	});

	it("creates subject when search returns subjects with different IČO", async () => {
		const otherSubject = { id: 10, name: "Other Co", registration_no: "99999999" };
		mockClient.searchSubjects.mockResolvedValue([otherSubject]);
		const createdSubject = { id: 99, name: "New Co", registration_no: "12345678" };
		mockClient.createSubject.mockResolvedValue(createdSubject);

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toEqual({ status: "created", data: createdSubject });
	});

	it("uses 'supplier' type for expenses", async () => {
		mockClient.searchSubjects.mockResolvedValue([]);
		mockClient.createSubject.mockResolvedValue({ id: 1, name: "Supplier", registration_no: "11111111" });

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		await resolveSubject(mockClient as any, "11111111", "supplier");

		expect(mockClient.createSubject).toHaveBeenCalledWith({
			name: "11111111",
			registration_no: "11111111",
			type: "supplier",
		});
	});

	it("returns error when searchSubjects fails", async () => {
		mockClient.searchSubjects.mockResolvedValue(new Error("API error"));

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toBeInstanceOf(Error);
	});

	it("returns error when createSubject fails", async () => {
		mockClient.searchSubjects.mockResolvedValue([]);
		mockClient.createSubject.mockResolvedValue(new Error("Validation error"));

		// biome-ignore lint/suspicious/noExplicitAny: mock client doesn't implement full FakturoidClient interface
		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toBeInstanceOf(Error);
	});
});
