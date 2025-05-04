import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from '../client.js';
import type { InboxFileParams } from '../models.js';

export function registerFakturoidInboxFilesTools(server: McpServer, client: FakturoidClient) {
  server.tool(
    'fakturoid_get_inbox_files',
    {
      page: z.number().optional(),
      since: z.string().optional(),
      updated_since: z.string().optional(),
      until: z.string().optional(),
      updated_until: z.string().optional(),
    },
    async (params) => {
      try {
        const files = await client.getInboxFiles(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(files, null, 2),
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
    'fakturoid_get_inbox_file',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        const file = await client.getInboxFile(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(file, null, 2),
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
    'fakturoid_create_inbox_file',
    {
      fileData: z.object({
        name: z.string().optional(),
        content: z.string(), // Base64 encoded content
        file_name: z.string(),
      }),
    },
    async ({ fileData }) => {
      try {
        const file = await client.createInboxFile(fileData as InboxFileParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(file, null, 2),
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
    'fakturoid_update_inbox_file',
    {
      id: z.number(),
      name: z.string(),
    },
    async ({ id, name }) => {
      try {
        const file = await client.updateInboxFile(id, { name });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(file, null, 2),
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
    'fakturoid_delete_inbox_file',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        await client.deleteInboxFile(id);
        return {
          content: [
            {
              type: 'text',
              text: 'Inbox file deleted successfully',
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