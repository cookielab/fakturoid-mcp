import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from '../client.js';

export function registerFakturoidUsersTools(server: McpServer, client: FakturoidClient) {
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
} 