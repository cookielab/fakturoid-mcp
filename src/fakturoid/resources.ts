import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AuthenticationStrategy } from "../auth/strategy.ts";
import type { FakturoidClient } from "./client.ts";
import type { FakturoidResource } from "./resource/common.ts";
import {
	ListResourcesRequestSchema,
	ReadResourceRequestSchema,
	type Resource,
} from "@modelcontextprotocol/sdk/types.js";
import { accountResource } from "./resource/account.ts";
import { dashboardSummaryResource } from "./resource/dashboardSummary.ts";
import { expensesOpenResource } from "./resource/expensesOpen.ts";
import { expensesRecentResource } from "./resource/expensesRecent.ts";
import { invoicesOpenResource } from "./resource/invoicesOpen.ts";
import { invoicesOverdueResource } from "./resource/invoicesOverdue.ts";
import { invoicesRecentResource } from "./resource/invoicesRecent.ts";
import { subjectsCustomersResource } from "./resource/subjectsCustomers.ts";
import { subjectsRecentResource } from "./resource/subjectsRecent.ts";
import { subjectsSuppliersResource } from "./resource/subjectsSuppliers.ts";

const RESOURCES: FakturoidResource[] = [
	accountResource,
	dashboardSummaryResource,
	expensesOpenResource,
	expensesRecentResource,
	invoicesOpenResource,
	invoicesOverdueResource,
	invoicesRecentResource,
	subjectsCustomersResource,
	subjectsRecentResource,
	subjectsSuppliersResource,
] as const;

const getAccountSlug = async <Configuration extends object, Strategy extends AuthenticationStrategy<Configuration>>(
	client: FakturoidClient<Configuration, Strategy>,
): Promise<string> => {
	const account = await client.getCurrentUser();
	if (account instanceof Error) {
		throw account;
	}

	// biome-ignore lint/style/noNonNullAssertion: Should be non-null here
	return account.accounts[0]!.slug;
};

const registerFakturoidResources = <
	Configuration extends object,
	Strategy extends AuthenticationStrategy<Configuration>,
>(
	server: Server,
	client: FakturoidClient<Configuration, Strategy>,
) => {
	let accountSlug: string;

	// List { resources: resources available resources
	server.setRequestHandler(ListResourcesRequestSchema, () => {
		const resources: Resource[] = RESOURCES.map((resource) => ({ ...resource, implementation: undefined }));

		return { resources: resources };
	});

	// Read specific resources
	server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
		const { uri } = request.params;

		try {
			accountSlug ??= await getAccountSlug(client);

			const resource = RESOURCES.find((item) => item.uri === uri);
			if (resource == null) {
				throw new Error(`Unknown resource "${uri}"`);
			}

			return await resource.implementation(client, accountSlug);
		} catch (error: unknown) {
			// Return error information as resource content
			return {
				contents: [
					{
						mimeType: "application/json",
						text: JSON.stringify(
							{
								error: error instanceof Error ? error.message : String(error),
								timestamp: new Date().toISOString(),
								uri: uri,
							},
							null,
							2,
						),
						uri: uri,
					},
				],
			};
		}
	});
};

export { registerFakturoidResources };
