# Smart Create Tools Design Spec

## Problem

When an AI agent needs to create an invoice or expense, it currently must orchestrate 3-4 sequential tool calls: search for the subject by IČO, optionally create the subject, check if the document already exists, then create it. Each round-trip burns tokens and adds latency. This spec defines two compound tools that encapsulate this workflow into a single MCP tool call.

## Tools

Two new tools, following the same factory pattern as existing tools:

- `fakturoid_smart_create_invoice` — resolve subject + deduplicate + create invoice
- `fakturoid_smart_create_expense` — resolve subject + deduplicate + create expense

These are additive. All existing atomic tools remain unchanged and available.

## Input Schema

Each tool accepts a flat input with two sections:

### Subject Identification

| Field | Type | Required | Description |
|---|---|---|---|
| `registration_no` | string | yes | IČO — used to find or create the subject |

### Document Data

All fields from the existing `CreateInvoiceSchema` (for invoice tool) or `CreateExpenseSchema` (for expense tool), **except `subject_id`**, which is resolved internally from the IČO.

For duplicate detection:
- Invoice tool uses the `number` field (číslo faktury)
- Expense tool uses the `original_number` field (číslo faktury dodavatele)

## Execution Flow

```
1. Search subject by IČO
   └─ Call searchSubjects(registration_no)
   └─ Filter results where registration_no matches exactly

2. Subject resolution
   ├─ Found → use existing subject_id
   └─ Not found → create subject:
       - name: registration_no (ARES auto-fill replaces it)
       - registration_no: the provided IČO
       - type: "customer" (invoice) or "supplier" (expense)

3. Duplicate check (only if number/original_number is provided)
   └─ Query existing documents filtered by subject_id + number/original_number

4. Document resolution
   ├─ Duplicate found → return existing document with "duplicate_found" status
   └─ No duplicate → create the document with resolved subject_id
```

## Response Structure

```typescript
{
  status: "created" | "duplicate_found",
  subject: {
    status: "found" | "created",
    data: Subject
  },
  document: {
    data: Invoice | Expense,
    message?: string  // Present only when status is "duplicate_found"
  }
}
```

When `status` is `"duplicate_found"`, the response includes:
- The full existing document data
- A message: `"Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is."`

The AI agent then asks the user. If the user wants to update, the agent calls the existing `fakturoid_update_invoice` or `fakturoid_update_expense` tool with the document ID.

## Error Handling

Each step can fail independently. The tool returns a clear error indicating which step failed:

- Subject search failed → API error with context
- Subject creation failed → validation error (e.g., invalid IČO, ARES lookup failure)
- Document search failed → API error with context
- Document creation failed → validation error (e.g., missing required line items)

Errors are returned immediately — the tool does not continue past a failure.

## File Structure

| File | Purpose |
|---|---|
| `src/fakturoid/tool/smartInvoice.ts` | `fakturoid_smart_create_invoice` tool |
| `src/fakturoid/tool/smartExpense.ts` | `fakturoid_smart_create_expense` tool |

Each file exports a `ServerToolCreator` array registered in `src/fakturoid/tools.ts`.

No new client modules or models are needed. The tools compose existing client functions:
- `searchSubjects`, `createSubject` (from subject client)
- `getInvoices` / `getExpenses` with filters (from invoice/expense clients)
- `createInvoice` / `createExpense` (from invoice/expense clients)

The input schema is derived from existing `CreateInvoiceSchema` / `CreateExpenseSchema` with `subject_id` replaced by `registration_no`.

## What Stays Unchanged

- All existing atomic tools (no removals, no modifications)
- Client layer (`src/fakturoid/client/`)
- Models (`src/fakturoid/model/`)
- Server factory (`src/server.ts`)
- Transport layer (`src/main.ts`)
