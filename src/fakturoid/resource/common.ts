import type { ReadResourceResult, Resource } from "@modelcontextprotocol/sdk/types.js";
import type { FakturoidClient } from "../client.ts";

type FakturoidResource = Resource & {
	implementation: (client: FakturoidClient, accountSlug: string) => Promise<ReadResourceResult>;
};

export type { FakturoidResource };
