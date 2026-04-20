# Smart Create Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two compound MCP tools (`fakturoid_smart_create_invoice`, `fakturoid_smart_create_expense`) that resolve subjects by IČO, detect duplicate documents, and create documents — all in a single tool call.

**Architecture:** Each tool is a standalone orchestration function that composes existing client methods (`searchSubjects`, `createSubject`, `getInvoices`/`getExpenses`, `createInvoice`/`createExpense`). Both tools share a common subject resolution helper extracted into a shared module. The tools follow the existing `createTool` factory pattern and register alongside existing tools.

**Tech Stack:** TypeScript, Zod v3, MCP SDK, Vitest

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/fakturoid/tool/resolveSubject.ts` | Create | Shared helper: search subject by IČO, create if not found |
| `src/fakturoid/tool/smartInvoice.ts` | Create | `fakturoid_smart_create_invoice` tool |
| `src/fakturoid/tool/smartExpense.ts` | Create | `fakturoid_smart_create_expense` tool |
| `src/fakturoid/tools.ts` | Modify | Register the two new tool arrays |
| `src/fakturoid/tool/resolveSubject.test.ts` | Create | Tests for subject resolution logic |
| `src/fakturoid/tool/smartInvoice.test.ts` | Create | Tests for smart invoice tool orchestration |
| `src/fakturoid/tool/smartExpense.test.ts` | Create | Tests for smart expense tool orchestration |

---

### Task 1: Subject Resolution Helper

**Files:**
- Create: `src/fakturoid/tool/resolveSubject.ts`
- Test: `src/fakturoid/tool/resolveSubject.test.ts`

This helper searches for a subject by IČO using `searchSubjects`, filters results for an exact `registration_no` match, and creates the subject via ARES if not found.

- [ ] **Step 1: Write failing tests for `resolveSubject`**

Create `src/fakturoid/tool/resolveSubject.test.ts`:

```typescript
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

		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toEqual({ status: "found", data: existingSubject });
		expect(mockClient.searchSubjects).toHaveBeenCalledWith("12345678");
		expect(mockClient.createSubject).not.toHaveBeenCalled();
	});

	it("creates subject when no IČO match found", async () => {
		mockClient.searchSubjects.mockResolvedValue([]);
		const createdSubject = { id: 99, name: "New Co", registration_no: "87654321" };
		mockClient.createSubject.mockResolvedValue(createdSubject);

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

		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toEqual({ status: "created", data: createdSubject });
	});

	it("uses 'supplier' type for expenses", async () => {
		mockClient.searchSubjects.mockResolvedValue([]);
		mockClient.createSubject.mockResolvedValue({ id: 1, name: "Supplier", registration_no: "11111111" });

		await resolveSubject(mockClient as any, "11111111", "supplier");

		expect(mockClient.createSubject).toHaveBeenCalledWith({
			name: "11111111",
			registration_no: "11111111",
			type: "supplier",
		});
	});

	it("returns error when searchSubjects fails", async () => {
		mockClient.searchSubjects.mockResolvedValue(new Error("API error"));

		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toBeInstanceOf(Error);
	});

	it("returns error when createSubject fails", async () => {
		mockClient.searchSubjects.mockResolvedValue([]);
		mockClient.createSubject.mockResolvedValue(new Error("Validation error"));

		const result = await resolveSubject(mockClient as any, "12345678", "customer");

		expect(result).toBeInstanceOf(Error);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/fakturoid/tool/resolveSubject.test.ts`
Expected: FAIL — module `./resolveSubject.js` not found

- [ ] **Step 3: Implement `resolveSubject`**

Create `src/fakturoid/tool/resolveSubject.ts`:

```typescript
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/fakturoid/tool/resolveSubject.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/fakturoid/tool/resolveSubject.ts src/fakturoid/tool/resolveSubject.test.ts
git commit -m "feat(tools): Add subject resolution helper for smart create tools"
```

---

### Task 2: Smart Create Invoice Tool

**Files:**
- Create: `src/fakturoid/tool/smartInvoice.ts`
- Test: `src/fakturoid/tool/smartInvoice.test.ts`

- [ ] **Step 1: Write failing tests for smart invoice creation**

Create `src/fakturoid/tool/smartInvoice.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";

vi.mock("./resolveSubject.js", () => ({
	resolveSubject: vi.fn(),
}));

import { resolveSubject } from "./resolveSubject.js";
import { executeSmartCreateInvoice } from "./smartInvoice.js";

const mockClient = {
	getInvoices: vi.fn(),
	createInvoice: vi.fn(),
};

const mockResolveSubject = vi.mocked(resolveSubject);

describe("executeSmartCreateInvoice", () => {
	it("creates invoice when subject exists and no duplicate", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		mockClient.getInvoices.mockResolvedValue([]);
		const createdInvoice = { id: 1, number: "2026-001", subject_id: 42 };
		mockClient.createInvoice.mockResolvedValue(createdInvoice);

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
		const subject = { id: 99, name: "New Co", registration_no: "87654321" };
		mockResolveSubject.mockResolvedValue({ status: "created", data: subject as any });
		mockClient.getInvoices.mockResolvedValue([]);
		const createdInvoice = { id: 2, number: "2026-002", subject_id: 99 };
		mockClient.createInvoice.mockResolvedValue(createdInvoice);

		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "87654321",
			number: "2026-002",
		});

		expect(result.status).toBe("created");
		expect(result.subject.status).toBe("created");
	});

	it("returns duplicate when invoice number already exists for subject", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		const existingInvoice = { id: 5, number: "2026-001", subject_id: 42 };
		mockClient.getInvoices.mockResolvedValue([existingInvoice]);

		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
			number: "2026-001",
		});

		expect(result).toEqual({
			status: "duplicate_found",
			subject: { status: "found", data: subject },
			document: {
				data: existingInvoice,
				message: "Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is.",
			},
		});
		expect(mockClient.createInvoice).not.toHaveBeenCalled();
	});

	it("skips duplicate check when number is not provided", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		const createdInvoice = { id: 3, subject_id: 42 };
		mockClient.createInvoice.mockResolvedValue(createdInvoice);

		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
		});

		expect(result.status).toBe("created");
		expect(mockClient.getInvoices).not.toHaveBeenCalled();
	});

	it("returns error when subject resolution fails", async () => {
		mockResolveSubject.mockResolvedValue(new Error("API error"));

		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
		});

		expect(result).toBeInstanceOf(Error);
	});

	it("returns error when invoice creation fails", async () => {
		const subject = { id: 42, name: "Test Co", registration_no: "12345678" };
		mockResolveSubject.mockResolvedValue({ status: "found", data: subject as any });
		mockClient.getInvoices.mockResolvedValue([]);
		mockClient.createInvoice.mockResolvedValue(new Error("Validation error"));

		const result = await executeSmartCreateInvoice(mockClient as any, {
			registration_no: "12345678",
			number: "2026-001",
		});

		expect(result).toBeInstanceOf(Error);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/fakturoid/tool/smartInvoice.test.ts`
Expected: FAIL — module `./smartInvoice.js` not found

- [ ] **Step 3: Implement smart invoice tool**

Create `src/fakturoid/tool/smartInvoice.ts`:

```typescript
import { z } from "zod/v3";
import type { FakturoidClient } from "../client.js";
import type { Invoice } from "../model/invoice.js";
import { CreateInvoiceSchema } from "../model/invoice.js";
import type { Subject } from "../model/subject.js";
import { createTool, type ServerToolCreator } from "./common.js";
import { resolveSubject, type SubjectResolution } from "./resolveSubject.js";

type SmartCreateInvoiceResult =
	| {
			status: "created" | "duplicate_found";
			subject: SubjectResolution;
			document: {
				data: Invoice;
				message?: string;
			};
	  }
	| Error;

const DUPLICATE_MESSAGE =
	"Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is.";

const SmartCreateInvoiceInputSchema = CreateInvoiceSchema.omit({ subject_id: true }).extend({
	registration_no: z.string().describe("Registration number (IČO) of the subject"),
});

type SmartCreateInvoiceInput = z.infer<typeof SmartCreateInvoiceInputSchema>;

const executeSmartCreateInvoice = async (
	client: FakturoidClient<any, any>,
	input: SmartCreateInvoiceInput,
): Promise<SmartCreateInvoiceResult> => {
	const { registration_no, ...invoiceData } = input;

	const subjectResult = await resolveSubject(client, registration_no, "customer");
	if (subjectResult instanceof Error) {
		return subjectResult;
	}

	const subjectId = subjectResult.data.id;

	if (invoiceData.number != null) {
		const existingInvoices = await client.getInvoices({
			subject_id: subjectId,
			number: invoiceData.number,
		});

		if (existingInvoices instanceof Error) {
			return new Error(`Invoice search failed: ${existingInvoices.message}`);
		}

		if (existingInvoices.length > 0) {
			return {
				status: "duplicate_found",
				subject: subjectResult,
				document: {
					data: existingInvoices[0] as Invoice,
					message: DUPLICATE_MESSAGE,
				},
			};
		}
	}

	const created = await client.createInvoice({
		...invoiceData,
		subject_id: subjectId,
	});

	if (created instanceof Error) {
		return new Error(`Invoice creation failed: ${created.message}`);
	}

	return {
		status: "created",
		subject: subjectResult,
		document: { data: created },
	};
};

const smartCreateInvoice = createTool(
	"fakturoid_smart_create_invoice",
	"Smart Create Invoice",
	"Resolve subject by IČO (create via ARES if not found), check for duplicate invoice by number, and create the invoice — all in one step. Returns existing document with a message if duplicate is found.",
	async (client, input) => {
		const result = await executeSmartCreateInvoice(client, input as SmartCreateInvoiceInput);

		if (result instanceof Error) {
			return {
				content: [{ isError: true, text: result.message, type: "text" as const }],
			};
		}

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" as const }],
		};
	},
	SmartCreateInvoiceInputSchema.shape,
);

const smartInvoice = [smartCreateInvoice] as const satisfies ServerToolCreator[];

export { smartInvoice, executeSmartCreateInvoice };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/fakturoid/tool/smartInvoice.test.ts`
Expected: All 6 tests PASS

- [ ] **Step 5: Run type checking**

Run: `pnpm run types`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add src/fakturoid/tool/smartInvoice.ts src/fakturoid/tool/smartInvoice.test.ts
git commit -m "feat(tools): Add smart create invoice tool"
```

---

### Task 3: Smart Create Expense Tool

**Files:**
- Create: `src/fakturoid/tool/smartExpense.ts`
- Test: `src/fakturoid/tool/smartExpense.test.ts`

- [ ] **Step 1: Write failing tests for smart expense creation**

Create `src/fakturoid/tool/smartExpense.test.ts`:

```typescript
import { describe, expect, it, vi } from "vitest";

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

		expect(result.status).toBe("created");
		expect(result.subject.status).toBe("created");
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

		expect(result.status).toBe("created");
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm vitest run src/fakturoid/tool/smartExpense.test.ts`
Expected: FAIL — module `./smartExpense.js` not found

- [ ] **Step 3: Implement smart expense tool**

Create `src/fakturoid/tool/smartExpense.ts`:

```typescript
import { z } from "zod/v3";
import type { FakturoidClient } from "../client.js";
import type { Expense } from "../model/expense.js";
import { CreateExpenseSchema } from "../model/expense.js";
import type { Subject } from "../model/subject.js";
import { createTool, type ServerToolCreator } from "./common.js";
import { resolveSubject, type SubjectResolution } from "./resolveSubject.js";

type SmartCreateExpenseResult =
	| {
			status: "created" | "duplicate_found";
			subject: SubjectResolution;
			document: {
				data: Expense;
				message?: string;
			};
	  }
	| Error;

const DUPLICATE_MESSAGE =
	"Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is.";

const SmartCreateExpenseInputSchema = CreateExpenseSchema.omit({ subject_id: true }).extend({
	registration_no: z.string().describe("Registration number (IČO) of the subject"),
});

type SmartCreateExpenseInput = z.infer<typeof SmartCreateExpenseInputSchema>;

const executeSmartCreateExpense = async (
	client: FakturoidClient<any, any>,
	input: SmartCreateExpenseInput,
): Promise<SmartCreateExpenseResult> => {
	const { registration_no, ...expenseData } = input;

	const subjectResult = await resolveSubject(client, registration_no, "supplier");
	if (subjectResult instanceof Error) {
		return subjectResult;
	}

	const subjectId = subjectResult.data.id;

	if (expenseData.original_number != null) {
		const existingExpenses = await client.getExpenses({
			subject_id: subjectId,
		});

		if (existingExpenses instanceof Error) {
			return new Error(`Expense search failed: ${existingExpenses.message}`);
		}

		const duplicate = existingExpenses.find(
			(e) => e.original_number === expenseData.original_number,
		);

		if (duplicate != null) {
			return {
				status: "duplicate_found",
				subject: subjectResult,
				document: {
					data: duplicate as Expense,
					message: DUPLICATE_MESSAGE,
				},
			};
		}
	}

	const created = await client.createExpense({
		...expenseData,
		subject_id: subjectId,
	});

	if (created instanceof Error) {
		return new Error(`Expense creation failed: ${created.message}`);
	}

	return {
		status: "created",
		subject: subjectResult,
		document: { data: created },
	};
};

const smartCreateExpense = createTool(
	"fakturoid_smart_create_expense",
	"Smart Create Expense",
	"Resolve subject by IČO (create via ARES if not found), check for duplicate expense by original number, and create the expense — all in one step. Returns existing document with a message if duplicate is found.",
	async (client, input) => {
		const result = await executeSmartCreateExpense(client, input as SmartCreateExpenseInput);

		if (result instanceof Error) {
			return {
				content: [{ isError: true, text: result.message, type: "text" as const }],
			};
		}

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" as const }],
		};
	},
	SmartCreateExpenseInputSchema.shape,
);

const smartExpense = [smartCreateExpense] as const satisfies ServerToolCreator[];

export { smartExpense, executeSmartCreateExpense };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm vitest run src/fakturoid/tool/smartExpense.test.ts`
Expected: All 7 tests PASS

- [ ] **Step 5: Run type checking**

Run: `pnpm run types`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add src/fakturoid/tool/smartExpense.ts src/fakturoid/tool/smartExpense.test.ts
git commit -m "feat(tools): Add smart create expense tool"
```

---

### Task 4: Register Tools and Final Verification

**Files:**
- Modify: `src/fakturoid/tools.ts:1-59`

- [ ] **Step 1: Add imports and register smart tools**

In `src/fakturoid/tools.ts`, add two imports after the existing tool imports (after line 23, before the function):

```typescript
import { smartExpense } from "./tool/smartExpense.js";
import { smartInvoice } from "./tool/smartInvoice.js";
```

Add `smartExpense` and `smartInvoice` to the tools array (after `webhook` on line 51):

```typescript
const tools: ServerToolCreator<Configuration, Strategy>[] = [
	account,
	bankAccount,
	event,
	expense,
	expensePayment,
	generator,
	inboxFile,
	inventoryItem,
	inventoryMove,
	invoice,
	invoiceMessage,
	invoicePayment,
	meta,
	numberFormat,
	recurringGenerator,
	smartExpense,
	smartInvoice,
	subject,
	todo,
	user,
	webhook,
].flat();
```

- [ ] **Step 2: Run all tests**

Run: `pnpm vitest run`
Expected: All tests PASS

- [ ] **Step 3: Run type checking**

Run: `pnpm run types`
Expected: No type errors

- [ ] **Step 4: Run linting**

Run: `pnpm run lint`
Expected: No lint errors (run `pnpm run format` first if needed)

- [ ] **Step 5: Build**

Run: `pnpm run build`
Expected: Successful compilation

- [ ] **Step 6: Commit**

```bash
git add src/fakturoid/tools.ts
git commit -m "feat(tools): Register smart create invoice and expense tools"
```
