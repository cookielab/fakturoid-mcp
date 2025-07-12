import type { ReadResourceResult, Resource } from "@modelcontextprotocol/sdk/types.js";
import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { FakturoidClient } from "../client.js";

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
