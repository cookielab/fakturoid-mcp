import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "./client.ts";
import { registerFakturoidAccountsTools } from "./tools/accounts.ts";
import { registerFakturoidExpensePaymentsTools } from "./tools/expense_payments.ts";
import { registerFakturoidExpensesTools } from "./tools/expenses.ts";
import { registerFakturoidInboxFilesTools } from "./tools/inbox_files.ts";
import { registerFakturoidInvoicePaymentsTools } from "./tools/invoice_payments.ts";
import { registerFakturoidInvoicesTools } from "./tools/invoices.ts";
import { registerFakturoidSubjectsTools } from "./tools/subjects.ts";
import { registerFakturoidUsersTools } from "./tools/users.ts";

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
