import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from '../client.js';
import type { ExpensePaymentParams } from '../models.js';

export function registerFakturoidExpensePaymentsTools(server: McpServer, client: FakturoidClient) {
  server.tool(
    'fakturoid_get_expense_payments',
    {
      expenseId: z.number(),
      page: z.number().optional(),
    },
    async ({ expenseId, page }) => {
      try {
        const payments = await client.getExpensePayments(expenseId, { page });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payments, null, 2),
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
    'fakturoid_get_expense_payment',
    {
      expenseId: z.number(),
      paymentId: z.number(),
    },
    async ({ expenseId, paymentId }) => {
      try {
        const payment = await client.getExpensePayment(expenseId, paymentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payment, null, 2),
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
    'fakturoid_create_expense_payment',
    {
      expenseId: z.number(),
      paymentData: z.object({
        paid_on: z.string(),
        amount: z.number(),
        currency: z.string().optional(),
        payment_method: z.enum(['bank', 'cash', 'other']).optional(),
        note: z.string().optional(),
      }),
    },
    async ({ expenseId, paymentData }) => {
      try {
        const payment = await client.createExpensePayment(expenseId, paymentData as ExpensePaymentParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payment, null, 2),
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
    'fakturoid_update_expense_payment',
    {
      expenseId: z.number(),
      paymentId: z.number(),
      paymentData: z.object({
        paid_on: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
        payment_method: z.enum(['bank', 'cash', 'other']).optional(),
        note: z.string().optional(),
      }),
    },
    async ({ expenseId, paymentId, paymentData }) => {
      try {
        const payment = await client.updateExpensePayment(expenseId, paymentId, paymentData as Partial<ExpensePaymentParams>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payment, null, 2),
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
    'fakturoid_delete_expense_payment',
    {
      expenseId: z.number(),
      paymentId: z.number(),
    },
    async ({ expenseId, paymentId }) => {
      try {
        await client.deleteExpensePayment(expenseId, paymentId);
        return {
          content: [
            {
              type: 'text',
              text: 'Expense payment deleted successfully',
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