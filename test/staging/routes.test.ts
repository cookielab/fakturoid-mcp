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
