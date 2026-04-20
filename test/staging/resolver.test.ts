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
