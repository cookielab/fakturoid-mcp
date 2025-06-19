import { z } from "zod/v4";
import { GetSubjectsFiltersSchema } from "../model/subject.ts";
import { createTool, type ServerToolCreator } from "./common.ts";

const getSubjects = createTool(
	"fakturoid_get_subjects",
	async (client, { accountSlug, filters }) => {
		const subjects = await client.getSubjects(accountSlug, filters);

		return {
			content: [{ text: JSON.stringify(subjects, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		filters: GetSubjectsFiltersSchema.optional(),
	}),
);

const searchSubjects = createTool(
	"fakturoid_search_subjects",
	async (client, { accountSlug, query }) => {
		const subjects = await client.searchSubjects(accountSlug, query);

		return {
			content: [{ text: JSON.stringify(subjects, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		query: z.string().optional(),
	}),
);

const getSubjectDetail = createTool(
	"fakturoid_get_subject_detail",
	async (client, { accountSlug, id }) => {
		const subject = await client.getSubjectDetail(accountSlug, id);

		return {
			content: [{ text: JSON.stringify(subject, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const createSubject = createTool(
	"fakturoid_create_subject",
	async (client, { accountSlug, subjectData }) => {
		const subject = await client.createSubject(accountSlug, subjectData);

		return {
			content: [{ text: JSON.stringify(subject, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		subjectData: z.any(), // Using z.any() since SubjectCreate type is not available here
	}),
);

const updateSubject = createTool(
	"fakturoid_update_subject",
	async (client, { accountSlug, id, updateData }) => {
		const subject = await client.updateSubject(accountSlug, id, updateData);

		return {
			content: [{ text: JSON.stringify(subject, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
		updateData: z.any(), // Using z.any() since SubjectUpdate type is not available here
	}),
);

const deleteSubject = createTool(
	"fakturoid_delete_subject",
	async (client, { accountSlug, id }) => {
		await client.deleteSubject(accountSlug, id);

		return {
			content: [{ text: "Subject deleted successfully", type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		id: z.number(),
	}),
);

const subject = [
	getSubjects,
	searchSubjects,
	getSubjectDetail,
	createSubject,
	updateSubject,
	deleteSubject,
] as const satisfies ServerToolCreator[];

export { subject };
