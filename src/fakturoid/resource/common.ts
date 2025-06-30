import type { ReadResourceResult, Resource } from "@modelcontextprotocol/sdk/types.js";
import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { FakturoidClient } from "../client.ts";

type FakturoidResource<
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
> = Resource & {
	implementation: (
		client: FakturoidClient<Configuration, Strategy>,
		accountSlug: string,
	) => Promise<ReadResourceResult>;
};

export type { FakturoidResource };
