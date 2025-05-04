import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from './client.js';
import type { InvoiceParams, ExpenseParams } from './models.js';

/**
 * Registers Fakturoid MCP tools with the given server
 */
export function registerFakturoidTools(server: McpServer, client: FakturoidClient) {
  // ===== Users API =====
  server.tool('fakturoid_get_current_user', {}, async () => {
    try {
      const user = await client.getCurrentUser();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(user, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  });

  // ===== Accounts API =====
  server.tool('fakturoid_get_account', {}, async () => {
    try {
      const account = await client.getAccount();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(account, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error.message}`,
          },
        ],
      };
    }
  });

  server.tool(
    'fakturoid_update_account',
    {
      accountData: z.object({}).passthrough(),
    },
    async ({ accountData }) => {
      try {
        const account = await client.updateAccount(accountData);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(account, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  // ===== Invoices API =====
  server.tool(
    'fakturoid_get_invoices',
    {
      page: z.number().optional(),
      since: z.string().optional(),
      updated_since: z.string().optional(),
      until: z.string().optional(),
      updated_until: z.string().optional(),
      status: z.enum(['open', 'paid', 'overdue', 'cancelled']).optional(),
      subject_id: z.number().optional(),
    },
    async (params) => {
      try {
        const invoices = await client.getInvoices(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoices, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_get_invoice',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        const invoice = await client.getInvoice(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoice, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_create_invoice',
    {
      invoiceData: z.object({
        subject_id: z.number(),
        lines: z.array(
          z.object({
            name: z.string(),
            quantity: z.number(),
            unit_name: z.string().optional(),
            unit_price: z.number(),
            vat_rate: z.number(),
          }),
        ),
      }).passthrough(),
    },
    async ({ invoiceData }) => {
      try {
        const invoice = await client.createInvoice(invoiceData as InvoiceParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoice, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_update_invoice',
    {
      id: z.number(),
      invoiceData: z.object({}).passthrough(),
    },
    async ({ id, invoiceData }) => {
      try {
        const invoice = await client.updateInvoice(id, invoiceData as Partial<InvoiceParams>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(invoice, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_delete_invoice',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        await client.deleteInvoice(id);
        return {
          content: [
            {
              type: 'text',
              text: 'Invoice deleted successfully',
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  // ===== Expenses API =====
  server.tool(
    'fakturoid_get_expenses',
    {
      page: z.number().optional(),
      since: z.string().optional(),
      updated_since: z.string().optional(),
      until: z.string().optional(),
      updated_until: z.string().optional(),
      status: z.enum(['open', 'paid', 'overdue']).optional(),
    },
    async (params) => {
      try {
        const expenses = await client.getExpenses(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(expenses, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_get_expense',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        const expense = await client.getExpense(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(expense, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_create_expense',
    {
      expenseData: z.object({
        supplier_name: z.string(),
      }).passthrough(),
    },
    async ({ expenseData }) => {
      try {
        const expense = await client.createExpense(expenseData as ExpenseParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(expense, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_update_expense',
    {
      id: z.number(),
      expenseData: z.object({}).passthrough(),
    },
    async ({ id, expenseData }) => {
      try {
        const expense = await client.updateExpense(id, expenseData as Partial<ExpenseParams>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(expense, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );

  server.tool(
    'fakturoid_delete_expense',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        await client.deleteExpense(id);
        return {
          content: [
            {
              type: 'text',
              text: 'Expense deleted successfully',
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    },
  );
} 