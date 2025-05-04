import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from './client.js';
import {
  registerFakturoidUsersTools,
  registerFakturoidAccountsTools,
  registerFakturoidInvoicesTools,
  registerFakturoidExpensesTools,
} from './mcp/index.js';

export function registerFakturoidTools(server: McpServer, client: FakturoidClient) {
  registerFakturoidUsersTools(server, client);
  registerFakturoidAccountsTools(server, client);
  registerFakturoidInvoicesTools(server, client);
  registerFakturoidExpensesTools(server, client);
} 