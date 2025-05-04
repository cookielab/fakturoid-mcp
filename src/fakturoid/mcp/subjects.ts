import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FakturoidClient } from '../client.js';
import type { SubjectParams } from '../models.js';

export function registerFakturoidSubjectsTools(server: McpServer, client: FakturoidClient) {
  server.tool(
    'fakturoid_get_subjects',
    {
      page: z.number().optional(),
      since: z.string().optional(),
      updated_since: z.string().optional(),
      until: z.string().optional(),
      updated_until: z.string().optional(),
      custom_id: z.string().optional(),
      full_text: z.string().optional(),
    },
    async (params) => {
      try {
        const subjects = await client.getSubjects(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(subjects, null, 2),
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
    'fakturoid_get_subject',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        const subject = await client.getSubject(id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(subject, null, 2),
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
    'fakturoid_create_subject',
    {
      subjectData: z.object({
        name: z.string(),
        type: z.enum(['company', 'person', 'government']).optional(),
      }).passthrough(),
    },
    async ({ subjectData }) => {
      try {
        const subject = await client.createSubject(subjectData as SubjectParams);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(subject, null, 2),
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
    'fakturoid_update_subject',
    {
      id: z.number(),
      subjectData: z.object({}).passthrough(),
    },
    async ({ id, subjectData }) => {
      try {
        const subject = await client.updateSubject(id, subjectData as Partial<SubjectParams>);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(subject, null, 2),
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
    'fakturoid_delete_subject',
    {
      id: z.number(),
    },
    async ({ id }) => {
      try {
        await client.deleteSubject(id);
        return {
          content: [
            {
              type: 'text',
              text: 'Subject deleted successfully',
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