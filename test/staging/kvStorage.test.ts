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
