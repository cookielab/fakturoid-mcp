import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AuthenticationStrategy } from "../auth/strategy.js";
import type { FakturoidClient } from "./client.js";
import type { FakturoidResource } from "./resource/common.js";
import {
	ListResourcesRequestSchema,
	ReadResourceRequestSchema,
	type Resource,
} from "@modelcontextprotocol/sdk/types.js";
import { accountResource } from "./resource/account.js";
import { dashboardSummaryResource } from "./resource/dashboardSummary.js";
import { expensesOpenResource } from "./resource/expensesOpen.js";
import { expensesRecentResource } from "./resource/expensesRecent.js";
import { invoicesOpenResource } from "./resource/invoicesOpen.js";
import { invoicesOverdueResource } from "./resource/invoicesOverdue.js";
import { invoicesRecentResource } from "./resource/invoicesRecent.js";
import { subjectsCustomersResource } from "./resource/subjectsCustomers.js";
import { subjectsRecentResource } from "./resource/subjectsRecent.js";
import { subjectsSuppliersResource } from "./resource/subjectsSuppliers.js";

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
