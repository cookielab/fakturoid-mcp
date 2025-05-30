import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from './client.js';
import {
  registerFakturoidUsersTools,
  registerFakturoidAccountsTools,
  registerFakturoidInvoicesTools,
  registerFakturoidExpensesTools,
  registerFakturoidSubjectsTools,
  registerFakturoidInvoicePaymentsTools,
  registerFakturoidExpensePaymentsTools,
  registerFakturoidInboxFilesTools,
} from './tools/index.js';

export function registerFakturoidTools(server: McpServer, client: FakturoidClient) {
  registerFakturoidUsersTools(server, client);
  registerFakturoidAccountsTools(server, client);
  registerFakturoidInvoicesTools(server, client);
  registerFakturoidExpensesTools(server, client);
  registerFakturoidSubjectsTools(server, client);
  registerFakturoidInvoicePaymentsTools(server, client);
  registerFakturoidExpensePaymentsTools(server, client);
  registerFakturoidInboxFilesTools(server, client);
} 