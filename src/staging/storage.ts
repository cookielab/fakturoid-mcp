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

	store(file: StagedFile): Promise<string> {
		const ref = `${FILE_STAGING_PREFIX}${randomUUID().replaceAll("-", "")}`;
		this.files.set(ref, { ...file, createdAt: Date.now() });
		return Promise.resolve(ref);
	}

	retrieve(ref: string): Promise<StagedFile | null> {
		const entry = this.files.get(ref);
		if (entry == null) {
			return Promise.resolve(null);
		}
		if (this.isExpired(entry.createdAt)) {
			this.files.delete(ref);
			return Promise.resolve(null);
		}

		this.files.delete(ref);
		return Promise.resolve({ content: entry.content, filename: entry.filename, mimeType: entry.mimeType });
	}

	peek(ref: string): Promise<StagedFile | null> {
		const entry = this.files.get(ref);
		if (entry == null) {
			return Promise.resolve(null);
		}
		if (this.isExpired(entry.createdAt)) {
			this.files.delete(ref);
			return Promise.resolve(null);
		}

		return Promise.resolve({ content: entry.content, filename: entry.filename, mimeType: entry.mimeType });
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
