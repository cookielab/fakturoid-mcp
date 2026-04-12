# File Upload Staging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-phase file upload/download staging mechanism so that AI agents can upload and download files without exhausting the LLM context window.

**Architecture:** An HTTP upload endpoint stores files temporarily in KV (Cloudflare) or in-memory Map (local). MCP tools accept a `file_ref` reference ID instead of raw base64 content. A file resolver service abstracts over multiple source types (file_ref, URL, file path, raw base64). Download tools stage binary in the same storage and return a download URL instead of dumping binary into context.

**Tech Stack:** TypeScript, Zod, Hono (Cloudflare routes), Express (local routes), Cloudflare KV

---

### Task 1: File Staging Storage — Interface and In-Memory Implementation

**Files:**
- Create: `src/staging/storage.ts`
- Create: `test/staging/storage.test.ts`

- [ ] **Step 1: Write the failing tests for in-memory staging storage**

```typescript
// test/staging/storage.test.ts
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { InMemoryFileStaging } from "../../src/staging/storage";

describe("InMemoryFileStaging", () => {
  let staging: InMemoryFileStaging;

  beforeEach(() => {
    staging = new InMemoryFileStaging();
  });

  afterEach(() => {
    staging.dispose();
  });

  test("store and retrieve a file", async () => {
    const content = new Uint8Array([1, 2, 3, 4]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "test.pdf",
      mimeType: "application/pdf",
    });

    expect(ref).toMatch(/^ref_/);

    const file = await staging.retrieve(ref);
    expect(file).not.toBeNull();
    expect(file!.filename).toBe("test.pdf");
    expect(file!.mimeType).toBe("application/pdf");
    expect(new Uint8Array(file!.content)).toEqual(content);
  });

  test("retrieve returns null for unknown ref", async () => {
    const file = await staging.retrieve("ref_nonexistent");
    expect(file).toBeNull();
  });

  test("retrieve deletes the file after retrieval by default", async () => {
    const content = new Uint8Array([1, 2, 3]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "test.pdf",
      mimeType: "application/pdf",
    });

    await staging.retrieve(ref);
    const second = await staging.retrieve(ref);
    expect(second).toBeNull();
  });

  test("peek retrieves without deleting", async () => {
    const content = new Uint8Array([1, 2, 3]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "test.pdf",
      mimeType: "application/pdf",
    });

    const first = await staging.peek(ref);
    expect(first).not.toBeNull();

    const second = await staging.peek(ref);
    expect(second).not.toBeNull();
  });

  test("expired files are not retrievable", async () => {
    vi.useFakeTimers();

    const content = new Uint8Array([1, 2, 3]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "test.pdf",
      mimeType: "application/pdf",
    });

    // Advance past 5 minute TTL
    vi.advanceTimersByTime(6 * 60 * 1000);

    const file = await staging.retrieve(ref);
    expect(file).toBeNull();

    vi.useRealTimers();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test test/staging/storage.test.ts`
Expected: FAIL — module `../../src/staging/storage` not found

- [ ] **Step 3: Implement the staging storage**

```typescript
// src/staging/storage.ts
import { randomUUID } from "node:crypto";

const FILE_STAGING_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FILE_STAGING_PREFIX = "ref_";
const CLEANUP_INTERVAL_MS = 60 * 1000; // 1 minute

interface StagedFile {
  content: ArrayBuffer;
  filename: string;
  mimeType: string;
}

interface StagedFileMetadata {
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
}

interface FileStaging {
  store(file: StagedFile): Promise<string>;
  retrieve(ref: string): Promise<StagedFile | null>;
  peek(ref: string): Promise<StagedFile | null>;
}

class InMemoryFileStaging implements FileStaging {
  private readonly files = new Map<string, StagedFile & { createdAt: number }>();
  private readonly cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL_MS);
  }

  async store(file: StagedFile): Promise<string> {
    const ref = `${FILE_STAGING_PREFIX}${randomUUID().replaceAll("-", "")}`;
    this.files.set(ref, { ...file, createdAt: Date.now() });
    return ref;
  }

  async retrieve(ref: string): Promise<StagedFile | null> {
    const entry = this.files.get(ref);
    if (entry == null) return null;
    if (this.isExpired(entry.createdAt)) {
      this.files.delete(ref);
      return null;
    }

    this.files.delete(ref);
    return { content: entry.content, filename: entry.filename, mimeType: entry.mimeType };
  }

  async peek(ref: string): Promise<StagedFile | null> {
    const entry = this.files.get(ref);
    if (entry == null) return null;
    if (this.isExpired(entry.createdAt)) {
      this.files.delete(ref);
      return null;
    }

    return { content: entry.content, filename: entry.filename, mimeType: entry.mimeType };
  }

  dispose(): void {
    clearInterval(this.cleanupTimer);
    this.files.clear();
  }

  private isExpired(createdAt: number): boolean {
    return Date.now() - createdAt > FILE_STAGING_TTL_MS;
  }

  private cleanup(): void {
    for (const [ref, entry] of this.files) {
      if (this.isExpired(entry.createdAt)) {
        this.files.delete(ref);
      }
    }
  }
}

export { InMemoryFileStaging, FILE_STAGING_TTL_MS, FILE_STAGING_PREFIX };
export type { FileStaging, StagedFile, StagedFileMetadata };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test test/staging/storage.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/staging/storage.ts test/staging/storage.test.ts
git commit -m "feat(staging): Add file staging storage interface and in-memory implementation"
```

---

### Task 2: KV-Backed File Staging for Cloudflare

**Files:**
- Create: `src/staging/kvStorage.ts`
- Create: `test/staging/kvStorage.test.ts`

- [ ] **Step 1: Write the failing tests for KV staging storage**

```typescript
// test/staging/kvStorage.test.ts
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { KVFileStaging } from "../../src/staging/kvStorage";

const createMockKV = () => {
  const store = new Map<string, { value: string; metadata: unknown }>();
  return {
    put: vi.fn(async (key: string, value: string, options?: { expirationTtl?: number; metadata?: unknown }) => {
      store.set(key, { value, metadata: options?.metadata });
    }),
    getWithMetadata: vi.fn(async (key: string) => {
      const entry = store.get(key);
      if (entry == null) return { value: null, metadata: null };
      return { value: entry.value, metadata: entry.metadata };
    }),
    delete: vi.fn(async (key: string) => {
      store.delete(key);
    }),
  } as unknown as KVNamespace;
};

describe("KVFileStaging", () => {
  let kv: KVNamespace;
  let staging: KVFileStaging;

  beforeEach(() => {
    kv = createMockKV();
    staging = new KVFileStaging(kv);
  });

  test("store and retrieve a file", async () => {
    const content = new Uint8Array([1, 2, 3, 4]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "invoice.pdf",
      mimeType: "application/pdf",
    });

    expect(ref).toMatch(/^ref_/);
    expect(kv.put).toHaveBeenCalledOnce();

    const file = await staging.retrieve(ref);
    expect(file).not.toBeNull();
    expect(file!.filename).toBe("invoice.pdf");
    expect(file!.mimeType).toBe("application/pdf");
    expect(new Uint8Array(file!.content)).toEqual(content);

    // Should delete after retrieval
    expect(kv.delete).toHaveBeenCalledOnce();
  });

  test("retrieve returns null for unknown ref", async () => {
    const file = await staging.retrieve("ref_nonexistent");
    expect(file).toBeNull();
  });

  test("peek retrieves without deleting", async () => {
    const content = new Uint8Array([5, 6, 7]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "photo.png",
      mimeType: "image/png",
    });

    const file = await staging.peek(ref);
    expect(file).not.toBeNull();
    expect(kv.delete).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test test/staging/kvStorage.test.ts`
Expected: FAIL — module `../../src/staging/kvStorage` not found

- [ ] **Step 3: Implement the KV staging storage**

```typescript
// src/staging/kvStorage.ts
import { randomUUID } from "node:crypto";
import type { FileStaging, StagedFile, StagedFileMetadata } from "./storage.js";
import { FILE_STAGING_PREFIX } from "./storage.js";

const FILE_STAGING_TTL_SECONDS = 300; // 5 minutes
const KV_KEY_PREFIX = "file_staging:";

class KVFileStaging implements FileStaging {
  private readonly kv: KVNamespace;

  constructor(kv: KVNamespace) {
    this.kv = kv;
  }

  async store(file: StagedFile): Promise<string> {
    const ref = `${FILE_STAGING_PREFIX}${randomUUID().replaceAll("-", "")}`;
    const base64 = bufferToBase64(file.content);

    const metadata: StagedFileMetadata = {
      filename: file.filename,
      mimeType: file.mimeType,
      size: file.content.byteLength,
      createdAt: Date.now(),
    };

    await this.kv.put(`${KV_KEY_PREFIX}${ref}`, base64, {
      expirationTtl: FILE_STAGING_TTL_SECONDS,
      metadata,
    });

    return ref;
  }

  async retrieve(ref: string): Promise<StagedFile | null> {
    const file = await this.getFile(ref);
    if (file != null) {
      await this.kv.delete(`${KV_KEY_PREFIX}${ref}`);
    }
    return file;
  }

  async peek(ref: string): Promise<StagedFile | null> {
    return await this.getFile(ref);
  }

  private async getFile(ref: string): Promise<StagedFile | null> {
    const { value, metadata } = await this.kv.getWithMetadata<StagedFileMetadata>(`${KV_KEY_PREFIX}${ref}`);
    if (value == null || metadata == null) return null;

    return {
      content: base64ToBuffer(value),
      filename: metadata.filename,
      mimeType: metadata.mimeType,
    };
  }
}

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
};

export { KVFileStaging };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test test/staging/kvStorage.test.ts`
Expected: All 3 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/staging/kvStorage.ts test/staging/kvStorage.test.ts
git commit -m "feat(staging): Add KV-backed file staging for Cloudflare Workers"
```

---

### Task 3: File Resolver Service

**Files:**
- Create: `src/staging/resolver.ts`
- Create: `test/staging/resolver.test.ts`

- [ ] **Step 1: Write the failing tests for the file resolver**

```typescript
// test/staging/resolver.test.ts
import { afterEach, beforeEach, describe, expect, type Mock, test, vi } from "vitest";
import { resolveFileSource } from "../../src/staging/resolver";
import { InMemoryFileStaging } from "../../src/staging/storage";

describe("resolveFileSource", () => {
  let staging: InMemoryFileStaging;
  let mockedFetch: Mock<typeof global.fetch>;

  beforeEach(() => {
    staging = new InMemoryFileStaging();
    global.fetch = vi.fn();
    mockedFetch = global.fetch as Mock<typeof global.fetch>;
  });

  afterEach(() => {
    staging.dispose();
    mockedFetch.mockReset();
  });

  test("throws if no source is provided", async () => {
    await expect(resolveFileSource({}, staging)).rejects.toThrow(
      "Provide exactly one file source: file_ref, source_url, file_path, or data/attachment",
    );
  });

  test("throws if multiple sources are provided", async () => {
    await expect(
      resolveFileSource({ file_ref: "ref_abc", source_url: "https://example.com/file.pdf" }, staging),
    ).rejects.toThrow("Provide exactly one file source");
  });

  test("resolves file_ref from staging", async () => {
    const content = new Uint8Array([10, 20, 30]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "staged.pdf",
      mimeType: "application/pdf",
    });

    const result = await resolveFileSource({ file_ref: ref }, staging);
    expect(result.filename).toBe("staged.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(new Uint8Array(result.content)).toEqual(content);
  });

  test("throws for expired or unknown file_ref", async () => {
    await expect(resolveFileSource({ file_ref: "ref_nonexistent" }, staging)).rejects.toThrow(
      "File reference not found or expired",
    );
  });

  test("resolves source_url by fetching", async () => {
    const content = new Uint8Array([40, 50, 60]);
    mockedFetch.mockResolvedValue(
      new Response(content, {
        headers: { "Content-Type": "application/pdf" },
      }),
    );

    const result = await resolveFileSource(
      { source_url: "https://example.com/invoice.pdf" },
      staging,
    );

    expect(result.filename).toBe("invoice.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(new Uint8Array(result.content)).toEqual(content);
    expect(mockedFetch).toHaveBeenCalledWith("https://example.com/invoice.pdf");
  });

  test("resolves source_url with fallback filename", async () => {
    const content = new Uint8Array([1]);
    mockedFetch.mockResolvedValue(
      new Response(content, {
        headers: { "Content-Type": "image/png" },
      }),
    );

    const result = await resolveFileSource(
      { source_url: "https://example.com/download?id=123" },
      staging,
    );

    expect(result.filename).toBe("download");
    expect(result.mimeType).toBe("image/png");
  });

  test("resolves raw base64 data (attachment field)", async () => {
    const original = new Uint8Array([1, 2, 3]);
    const base64 = btoa(String.fromCharCode(...original));

    const result = await resolveFileSource(
      { data: base64, filename: "manual.pdf", mimeType: "application/pdf" },
      staging,
    );

    expect(result.filename).toBe("manual.pdf");
    expect(result.mimeType).toBe("application/pdf");
    expect(new Uint8Array(result.content)).toEqual(original);
  });

  test("resolves data URI format", async () => {
    const original = new Uint8Array([4, 5, 6]);
    const base64 = btoa(String.fromCharCode(...original));
    const dataUri = `data:image/png;base64,${base64}`;

    const result = await resolveFileSource({ data: dataUri }, staging);

    expect(result.filename).toBe("attachment");
    expect(result.mimeType).toBe("image/png");
    expect(new Uint8Array(result.content)).toEqual(original);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test test/staging/resolver.test.ts`
Expected: FAIL — module `../../src/staging/resolver` not found

- [ ] **Step 3: Implement the file resolver**

```typescript
// src/staging/resolver.ts
import type { FileStaging } from "./storage.js";

interface FileSource {
  file_ref?: string;
  source_url?: string;
  file_path?: string;
  data?: string;
  filename?: string;
  mimeType?: string;
}

interface ResolvedFile {
  content: ArrayBuffer;
  filename: string;
  mimeType: string;
}

const resolveFileSource = async (source: FileSource, staging: FileStaging): Promise<ResolvedFile> => {
  const providedSources = [source.file_ref, source.source_url, source.file_path, source.data].filter(
    (v) => v != null,
  );

  if (providedSources.length !== 1) {
    throw new Error("Provide exactly one file source: file_ref, source_url, file_path, or data/attachment");
  }

  if (source.file_ref != null) {
    return await resolveFromStaging(source.file_ref, staging);
  }

  if (source.source_url != null) {
    return await resolveFromUrl(source.source_url);
  }

  if (source.file_path != null) {
    return await resolveFromFilePath(source.file_path);
  }

  return resolveFromData(source.data!, source.filename, source.mimeType);
};

const resolveFromStaging = async (ref: string, staging: FileStaging): Promise<ResolvedFile> => {
  const file = await staging.retrieve(ref);
  if (file == null) {
    throw new Error("File reference not found or expired. Upload the file again at /upload");
  }
  return file;
};

const resolveFromUrl = async (url: string): Promise<ResolvedFile> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch file from URL: HTTP ${response.status}`);
  }

  const content = await response.arrayBuffer();
  const mimeType = response.headers.get("Content-Type") ?? "application/octet-stream";
  const filename = extractFilenameFromUrl(url);

  return { content, filename, mimeType };
};

const resolveFromFilePath = async (filePath: string): Promise<ResolvedFile> => {
  try {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");

    const buffer = await fs.readFile(filePath);
    const filename = path.basename(filePath);
    const mimeType = inferMimeType(filename);

    return { content: buffer.buffer as ArrayBuffer, filename, mimeType };
  } catch (error) {
    if (error instanceof TypeError || (error as NodeJS.ErrnoException).code === "MODULE_NOT_FOUND") {
      throw new Error("file_path is not supported on the hosted deployment. Use the /upload page to get a file_ref instead.");
    }
    throw new Error(`Failed to read file: ${(error as Error).message}`);
  }
};

const resolveFromData = (data: string, filename?: string, mimeType?: string): ResolvedFile => {
  const dataUriMatch = data.match(/^data:([^;]+);base64,(.+)$/);
  if (dataUriMatch != null) {
    const parsedMime = dataUriMatch[1];
    const base64Content = dataUriMatch[2];
    return {
      content: base64ToBuffer(base64Content),
      filename: filename ?? "attachment",
      mimeType: mimeType ?? parsedMime,
    };
  }

  // Raw base64
  return {
    content: base64ToBuffer(data),
    filename: filename ?? "attachment",
    mimeType: mimeType ?? "application/octet-stream",
  };
};

const extractFilenameFromUrl = (url: string): string => {
  try {
    const pathname = new URL(url).pathname;
    const lastSegment = pathname.split("/").pop() ?? "download";
    return lastSegment || "download";
  } catch {
    return "download";
  }
};

const inferMimeType = (filename: string): string => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    xml: "application/xml",
  };
  return mimeTypes[ext ?? ""] ?? "application/octet-stream";
};

const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
};

const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
};

const bufferToDataUri = (buffer: ArrayBuffer, mimeType: string): string => {
  return `data:${mimeType};base64,${bufferToBase64(buffer)}`;
};

export { resolveFileSource, bufferToBase64, bufferToDataUri };
export type { FileSource, ResolvedFile };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test test/staging/resolver.test.ts`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/staging/resolver.ts test/staging/resolver.test.ts
git commit -m "feat(staging): Add file resolver service supporting ref, URL, path, and base64 sources"
```

---

### Task 4: Upload Page HTML Template

**Files:**
- Create: `src/staging/upload-page.ts`

- [ ] **Step 1: Create the upload page template**

This is a static HTML template — no test needed, it will be verified through the smoke test in Task 13.

```typescript
// src/staging/upload-page.ts
const uploadPageHtml = (baseUrl: string): string => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fakturoid MCP - File Upload</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 20px; color: #333; }
    h1 { font-size: 1.4rem; margin-bottom: 8px; }
    p.subtitle { color: #666; margin-bottom: 24px; font-size: 0.9rem; }
    .drop-zone { border: 2px dashed #ccc; border-radius: 8px; padding: 48px 24px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; }
    .drop-zone:hover, .drop-zone.dragover { border-color: #4a90d9; background: #f0f6ff; }
    .drop-zone input { display: none; }
    .drop-zone p { color: #666; margin-bottom: 8px; }
    .drop-zone .browse { color: #4a90d9; text-decoration: underline; cursor: pointer; }
    .result { margin-top: 24px; padding: 16px; border-radius: 8px; display: none; }
    .result.success { background: #e8f5e9; border: 1px solid #a5d6a7; display: block; }
    .result.error { background: #fce4ec; border: 1px solid #ef9a9a; display: block; }
    .ref-id { font-family: monospace; font-size: 1.1rem; font-weight: bold; user-select: all; }
    .copy-btn { margin-top: 8px; padding: 6px 16px; background: #4a90d9; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
    .copy-btn:hover { background: #3a7bc8; }
    .info { margin-top: 8px; font-size: 0.8rem; color: #666; }
    .spinner { display: none; margin-top: 16px; text-align: center; color: #666; }
  </style>
</head>
<body>
  <h1>Fakturoid MCP - File Upload</h1>
  <p class="subtitle">Upload a file to get a reference ID. Give the reference ID to your AI assistant.</p>

  <div class="drop-zone" id="dropZone">
    <p>Drag and drop a file here</p>
    <p>or <span class="browse" id="browseBtn">browse files</span></p>
    <p style="margin-top: 12px; font-size: 0.8rem; color: #999;">PDF, PNG, JPEG, GIF, XML - max 10MB</p>
    <input type="file" id="fileInput" accept=".pdf,.png,.jpg,.jpeg,.gif,.xml">
  </div>

  <div class="spinner" id="spinner">Uploading...</div>

  <div class="result" id="result">
    <p id="resultMessage"></p>
    <p class="ref-id" id="refId"></p>
    <button class="copy-btn" id="copyBtn" style="display:none;">Copy reference ID</button>
    <p class="info" id="fileInfo"></p>
  </div>

  <script>
    const dropZone = document.getElementById("dropZone");
    const fileInput = document.getElementById("fileInput");
    const browseBtn = document.getElementById("browseBtn");
    const spinner = document.getElementById("spinner");
    const result = document.getElementById("result");
    const resultMessage = document.getElementById("resultMessage");
    const refIdEl = document.getElementById("refId");
    const copyBtn = document.getElementById("copyBtn");
    const fileInfo = document.getElementById("fileInfo");

    browseBtn.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => { if (e.target.files[0]) uploadFile(e.target.files[0]); });

    dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
    dropZone.addEventListener("dragleave", () => dropZone.classList.remove("dragover"));
    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) uploadFile(e.dataTransfer.files[0]);
    });

    async function uploadFile(file) {
      spinner.style.display = "block";
      result.className = "result";
      resultMessage.textContent = "";
      refIdEl.textContent = "";
      copyBtn.style.display = "none";
      fileInfo.textContent = "";

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("${baseUrl}/upload", { method: "POST", body: formData });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Upload failed");
        }

        resultMessage.textContent = "File uploaded successfully!";
        refIdEl.textContent = data.file_ref;
        copyBtn.style.display = "inline-block";
        copyBtn.onclick = () => navigator.clipboard.writeText(data.file_ref);
        fileInfo.textContent = data.filename + " (" + (data.size / 1024).toFixed(1) + " KB) - expires in " + data.expires_in_seconds + "s";
        result.className = "result success";
      } catch (err) {
        resultMessage.textContent = "Error: " + err.message;
        result.className = "result error";
      } finally {
        spinner.style.display = "none";
        fileInput.value = "";
      }
    }
  </script>
</body>
</html>`;

export { uploadPageHtml };
```

- [ ] **Step 2: Commit**

```bash
git add src/staging/upload-page.ts
git commit -m "feat(staging): Add upload page HTML template"
```

---

### Task 5: Upload and Download Route Handlers

**Files:**
- Create: `src/staging/routes.ts`
- Create: `test/staging/routes.test.ts`

- [ ] **Step 1: Write failing tests for the route handler logic**

```typescript
// test/staging/routes.test.ts
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { handleFileUpload, handleFileDownload } from "../../src/staging/routes";
import { InMemoryFileStaging } from "../../src/staging/storage";

describe("handleFileUpload", () => {
  let staging: InMemoryFileStaging;

  beforeEach(() => {
    staging = new InMemoryFileStaging();
  });

  afterEach(() => {
    staging.dispose();
  });

  test("stores a file and returns ref metadata", async () => {
    const content = new Uint8Array([1, 2, 3, 4, 5]);
    const result = await handleFileUpload(staging, {
      content: content.buffer as ArrayBuffer,
      filename: "invoice.pdf",
      mimeType: "application/pdf",
    });

    expect(result.file_ref).toMatch(/^ref_/);
    expect(result.filename).toBe("invoice.pdf");
    expect(result.size).toBe(5);
    expect(result.mime_type).toBe("application/pdf");
    expect(result.expires_in_seconds).toBe(300);
  });

  test("rejects files over 10MB", async () => {
    const content = new Uint8Array(11 * 1024 * 1024); // 11MB
    await expect(
      handleFileUpload(staging, {
        content: content.buffer as ArrayBuffer,
        filename: "huge.pdf",
        mimeType: "application/pdf",
      }),
    ).rejects.toThrow("File exceeds maximum size of 10MB");
  });

  test("rejects unsupported MIME types", async () => {
    const content = new Uint8Array([1]);
    await expect(
      handleFileUpload(staging, {
        content: content.buffer as ArrayBuffer,
        filename: "script.js",
        mimeType: "application/javascript",
      }),
    ).rejects.toThrow("Unsupported file type");
  });
});

describe("handleFileDownload", () => {
  let staging: InMemoryFileStaging;

  beforeEach(() => {
    staging = new InMemoryFileStaging();
  });

  afterEach(() => {
    staging.dispose();
  });

  test("returns staged file for valid ref", async () => {
    const content = new Uint8Array([10, 20, 30]);
    const ref = await staging.store({
      content: content.buffer as ArrayBuffer,
      filename: "report.pdf",
      mimeType: "application/pdf",
    });

    const result = await handleFileDownload(staging, ref);
    expect(result).not.toBeNull();
    expect(result!.filename).toBe("report.pdf");
    expect(result!.mimeType).toBe("application/pdf");
    expect(new Uint8Array(result!.content)).toEqual(content);
  });

  test("returns null for unknown ref", async () => {
    const result = await handleFileDownload(staging, "ref_unknown");
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test test/staging/routes.test.ts`
Expected: FAIL — module `../../src/staging/routes` not found

- [ ] **Step 3: Implement the route handlers**

```typescript
// src/staging/routes.ts
import type { FileStaging, StagedFile } from "./storage.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/gif",
  "text/xml",
  "application/xml",
]);

interface UploadInput {
  content: ArrayBuffer;
  filename: string;
  mimeType: string;
}

interface UploadResult {
  file_ref: string;
  filename: string;
  size: number;
  mime_type: string;
  expires_in_seconds: number;
}

const handleFileUpload = async (staging: FileStaging, input: UploadInput): Promise<UploadResult> => {
  if (input.content.byteLength > MAX_FILE_SIZE) {
    throw new Error("File exceeds maximum size of 10MB");
  }

  if (!ALLOWED_MIME_TYPES.has(input.mimeType)) {
    throw new Error(`Unsupported file type: ${input.mimeType}. Allowed: PDF, PNG, JPEG, GIF, XML`);
  }

  const ref = await staging.store({
    content: input.content,
    filename: input.filename,
    mimeType: input.mimeType,
  });

  return {
    file_ref: ref,
    filename: input.filename,
    size: input.content.byteLength,
    mime_type: input.mimeType,
    expires_in_seconds: 300,
  };
};

const handleFileDownload = async (staging: FileStaging, ref: string): Promise<StagedFile | null> => {
  return await staging.peek(ref);
};

export { handleFileUpload, handleFileDownload };
export type { UploadInput, UploadResult };
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test test/staging/routes.test.ts`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/staging/routes.ts test/staging/routes.test.ts
git commit -m "feat(staging): Add upload and download route handler logic"
```

---

### Task 6: Wire Staging Into Server and Tool Infrastructure

This task threads the `FileStaging` instance through the server -> tools pipeline so tools can access it.

**Files:**
- Modify: `src/fakturoid/tool/common.ts`
- Modify: `src/fakturoid/tools.ts`
- Modify: `src/server.ts`

- [ ] **Step 1: Update `createTool` to accept staging storage**

Replace the full contents of `src/fakturoid/tool/common.ts`:

```typescript
// src/fakturoid/tool/common.ts
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { z } from "zod/v3";
import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { FakturoidClient } from "../client.js";
import type { FileStaging } from "../../staging/storage.js";
import { logger } from "../../utils/logger.js";

type ServerToolCreator<
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
> = (server: McpServer, client: FakturoidClient<Configuration, Strategy>, staging: FileStaging) => void;

const createTool = <
	InputSchema extends z.ZodRawShape | undefined = undefined,
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
>(
	name: string,
	title: string,
	description: string,
	implementation: (
		client: FakturoidClient<Configuration, Strategy>,
		input: InputSchema extends z.ZodRawShape ? z.objectOutputType<InputSchema, z.ZodTypeAny> : undefined,
		staging: FileStaging,
	) => CallToolResult | Promise<CallToolResult>,
	inputSchema?: InputSchema,
): ServerToolCreator<Configuration, Strategy> => {
	return (server, client, staging) => {
		try {
			if (inputSchema == null) {
				return server.registerTool(name, { title: title, description: description }, () =>
					implementation(
						client,
						undefined as InputSchema extends z.ZodRawShape ? z.objectOutputType<InputSchema, z.ZodTypeAny> : undefined,
						staging,
					),
				);
			}

			// Yeah, we don't care for that, Typescript.
			// @ts-expect-error "Type instantiation is excessively deep and possibly infinite"
			return server.registerTool(name, { title: title, description: description, inputSchema: inputSchema }, (input) =>
				implementation(
					client,
					input as InputSchema extends z.ZodRawShape ? z.objectOutputType<InputSchema, z.ZodTypeAny> : undefined,
					staging,
				),
			);
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : String(error);

			logger.error("Failed to execute a tool.");
			logger.error(message);

			return {
				content: [{ isError: true, text: `Error: ${message}`, type: "text" }],
			};
		}
	};
};

export { createTool };
export type { ServerToolCreator };
```

- [ ] **Step 2: Update `registerFakturoidTools` to accept and pass staging**

Edit `src/fakturoid/tools.ts` — add the import and update the function signature:

Add import:
```typescript
import type { FileStaging } from "../staging/storage.js";
```

Change the function signature and tool registration loop:
```typescript
const registerFakturoidTools = <
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
>(
	server: McpServer,
	client: FakturoidClient<Configuration, Strategy>,
	staging: FileStaging,
): void => {
	// ... same tools array ...

	for (const registerTool of tools) {
		registerTool(server, client, staging);
	}
};
```

- [ ] **Step 3: Update `createServer` to accept and pass staging**

Edit `src/server.ts` — add the import and update the function:

Add import:
```typescript
import type { FileStaging } from "./staging/storage.js";
```

Change the function signature:
```typescript
const createServer = async <Configuration extends object, Strategy extends AuthenticationStrategy<Configuration>>(
	strategy: Strategy,
	staging: FileStaging,
): Promise<McpServer> => {
```

Update the `registerFakturoidTools` call:
```typescript
	registerFakturoidTools(server, fakturoidClient, staging);
```

- [ ] **Step 4: Run type check to verify**

Run: `pnpm run types`
Expected: No type errors (existing tools will accept the extra `staging` parameter without changes since it's just an additional callback argument)

- [ ] **Step 5: Commit**

```bash
git add src/fakturoid/tool/common.ts src/fakturoid/tools.ts src/server.ts
git commit -m "refactor(tools): Thread FileStaging through server and tool infrastructure"
```

---

### Task 7: Update Upload Tools — Inbox File

**Files:**
- Modify: `src/fakturoid/model/inboxFile.ts`
- Modify: `src/fakturoid/tool/inboxFile.ts`

- [ ] **Step 1: Add tool-level schema to the inbox file model**

Edit `src/fakturoid/model/inboxFile.ts`. Add after the existing `CreateInboxFileSchema`:

```typescript
const CreateInboxFileToolSchema = z.object({
	/** Reference ID from the /upload page */
	file_ref: z.string().optional(),
	/** URL to fetch the file from */
	source_url: z.string().optional(),
	/** Local file path (only works when server runs locally) */
	file_path: z.string().optional(),
	/** File content as Base64 encoded string (fallback - prefer file_ref or source_url to avoid context exhaustion) */
	attachment: z.string().optional(),
	/** File name (with extension) */
	filename: z.string().optional(),
	/** The file will be sent to OCR */
	send_to_ocr: z.boolean().optional(),
});

type CreateInboxFileTool = z.infer<typeof CreateInboxFileToolSchema>;
```

Add `CreateInboxFileToolSchema` and `CreateInboxFileTool` to the exports.

- [ ] **Step 2: Update the inbox file tool to use the file resolver**

Edit `src/fakturoid/tool/inboxFile.ts`. Update imports and replace the `createInboxFile` tool:

Add imports:
```typescript
import { resolveFileSource, bufferToBase64 } from "../../staging/resolver.js";
import { CreateInboxFileToolSchema } from "../model/inboxFile.js";
```

Replace the `createInboxFile` tool definition:
```typescript
const createInboxFile = createTool(
	"fakturoid_create_inbox_file",
	"Create Inbox File",
	"Upload a new file to the inbox for processing. Provide exactly one file source: file_ref (from /upload page - preferred), source_url, file_path (local server only), or attachment (base64 - avoid, exhausts context).",
	async (client, input, staging) => {
		const resolved = await resolveFileSource(
			{
				file_ref: input.file_ref,
				source_url: input.source_url,
				file_path: input.file_path,
				data: input.attachment,
				filename: input.filename,
			},
			staging,
		);

		const inboxFile = await client.createInboxFile({
			attachment: bufferToBase64(resolved.content),
			filename: input.filename ?? resolved.filename,
			send_to_ocr: input.send_to_ocr,
		});

		return {
			content: [{ text: JSON.stringify(inboxFile, null, 2), type: "text" }],
		};
	},
	CreateInboxFileToolSchema.shape,
);
```

Remove the old import of `CreateInboxFileSchema` (it is no longer used by the tool).

- [ ] **Step 3: Run lint and type check**

Run: `pnpm run types && pnpm run lint`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/fakturoid/model/inboxFile.ts src/fakturoid/tool/inboxFile.ts
git commit -m "feat(tools): Update inbox file upload to support file_ref, URL, and path sources"
```

---

### Task 8: Update Upload Tools — Invoice and Expense Attachments

**Files:**
- Modify: `src/fakturoid/model/common.ts`
- Modify: `src/staging/resolver.ts`
- Modify: `src/fakturoid/tool/invoice.ts`
- Modify: `src/fakturoid/tool/expense.ts`

- [ ] **Step 1: Add tool-level attachment schema to common.ts**

Edit `src/fakturoid/model/common.ts`. Add after the existing `CreateAttachmentSchema`:

```typescript
const CreateAttachmentToolSchema = z.object({
	/** Reference ID from the /upload page */
	file_ref: z.string().optional(),
	/** URL to fetch the file from */
	source_url: z.string().optional(),
	/** Local file path (only works when server runs locally) */
	file_path: z.string().optional(),
	/** Attachment contents in the form of a Data URI (fallback - prefer file_ref or source_url) */
	data_url: z.string().optional(),
	/** Attachment file name */
	filename: z.string().optional(),
});

type CreateAttachmentTool = z.infer<typeof CreateAttachmentToolSchema>;
```

Add `CreateAttachmentToolSchema` and `CreateAttachmentTool` to the exports.

- [ ] **Step 2: Add `resolveAttachments` helper to the resolver**

Edit `src/staging/resolver.ts`. Add the following types and function:

```typescript
import type { CreateAttachment } from "../fakturoid/model/common.js";

interface AttachmentToolInput {
  file_ref?: string;
  source_url?: string;
  file_path?: string;
  data_url?: string;
  filename?: string;
}

const resolveAttachments = async (
  attachments: AttachmentToolInput[] | undefined,
  staging: FileStaging,
): Promise<CreateAttachment[] | undefined> => {
  if (attachments == null || attachments.length === 0) return undefined;

  const resolved: CreateAttachment[] = [];
  for (const att of attachments) {
    const file = await resolveFileSource(
      {
        file_ref: att.file_ref,
        source_url: att.source_url,
        file_path: att.file_path,
        data: att.data_url,
        filename: att.filename,
      },
      staging,
    );

    resolved.push({
      data_url: bufferToDataUri(file.content, file.mimeType),
      filename: att.filename ?? file.filename,
    });
  }

  return resolved;
};
```

Add `resolveAttachments` and `AttachmentToolInput` to the exports.

- [ ] **Step 3: Update the invoice create tool**

Edit `src/fakturoid/tool/invoice.ts`. Add imports and update the `createInvoice` tool:

Add imports:
```typescript
import { resolveAttachments } from "../../staging/resolver.js";
import { CreateAttachmentToolSchema } from "../model/common.js";
```

Replace the `createInvoice` tool definition:
```typescript
const createInvoice = createTool(
	"fakturoid_create_invoice",
	"Create Invoice",
	"Create a new invoice with the provided invoice data. subject_id is necessary for the invoice to be created. For attachments, provide file_ref (from /upload page - preferred), source_url, file_path, or data_url.",
	async (client, invoiceData, staging) => {
		const resolvedAttachments = await resolveAttachments(invoiceData.attachments, staging);

		const invoice = await client.createInvoice({
			...invoiceData,
			attachments: resolvedAttachments,
		});

		return {
			content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
		};
	},
	{
		...CreateInvoiceSchema.shape,
		attachments: z.array(CreateAttachmentToolSchema).optional(),
	},
);
```

- [ ] **Step 4: Update the expense create tool with the same pattern**

Edit `src/fakturoid/tool/expense.ts`. Add imports and update the `createExpense` tool:

Add imports:
```typescript
import { resolveAttachments } from "../../staging/resolver.js";
import { CreateAttachmentToolSchema } from "../model/common.js";
```

Replace the `createExpense` tool definition:
```typescript
const createExpense = createTool(
	"fakturoid_create_expense",
	"Create Expense",
	"Create a new expense with the provided expense data. For attachments, provide file_ref (from /upload page - preferred), source_url, file_path, or data_url.",
	async (client, expenseData, staging) => {
		const resolvedAttachments = await resolveAttachments(expenseData.attachments, staging);

		const expense = await client.createExpense({
			...expenseData,
			attachments: resolvedAttachments,
		});

		return {
			content: [{ text: JSON.stringify(expense, null, 2), type: "text" }],
		};
	},
	{
		...CreateExpenseSchema.shape,
		attachments: z.array(CreateAttachmentToolSchema).optional(),
	},
);
```

- [ ] **Step 5: Run type check and lint**

Run: `pnpm run types && pnpm run lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/fakturoid/model/common.ts src/staging/resolver.ts src/fakturoid/tool/invoice.ts src/fakturoid/tool/expense.ts
git commit -m "feat(tools): Update invoice and expense attachments to support file staging sources"
```

---

### Task 9: Improve Download Tools

**Files:**
- Modify: `src/fakturoid/tool/invoice.ts`
- Modify: `src/fakturoid/tool/expense.ts`
- Modify: `src/fakturoid/tool/inboxFile.ts`

- [ ] **Step 1: Update `downloadInvoicePDF` to stage the binary**

Edit `src/fakturoid/tool/invoice.ts`. Replace the `downloadInvoicePDF` tool:

```typescript
const downloadInvoicePDF = createTool(
	"fakturoid_download_invoice_pdf",
	"Download Invoice PDF",
	"Download the PDF version of an invoice by its ID. Returns a file reference that can be opened via /download/:ref",
	async (client, { id }, staging) => {
		const pdf = await client.downloadInvoicePDF(id);

		if (pdf instanceof Blob) {
			const buffer = await pdf.arrayBuffer();
			const ref = await staging.store({
				content: buffer,
				filename: `invoice-${id}.pdf`,
				mimeType: "application/pdf",
			});
			const sizeKB = (buffer.byteLength / 1024).toFixed(1);

			return {
				content: [
					{
						text: `Invoice PDF downloaded successfully. File ref: ${ref} (expires in 5 minutes). Size: ${sizeKB} KB. Open in browser: /download/${ref}`,
						type: "text" as const,
					},
				],
			};
		}

		return {
			content: [{ text: `Error downloading invoice PDF: ${String(pdf)}`, type: "text" as const }],
			isError: true,
		};
	},
	{
		id: z.number(),
	},
);
```

- [ ] **Step 2: Update `downloadInvoiceAttachment` to stage the binary**

Edit `src/fakturoid/tool/invoice.ts`. Replace the `downloadInvoiceAttachment` tool:

```typescript
const downloadInvoiceAttachment = createTool(
	"fakturoid_download_invoice_attachment",
	"Download Invoice Attachment",
	"Download a specific attachment from an invoice. Returns a file reference that can be opened via /download/:ref",
	async (client, { invoiceId, attachmentId }, staging) => {
		const attachment = await client.downloadInvoiceAttachment(invoiceId, attachmentId);

		if (attachment instanceof Blob) {
			const buffer = await attachment.arrayBuffer();
			const mimeType = attachment.type || "application/octet-stream";
			const ref = await staging.store({
				content: buffer,
				filename: `invoice-${invoiceId}-attachment-${attachmentId}`,
				mimeType,
			});
			const sizeKB = (buffer.byteLength / 1024).toFixed(1);

			return {
				content: [
					{
						text: `Attachment downloaded successfully. File ref: ${ref} (expires in 5 minutes). Size: ${sizeKB} KB. Open in browser: /download/${ref}`,
						type: "text" as const,
					},
				],
			};
		}

		return {
			content: [{ text: `Error downloading attachment: ${String(attachment)}`, type: "text" as const }],
			isError: true,
		};
	},
	{
		attachmentId: z.number(),
		invoiceId: z.number(),
	},
);
```

- [ ] **Step 3: Update `downloadExpenseAttachment` with the same pattern**

Edit `src/fakturoid/tool/expense.ts`. Replace the `downloadExpenseAttachment` tool:

```typescript
const downloadExpenseAttachment = createTool(
	"fakturoid_download_expense_attachment",
	"Download Expense Attachment",
	"Download a specific attachment from an expense. Returns a file reference that can be opened via /download/:ref",
	async (client, { expenseId, attachmentId }, staging) => {
		const attachment = await client.downloadExpenseAttachment(expenseId, attachmentId);

		if (attachment instanceof Blob) {
			const buffer = await attachment.arrayBuffer();
			const mimeType = attachment.type || "application/octet-stream";
			const ref = await staging.store({
				content: buffer,
				filename: `expense-${expenseId}-attachment-${attachmentId}`,
				mimeType,
			});
			const sizeKB = (buffer.byteLength / 1024).toFixed(1);

			return {
				content: [
					{
						text: `Attachment downloaded successfully. File ref: ${ref} (expires in 5 minutes). Size: ${sizeKB} KB. Open in browser: /download/${ref}`,
						type: "text" as const,
					},
				],
			};
		}

		return {
			content: [{ text: `Error downloading attachment: ${String(attachment)}`, type: "text" as const }],
			isError: true,
		};
	},
	{
		attachmentId: z.number(),
		expenseId: z.number(),
	},
);
```

- [ ] **Step 4: Update `downloadInboxFile` to stage the binary**

Edit `src/fakturoid/tool/inboxFile.ts`. Replace the `downloadInboxFile` tool:

```typescript
const downloadInboxFile = createTool(
	"fakturoid_download_inbox_file",
	"Download Inbox File",
	"Download a file from the inbox by its ID. Returns a file reference that can be opened via /download/:ref",
	async (client, { id }, staging) => {
		const file = await client.downloadInboxFile(id);

		if (file instanceof Blob) {
			const buffer = await file.arrayBuffer();
			const mimeType = file.type || "application/octet-stream";
			const ref = await staging.store({
				content: buffer,
				filename: `inbox-file-${id}`,
				mimeType,
			});
			const sizeKB = (buffer.byteLength / 1024).toFixed(1);

			return {
				content: [
					{
						text: `Inbox file downloaded successfully. File ref: ${ref} (expires in 5 minutes). Size: ${sizeKB} KB. Open in browser: /download/${ref}`,
						type: "text" as const,
					},
				],
			};
		}

		return {
			content: [{ text: `Error downloading inbox file: ${String(file)}`, type: "text" as const }],
			isError: true,
		};
	},
	{
		id: z.number(),
	},
);
```

- [ ] **Step 5: Run type check and lint**

Run: `pnpm run types && pnpm run lint`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add src/fakturoid/tool/invoice.ts src/fakturoid/tool/expense.ts src/fakturoid/tool/inboxFile.ts
git commit -m "feat(tools): Download tools now stage binary and return file refs instead of dumping to context"
```

---

### Task 10: Wire Upload/Download Routes Into Local Server

**Files:**
- Modify: `src/main.ts`

- [ ] **Step 1: Add staging, upload, and download routes to all transport modes**

Edit `src/main.ts`. Add imports at the top:

```typescript
import { InMemoryFileStaging } from "./staging/storage.js";
import { handleFileUpload, handleFileDownload } from "./staging/routes.js";
import { uploadPageHtml } from "./staging/upload-page.js";
```

Update `startSTDIO` to pass a staging instance:

```typescript
const startSTDIO = async (strategy: AuthenticationStrategy): Promise<void> => {
	logger.info("Starting the server in STDIO transport mode.");

	const transport = new StdioServerTransport();
	const staging = new InMemoryFileStaging();
	const server = await createServer(strategy, staging);

	await server.connect(transport);
};
```

Update `startSSE` to pass a staging instance:

```typescript
const startSSE = async (strategy: AuthenticationStrategy, port: number): Promise<void> => {
	// ... existing code up to server creation ...
	const staging = new InMemoryFileStaging();
	const server = await createServer(strategy, staging);
	// ... rest unchanged ...
};
```

Update `startHTTP` to create staging and add routes. Add upload/download routes BEFORE the MCP route, and pass staging to `createServer`:

```typescript
const startHTTP = (strategy: AuthenticationStrategy, port: number): void => {
	logger.info(`Starting the server in Streamable HTTP transport mode on port ${port}.`);

	const app = express();
	app.use(express.json());
	app.disable("x-powered-by");

	const staging = new InMemoryFileStaging();
	const transports: HttpTransports = {};

	// Upload page
	app.get("/upload", (_request: Request, response: Response) => {
		response.setHeader("Content-Type", "text/html");
		response.send(uploadPageHtml(`http://localhost:${port}`));
	});

	// Upload endpoint
	app.post("/upload", async (request: Request, response: Response) => {
		try {
			const contentType = request.get("content-type") ?? "";
			if (!contentType.includes("multipart/form-data")) {
				response.status(400).json({ error: "Expected multipart/form-data" });
				return;
			}

			const rawBody = await new Promise<Buffer>((resolve) => {
				const chunks: Buffer[] = [];
				request.on("data", (chunk: Buffer) => chunks.push(chunk));
				request.on("end", () => resolve(Buffer.concat(chunks)));
			});

			const webRequest = new globalThis.Request("http://localhost/upload", {
				method: "POST",
				headers: { "Content-Type": contentType },
				body: rawBody,
			});

			const formData = await webRequest.formData();
			const file = formData.get("file");
			if (!(file instanceof File)) {
				response.status(400).json({ error: "No file provided" });
				return;
			}

			const result = await handleFileUpload(staging, {
				content: await file.arrayBuffer(),
				filename: file.name,
				mimeType: file.type || "application/octet-stream",
			});

			response.json(result);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			response.status(400).json({ error: message });
		}
	});

	// Download endpoint
	app.get("/download/:ref", async (request: Request, response: Response) => {
		const ref = request.params.ref;
		const file = await handleFileDownload(staging, ref);

		if (file == null) {
			response.status(404).json({ error: "File not found or expired" });
			return;
		}

		response.setHeader("Content-Type", file.mimeType);
		response.setHeader("Content-Disposition", `inline; filename="${file.filename}"`);
		response.send(Buffer.from(file.content));
	});

	// Existing MCP route — update createServer call to pass staging
	app.post("/mcp", async (request: Request, response: Response) => {
		// ... existing session logic ...
		// Change every: const server = await createServer(strategy);
		// To: const server = await createServer(strategy, staging);
		// ... rest unchanged ...
	});

	// ... rest of existing routes unchanged ...
};
```

- [ ] **Step 2: Run type check**

Run: `pnpm run types`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat(local): Wire upload/download routes and staging into local server transports"
```

---

### Task 11: Wire Upload/Download Routes Into Cloudflare Worker

**Files:**
- Modify: `wrangler.json`
- Modify: `src/cloudflare/handler.tsx`
- Modify: `src/cloudflare/main.ts`

- [ ] **Step 1: Add FILE_STAGING KV namespace to wrangler.json**

First, create the KV namespace:

Run: `pnpm wrangler kv namespace create FILE_STAGING`

This will output an ID. Add the binding to `wrangler.json` in the `kv_namespaces` array:

```json
{
  "binding": "FILE_STAGING",
  "id": "<the-id-from-the-command-above>"
}
```

- [ ] **Step 2: Regenerate worker types**

Run: `pnpm cf:generate`

This updates `worker-configuration.d.ts` to include the `FILE_STAGING: KVNamespace` binding.

- [ ] **Step 3: Add upload/download routes to the Hono handler**

Edit `src/cloudflare/handler.tsx`. Add imports:

```typescript
import { KVFileStaging } from "../staging/kvStorage.js";
import { handleFileUpload, handleFileDownload } from "../staging/routes.js";
import { uploadPageHtml } from "../staging/upload-page.js";
```

Add the following routes BEFORE the existing `/authorize` routes in the `createHandler` function:

```typescript
// Upload page
app.get("/upload", (context) => {
	const baseUrl = new URL(context.req.url).origin;
	return context.html(uploadPageHtml(baseUrl));
});

// Upload endpoint
app.post("/upload", async (context) => {
	try {
		const staging = new KVFileStaging(context.env.FILE_STAGING);
		const formData = await context.req.raw.formData();
		const file = formData.get("file");

		if (!(file instanceof File)) {
			return context.json({ error: "No file provided" }, 400);
		}

		const result = await handleFileUpload(staging, {
			content: await file.arrayBuffer(),
			filename: file.name,
			mimeType: file.type || "application/octet-stream",
		});

		return context.json(result);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return context.json({ error: message }, 400);
	}
});

// Download endpoint
app.get("/download/:ref", async (context) => {
	const ref = context.req.param("ref");
	const staging = new KVFileStaging(context.env.FILE_STAGING);
	const file = await handleFileDownload(staging, ref);

	if (file == null) {
		return context.json({ error: "File not found or expired" }, 404);
	}

	return new Response(file.content, {
		headers: {
			"Content-Type": file.mimeType,
			"Content-Disposition": `inline; filename="${file.filename}"`,
		},
	});
});
```

- [ ] **Step 4: Update the FakturoidMCP Durable Object to use KV staging**

Edit `src/cloudflare/main.ts`. Add import:

```typescript
import { KVFileStaging } from "../staging/kvStorage.js";
```

Update the `init()` method to create KV staging and pass it to `createServer`:

```typescript
override async init(): Promise<void> {
	FakturoidMCP.strategy = createOAuthStrategy(this.env);

	const staging = new KVFileStaging(this.env.FILE_STAGING);

	// biome-ignore lint/complexity/useLiteralKeys: Making TS happy
	const userId = this.props["userId"];
	if (userId != null) {
		FakturoidMCP.strategy.setCurrentUser(userId);

		// biome-ignore lint/complexity/useLiteralKeys: Making TS happy
		const accessToken = this.props["accessToken"];
		if (accessToken != null) {
			await FakturoidMCP.strategy.setUser({
				userId: userId,
				accessToken: accessToken,
			});
		}
	}

	this.server = await createServer(FakturoidMCP.strategy, staging);
}
```

- [ ] **Step 5: Run type check**

Run: `pnpm run types`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add wrangler.json worker-configuration.d.ts src/cloudflare/handler.tsx src/cloudflare/main.ts
git commit -m "feat(cloudflare): Wire upload/download routes and KV staging into Cloudflare Worker"
```

---

### Task 12: Run Full Test Suite and Lint

**Files:** None (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `pnpm test`
Expected: All tests PASS

- [ ] **Step 2: Run the linter**

Run: `pnpm run lint`
Expected: No errors (fix any if found)

- [ ] **Step 3: Run the formatter**

Run: `pnpm run format`
Expected: All files formatted

- [ ] **Step 4: Run the type checker**

Run: `pnpm run types`
Expected: No type errors

- [ ] **Step 5: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: Fix formatting after file staging implementation"
```

(Skip if no changes)

---

### Task 13: Manual Smoke Test

**Files:** None (verification only)

- [ ] **Step 1: Start the local HTTP server**

Run: `MCP_TRANSPORT=http pnpm dev`
Expected: Server starts on port 5173

- [ ] **Step 2: Test the upload page**

Open `http://localhost:5173/upload` in a browser.
Expected: A drag-and-drop upload page appears.

- [ ] **Step 3: Upload a test file**

Drop a small PDF or PNG file onto the upload page.
Expected: A reference ID like `ref_a1b2c3...` is displayed with a copy button.

- [ ] **Step 4: Test the download endpoint**

Open `http://localhost:5173/download/<ref_from_step_3>` in a browser.
Expected: The file downloads/displays in the browser.

- [ ] **Step 5: Stop the server**

Press Ctrl+C to stop the dev server.
