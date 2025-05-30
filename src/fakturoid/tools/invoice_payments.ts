import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from '../client.js';
import type { InvoicePaymentParams } from '../models.js';

export function registerFakturoidInvoicePaymentsTools(server: McpServer, client: FakturoidClient) {
  server.tool(
    'fakturoid_get_invoice_payments',
    {
      invoiceId: z.number(),
      page: z.number().optional(),
    },
    async ({ invoiceId, page }) => {
      try {
        const payments = await client.getInvoicePayments(invoiceId, { page });
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
    'fakturoid_get_invoice_payment',
    {
      invoiceId: z.number(),
      paymentId: z.number(),
    },
    async ({ invoiceId, paymentId }) => {
      try {
        const payment = await client.getInvoicePayment(invoiceId, paymentId);
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
    'fakturoid_create_invoice_payment',
    {
      invoiceId: z.number(),
      paymentData: z.object({
        paid_on: z.string(),
        amount: z.number(),
        currency: z.string().optional(),
        payment_method: z.enum(['bank', 'cash', 'cod', 'paypal', 'card', 'other']).optional(),
        note: z.string().optional(),
      }),
    },
    async ({ invoiceId, paymentData }) => {
      try {
        const payment = await client.createInvoicePayment(invoiceId, paymentData as InvoicePaymentParams);
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
    'fakturoid_update_invoice_payment',
    {
      invoiceId: z.number(),
      paymentId: z.number(),
      paymentData: z.object({
        paid_on: z.string().optional(),
        amount: z.number().optional(),
        currency: z.string().optional(),
        payment_method: z.enum(['bank', 'cash', 'cod', 'paypal', 'card', 'other']).optional(),
        note: z.string().optional(),
      }),
    },
    async ({ invoiceId, paymentId, paymentData }) => {
      try {
        const payment = await client.updateInvoicePayment(invoiceId, paymentId, paymentData as Partial<InvoicePaymentParams>);
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
    'fakturoid_delete_invoice_payment',
    {
      invoiceId: z.number(),
      paymentId: z.number(),
    },
    async ({ invoiceId, paymentId }) => {
      try {
        await client.deleteInvoicePayment(invoiceId, paymentId);
        return {
          content: [
            {
              type: 'text',
              text: 'Invoice payment deleted successfully',
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