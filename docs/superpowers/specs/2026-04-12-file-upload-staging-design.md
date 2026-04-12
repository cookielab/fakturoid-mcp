# File Upload Staging Design

## Problem

When an AI agent (e.g., Claude) uploads file attachments (PDFs, PNGs) through this MCP server, the file content must be passed as base64-encoded strings in MCP tool arguments. This causes the LLM's context window to be exhausted because:

1. **Output token cost**: The LLM must *generate* the entire base64 string as output tokens in the tool call
2. **Context retention**: Both the tool arguments and results persist in the conversation context
3. **Scale**: A 1MB PDF becomes ~1.3MB of base64 — hundreds of thousands of tokens

This affects three upload paths:
- `fakturoid_create_inbox_file` — `attachment` field (base64 string)
- `fakturoid_create_invoice` — `attachments[].data_url` field (data URI)
- `fakturoid_create_expense` — `attachments[].data_url` field (data URI)

And three download paths that return binary as JSON text:
- `fakturoid_download_invoice_pdf`
- `fakturoid_download_invoice_attachment`
- `fakturoid_download_expense_attachment`

## Constraints

- The MCP server is primarily used via Cloudflare Workers deployment (no local filesystem)
- Must also work for local development (stdio + HTTP transports)
- MCP protocol has no out-of-band binary channel for tool inputs — tool arguments are JSON
- The LLM constructs tool calls, so any file content in arguments = context tokens consumed

## Solution: Two-Phase Upload with File Staging

### Overview

Add an HTTP upload endpoint to the server that accepts file uploads directly (bypassing the LLM context), stores them temporarily, and returns a short reference ID. MCP tools then accept this reference ID instead of raw file content.

**Upload flow:**
```
User opens /upload page in browser
  → Drops file
  → File stored in staging (KV with TTL on CF, in-memory Map locally)
  → Returns reference ID (e.g., "ref_a1b2c3d4")

User tells Claude: "upload invoice ref_a1b2c3d4 to inbox"

Claude calls: fakturoid_create_inbox_file({ file_ref: "ref_a1b2c3d4", ... })
  → Server retrieves staged file by ref
  → Converts to base64, sends to Fakturoid API
  → Deletes staged file
  → Returns success response
```

**Context cost: ~30 tokens instead of hundreds of thousands.**

### File Source Priority

Tools accept multiple source options (exactly one required):

| Source | Description | Works on CF | Works locally |
|--------|-------------|-------------|---------------|
| `file_ref` | Reference ID from upload endpoint | Yes | Yes (HTTP mode) |
| `source_url` | URL to fetch file from | Yes | Yes |
| `file_path` | Local filesystem path | No | Yes (stdio/HTTP) |
| `data` | Raw base64/data URI (fallback) | Yes | Yes |

The tool description guides the AI agent on preference order.

### Components

#### 1. Upload Endpoint & Page

**Route**: `GET /upload` — serves a simple HTML page with drag-and-drop file upload UI.

**Route**: `POST /upload` — accepts `multipart/form-data` with a single file field.

**Response**:
```json
{
  "file_ref": "ref_a1b2c3d4e5f6",
  "filename": "invoice.pdf",
  "size": 102400,
  "mime_type": "application/pdf",
  "expires_in_seconds": 300
}
```

**Constraints**:
- Max file size: 10MB (Fakturoid API limit is likely similar)
- Allowed MIME types: `application/pdf`, `image/png`, `image/jpeg`, `image/gif`, `text/xml`, `application/xml`
- Files expire after 5 minutes (TTL)
- Reference IDs are random UUIDs prefixed with `ref_`

**Upload page UI**: Minimal HTML — drag-and-drop zone, file input button, displays reference ID after upload with a copy button. No framework needed, inline CSS/JS. Must be functional, not fancy.

#### 2. File Staging Storage

**Cloudflare Workers**: Add a new `FILE_STAGING` KV namespace with TTL-based expiration.

- Key: `file_staging:{ref_id}`
- Value: File content as base64 string
- Metadata: `{ filename, mime_type, size, created_at }`
- TTL: 300 seconds (5 minutes)

**Local (HTTP mode)**: In-memory `Map<string, StagedFile>` with a cleanup interval that removes expired entries every 60 seconds.

**Local (stdio mode)**: No staging needed — file_path reads directly from disk. But the Map is still available if someone uses the HTTP transport locally.

#### 3. File Resolution Service

A shared utility that resolves any of the four source types to a `{ data: Buffer/ArrayBuffer, filename: string, mimeType: string }`:

```typescript
interface FileSource {
  file_ref?: string;
  source_url?: string;
  file_path?: string;
  data?: string;
}

interface ResolvedFile {
  content: ArrayBuffer;
  filename: string;
  mimeType: string;
}

async function resolveFileSource(
  source: FileSource,
  staging: FileStaging
): Promise<ResolvedFile>
```

**Resolution logic**:
1. Validate exactly one source is provided
2. `file_ref` → look up in staging storage, delete after retrieval
3. `source_url` → `fetch(url)`, read response body
4. `file_path` → `fs.readFile()` (throws if running on CF Workers)
5. `data` → decode base64/data URI directly

This utility is used by all three upload tools.

#### 4. Updated Tool Input Schemas

**`fakturoid_create_inbox_file`** — Replace `attachment: z.string()` with:
```typescript
{
  file_ref: z.string().optional(),
  source_url: z.string().url().optional(),
  file_path: z.string().optional(),
  attachment: z.string().optional(),  // base64 fallback, renamed from required to optional
  filename: z.string().optional(),
  send_to_ocr: z.boolean().optional(),
}
```

Tool implementation: resolve file source → convert to base64 → call existing `client.createInboxFile()`.

**`fakturoid_create_invoice`** and **`fakturoid_create_expense`** — Extend `CreateAttachmentSchema` alternatives:
```typescript
{
  file_ref: z.string().optional(),
  source_url: z.string().url().optional(),
  file_path: z.string().optional(),
  data_url: z.string().optional(),  // existing field, now optional
  filename: z.string().optional(),
}
```

Tool implementation: for each attachment in the array, resolve file source → convert to data URI → pass to existing client methods.

#### 5. Download Improvements

The download tools currently return `JSON.stringify(blob)` which is meaningless. Improve them to return useful metadata instead of binary content in context:

**`fakturoid_download_invoice_pdf`**:
- Stage the downloaded binary in the file staging storage (same KV/Map used for uploads)
- Return a text result: `"Invoice PDF downloaded. File ref: ref_xxx (expires in 5 minutes). Size: 102KB. Access via /download/ref_xxx"`
- Add a `GET /download/:ref` endpoint that serves staged files as HTTP responses with correct `Content-Type` and `Content-Disposition` headers
- This lets the user open the file in their browser without the binary ever entering LLM context

**`fakturoid_download_invoice_attachment`** and **`fakturoid_download_expense_attachment`**: Same pattern — stage binary in file staging, return a text result with the file ref and download URL.

### Integration Points

#### Cloudflare Worker (`src/cloudflare/main.ts` + `src/cloudflare/handler.tsx`)

Add routes to the Hono handler:
- `GET /upload` — serves the upload HTML page
- `POST /upload` — handles file upload, stores in KV, returns ref
- `GET /download/:ref` — serves a staged file as an HTTP download

Add a new KV namespace binding `FILE_STAGING` in `wrangler.json`.

The `FakturoidMCP` Durable Object needs access to the KV namespace to resolve `file_ref` values during tool execution.

#### Local Server (`src/main.ts`)

For HTTP transport: add `/upload` GET and POST, and `/download/:ref` GET routes to the Express app.

For stdio transport: no upload endpoint (no HTTP server). The `file_path` source type handles local files. The file resolution service detects the runtime and enables/disables `file_path` accordingly.

#### Tool Registration (`src/fakturoid/tool/common.ts`)

The `createTool` helper needs no changes. Individual tool files update their input schemas and implementations to use the file resolution service.

### New Files

| File | Purpose |
|------|---------|
| `src/staging/storage.ts` | `FileStaging` interface + KV and in-memory implementations |
| `src/staging/resolver.ts` | `resolveFileSource()` — resolves any source type to file content |
| `src/staging/upload.ts` | Upload route handlers (shared between Express and Hono) |
| `src/staging/download.ts` | Download route handler for serving staged files |
| `src/staging/upload-page.ts` | HTML template for the upload page |

### Modified Files

| File | Change |
|------|--------|
| `src/fakturoid/model/inboxFile.ts` | Add file source fields to `CreateInboxFileSchema` |
| `src/fakturoid/model/common.ts` | Add file source fields to `CreateAttachmentSchema` |
| `src/fakturoid/tool/inboxFile.ts` | Use file resolver before calling client |
| `src/fakturoid/tool/invoice.ts` | Resolve attachment sources before calling client |
| `src/fakturoid/tool/expense.ts` | Resolve attachment sources before calling client |
| `src/fakturoid/tool/invoice.ts` | Improve download tool return values |
| `src/fakturoid/tool/expense.ts` | Improve download tool return values |
| `src/cloudflare/handler.tsx` | Add `/upload` routes |
| `src/cloudflare/main.ts` | Pass KV binding to staging storage |
| `src/main.ts` | Add `/upload` routes for local HTTP mode |
| `src/server.ts` | Accept and pass staging storage to tool registration |
| `src/fakturoid/tools.ts` | Pass staging storage through to tools |
| `src/fakturoid/tool/common.ts` | Update `createTool` signature to accept staging storage |
| `wrangler.json` | Add `FILE_STAGING` KV namespace binding |
| `worker-configuration.d.ts` | Regenerate with new binding |

### Error Handling

| Error | Behavior |
|-------|----------|
| No source provided | Return error: "Provide one of: file_ref, source_url, file_path, or data" |
| Multiple sources provided | Return error: "Provide exactly one file source" |
| `file_ref` not found / expired | Return error: "File reference not found or expired. Upload the file again at /upload" |
| `file_path` on Cloudflare | Return error: "file_path is not supported on the hosted deployment. Use /upload page to get a file_ref instead" |
| `source_url` fetch fails | Return error with HTTP status: "Failed to fetch file from URL: {status}" |
| File too large | Return error: "File exceeds maximum size of 10MB" |
| Invalid MIME type | Return error: "Unsupported file type. Allowed: PDF, PNG, JPEG, GIF, XML" |

### Testing Strategy

- Unit tests for `resolveFileSource()` with each source type
- Unit tests for staging storage (KV mock + in-memory)
- Integration test: upload file via POST → get ref → use ref in tool call
- Test validation: multiple sources, missing sources, expired refs, size limits
- Test both local (in-memory) and KV storage implementations

### Security Considerations

- File refs are random UUIDs — not guessable
- TTL ensures files are cleaned up even if never consumed
- Files are deleted from staging immediately after successful retrieval
- Upload endpoint is behind the same OAuth protection as the MCP endpoints on Cloudflare
- Local mode upload endpoint has no auth (acceptable for local development)
- MIME type validation prevents uploading unexpected file types
- File size limit prevents abuse

### Out of Scope

- Multi-file upload in a single request (use multiple individual uploads)
- Resumable uploads (files are small enough for single-shot)
- File deduplication
- Persistent file storage beyond TTL
- Download staging (returning file_ref for downloads) — may be added later
