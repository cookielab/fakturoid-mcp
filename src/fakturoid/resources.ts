import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Resource } from "@modelcontextprotocol/sdk/types.js";
import type { FakturoidClient } from "./client.ts";
import type { Subject } from "./models/subject.ts";
import { ListResourcesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";

export function registerFakturoidResources(server: Server, client: FakturoidClient) {
	// List available resources
	server.setRequestHandler(ListResourcesRequestSchema, () => {
		const resources: Resource[] = [
			{
				description: "Current Fakturoid account details and settings",
				mimeType: "application/json",
				name: "Account Information",
				uri: "fakturoid://account",
			},
			{
				description: "Latest 20 invoices from your Fakturoid account",
				mimeType: "application/json",
				name: "Recent Invoices",
				uri: "fakturoid://invoices/recent",
			},
			{
				description: "All unpaid invoices requiring attention",
				mimeType: "application/json",
				name: "Open Invoices",
				uri: "fakturoid://invoices/open",
			},
			{
				description: "Invoices that are past their due date",
				mimeType: "application/json",
				name: "Overdue Invoices",
				uri: "fakturoid://invoices/overdue",
			},
			{
				description: "Latest 20 expenses from your Fakturoid account",
				mimeType: "application/json",
				name: "Recent Expenses",
				uri: "fakturoid://expenses/recent",
			},
			{
				description: "All unpaid expenses requiring attention",
				mimeType: "application/json",
				name: "Open Expenses",
				uri: "fakturoid://expenses/open",
			},
			{
				description: "Recently added or updated contacts and companies",
				mimeType: "application/json",
				name: "Recent Subjects",
				uri: "fakturoid://subjects/recent",
			},
			{
				description: "All company contacts in your Fakturoid account",
				mimeType: "application/json",
				name: "Company Subjects",
				uri: "fakturoid://subjects/companies",
			},
			{
				description: "All individual person contacts in your Fakturoid account",
				mimeType: "application/json",
				name: "Person Subjects",
				uri: "fakturoid://subjects/people",
			},
			{
				description: "Summary of key accounting metrics and recent activity",
				mimeType: "application/json",
				name: "Dashboard Summary",
				uri: "fakturoid://dashboard/summary",
			},
		];

		return { resources: resources };
	});

	// Read specific resources
	server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
		const { uri } = request.params;

		try {
			switch (uri) {
				case "fakturoid://account": {
					const account = await client.getAccount();
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(account, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://invoices/recent": {
					const recentInvoices = await client.getInvoices({ page: 1 });
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(recentInvoices, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://invoices/open": {
					const openInvoices = await client.getInvoices({ status: "open" });
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(openInvoices, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://invoices/overdue": {
					const overdueInvoices = await client.getInvoices({ status: "overdue" });
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(overdueInvoices, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://expenses/recent": {
					const recentExpenses = await client.getExpenses({ page: 1 });
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(recentExpenses, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://expenses/open": {
					const openExpenses = await client.getExpenses({ status: "open" });
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(openExpenses, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://subjects/recent": {
					const recentSubjects = await client.getSubjects({ page: 1 });
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(recentSubjects, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://subjects/companies": {
					// Note: This might require pagination handling in a real implementation
					const companies = await client.getSubjects({ page: 1 });
					const companiesFiltered = companies.filter((subject: Subject) => subject.type === "company" || !subject.type);
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(companiesFiltered, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://subjects/people": {
					const people = await client.getSubjects({ page: 1 });
					const peopleFiltered = people.filter((subject: Subject) => subject.type === "person");
					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(peopleFiltered, null, 2),
								uri: uri,
							},
						],
					};
				}

				case "fakturoid://dashboard/summary": {
					// Create a summary by fetching key data
					const [summaryAccount, summaryInvoices, summaryExpenses] = await Promise.all([
						client.getAccount().catch((e) => ({ error: e.message })),
						client.getInvoices({ page: 1 }).catch((e) => ({ error: e.message })),
						client.getExpenses({ page: 1 }).catch((e) => ({ error: e.message })),
					]);

					const summary = {
						account: summaryAccount,
						generated_at: new Date().toISOString(),
						recent_expenses: Array.isArray(summaryExpenses) ? summaryExpenses.slice(0, 5) : summaryExpenses,
						recent_invoices: Array.isArray(summaryInvoices) ? summaryInvoices.slice(0, 5) : summaryInvoices,
					};

					return {
						contents: [
							{
								mimeType: "application/json",
								text: JSON.stringify(summary, null, 2),
								uri: uri,
							},
						],
					};
				}

				default:
					throw new Error(`Unknown resource URI: ${uri}`);
			}
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
}
