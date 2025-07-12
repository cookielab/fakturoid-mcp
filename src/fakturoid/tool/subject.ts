import { z } from "zod/v3";
import { GetSubjectsFiltersSchema, SubjectCreateSchema, SubjectUpdateSchema } from "../model/subject.js";
import { createTool, type ServerToolCreator } from "./common.js";

const getSubjects = createTool(
	"fakturoid_get_subjects",
	"Get Subjects",
	"Retrieve a list of subjects (customers and suppliers) with optional filtering",
	async (client, { filters }) => {
		const subjects = await client.getSubjects(filters);

		return {
			content: [{ text: JSON.stringify(subjects, null, 2), type: "text" }],
		};
	},
	{
		accountSlug: z.string().min(1),
		filters: GetSubjectsFiltersSchema.optional(),
	},
);

const searchSubjects = createTool(
	"fakturoid_search_subjects",
	"Search Subjects",
	"Search subjects (customers and suppliers) by text query",
	async (client, { query }) => {
		const subjects = await client.searchSubjects(query);

		return {
			content: [{ text: JSON.stringify(subjects, null, 2), type: "text" }],
		};
	},
	{
		query: z.string().optional(),
	},
);

const getSubjectDetail = createTool(
	"fakturoid_get_subject_detail",
	"Get Subject Detail",
	"Retrieve detailed information about a specific subject (customer or supplier) by its ID",
	async (client, { id }) => {
		const subject = await client.getSubjectDetail(id);

		return {
			content: [{ text: JSON.stringify(subject, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
	},
);

const createSubject = createTool(
	"fakturoid_create_subject",
	"Create Subject",
	"Create a new subject (customer or supplier) with the provided data",
	async (client, subjectData) => {
		const subject = await client.createSubject(subjectData);

		return {
			content: [{ text: JSON.stringify(subject, null, 2), type: "text" }],
		};
	},
	SubjectCreateSchema.shape,
);

const updateSubject = createTool(
	"fakturoid_update_subject",
	"Update Subject",
	"Update an existing subject (customer or supplier) with new data",
	async (client, { id, updateData }) => {
		const subject = await client.updateSubject(id, updateData);

		return {
			content: [{ text: JSON.stringify(subject, null, 2), type: "text" }],
		};
	},
	{
		id: z.number(),
		updateData: SubjectUpdateSchema,
	},
);

const deleteSubject = createTool(
	"fakturoid_delete_subject",
	"Delete Subject",
	"Delete a subject (customer or supplier) by its ID",
	async (client, { id }) => {
		await client.deleteSubject(id);

		return {
			content: [{ text: "Subject deleted successfully", type: "text" }],
		};
	},
	{
		id: z.number(),
	},
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
