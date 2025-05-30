import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from '../client.js';

export function registerFakturoidAccountsTools(server: McpServer, client: FakturoidClient) {
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
} 