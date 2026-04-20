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
