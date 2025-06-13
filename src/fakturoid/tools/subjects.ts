import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "../client.ts";
import type { SubjectParams } from "../models/subjectParams.ts";
import { z } from "zod";

export function registerFakturoidSubjectsTools(server: McpServer, client: FakturoidClient) {
	server.tool(
		"fakturoid_get_subjects",
		{
			custom_id: z.string(),
			full_text: z.string(),
			page: z.number(),
			since: z.string(),
			until: z.string(),
			updated_since: z.string(),
			updated_until: z.string(),
		},
		async (params) => {
			try {
				const subjects = await client.getSubjects(params);
				return {
					content: [
						{
							text: JSON.stringify(subjects, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_get_subject",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				const subject = await client.getSubject(id);
				return {
					content: [
						{
							text: JSON.stringify(subject, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_create_subject",
		{
			subjectData: z
				.object({
					name: z.string(),
					type: z.enum(["company", "person", "government"]).optional(),
				})
				.passthrough(),
		},
		async ({ subjectData }) => {
			try {
				const subject = await client.createSubject(subjectData as SubjectParams);
				return {
					content: [
						{
							text: JSON.stringify(subject, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_update_subject",
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
							text: JSON.stringify(subject, null, 2),
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);

	server.tool(
		"fakturoid_delete_subject",
		{
			id: z.number(),
		},
		async ({ id }) => {
			try {
				await client.deleteSubject(id);
				return {
					content: [
						{
							text: "Subject deleted successfully",
							type: "text",
						},
					],
				};
			} catch (error: unknown) {
				const message = error instanceof Error ? error.message : String(error);

				return {
					content: [
						{
							text: `Error: ${message}`,
							type: "text",
						},
					],
				};
			}
		},
	);
}
