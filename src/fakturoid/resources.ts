import { 
  ListResourcesRequestSchema, 
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { Resource } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { FakturoidClient } from './client.js';

export function registerFakturoidResources(server: Server, client: FakturoidClient) {
  // List available resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources: Resource[] = [
      {
        uri: 'fakturoid://account',
        name: 'Account Information',
        description: 'Current Fakturoid account details and settings',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://invoices/recent',
        name: 'Recent Invoices',
        description: 'Latest 20 invoices from your Fakturoid account',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://invoices/open',
        name: 'Open Invoices',
        description: 'All unpaid invoices requiring attention',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://invoices/overdue',
        name: 'Overdue Invoices',
        description: 'Invoices that are past their due date',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://expenses/recent',
        name: 'Recent Expenses',
        description: 'Latest 20 expenses from your Fakturoid account',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://expenses/open',
        name: 'Open Expenses',
        description: 'All unpaid expenses requiring attention',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://subjects/recent',
        name: 'Recent Subjects',
        description: 'Recently added or updated contacts and companies',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://subjects/companies',
        name: 'Company Subjects',
        description: 'All company contacts in your Fakturoid account',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://subjects/people',
        name: 'Person Subjects',
        description: 'All individual person contacts in your Fakturoid account',
        mimeType: 'application/json'
      },
      {
        uri: 'fakturoid://dashboard/summary',
        name: 'Dashboard Summary',
        description: 'Summary of key accounting metrics and recent activity',
        mimeType: 'application/json'
      }
    ];

    return { resources };
  });

  // Read specific resources
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    try {
      switch (uri) {
        case 'fakturoid://account':
          const account = await client.getAccount();
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(account, null, 2)
            }]
          };

        case 'fakturoid://invoices/recent':
          const recentInvoices = await client.getInvoices({ page: 1 });
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(recentInvoices, null, 2)
            }]
          };

        case 'fakturoid://invoices/open':
          const openInvoices = await client.getInvoices({ status: 'open' });
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(openInvoices, null, 2)
            }]
          };

        case 'fakturoid://invoices/overdue':
          const overdueInvoices = await client.getInvoices({ status: 'overdue' });
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(overdueInvoices, null, 2)
            }]
          };

        case 'fakturoid://expenses/recent':
          const recentExpenses = await client.getExpenses({ page: 1 });
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(recentExpenses, null, 2)
            }]
          };

        case 'fakturoid://expenses/open':
          const openExpenses = await client.getExpenses({ status: 'open' });
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(openExpenses, null, 2)
            }]
          };

        case 'fakturoid://subjects/recent':
          const recentSubjects = await client.getSubjects({ page: 1 });
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(recentSubjects, null, 2)
            }]
          };

        case 'fakturoid://subjects/companies':
          // Note: This might require pagination handling in a real implementation
          const companies = await client.getSubjects({ page: 1 });
          const companiesFiltered = companies.filter((subject: any) => 
            subject.type === 'company' || !subject.type
          );
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(companiesFiltered, null, 2)
            }]
          };

        case 'fakturoid://subjects/people':
          const people = await client.getSubjects({ page: 1 });
          const peopleFiltered = people.filter((subject: any) => 
            subject.type === 'person'
          );
          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(peopleFiltered, null, 2)
            }]
          };

        case 'fakturoid://dashboard/summary':
          // Create a summary by fetching key data
          const [summaryAccount, summaryInvoices, summaryExpenses] = await Promise.all([
            client.getAccount().catch(e => ({ error: e.message })),
            client.getInvoices({ page: 1 }).catch(e => ({ error: e.message })),
            client.getExpenses({ page: 1 }).catch(e => ({ error: e.message }))
          ]);

          const summary = {
            account: summaryAccount,
            recent_invoices: Array.isArray(summaryInvoices) ? summaryInvoices.slice(0, 5) : summaryInvoices,
            recent_expenses: Array.isArray(summaryExpenses) ? summaryExpenses.slice(0, 5) : summaryExpenses,
            generated_at: new Date().toISOString()
          };

          return {
            contents: [{
              uri,
              mimeType: 'application/json',
              text: JSON.stringify(summary, null, 2)
            }]
          };

        default:
          throw new Error(`Unknown resource URI: ${uri}`);
      }
    } catch (error: any) {
      // Return error information as resource content
      return {
        contents: [{
          uri,
          mimeType: 'application/json',
          text: JSON.stringify({ 
            error: error.message,
            uri,
            timestamp: new Date().toISOString()
          }, null, 2)
        }]
      };
    }
  });
} 