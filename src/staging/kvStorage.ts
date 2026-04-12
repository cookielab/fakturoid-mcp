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
      metadata: metadata,
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
    if (value == null || metadata == null) { return null; }

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
