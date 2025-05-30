import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from '../client.js';
import type { ExpenseParams } from '../models.js';

export function registerFakturoidExpensesTools(server: McpServer, client: FakturoidClient) {
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