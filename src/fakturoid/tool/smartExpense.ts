import { z } from "zod/v3";
import type { AuthenticationStrategy } from "../../auth/strategy.js";
import { resolveAttachments } from "../../staging/resolver.js";
import type { FakturoidClient } from "../client.js";
import { CreateAttachmentToolSchema } from "../model/common.js";
import type { Expense } from "../model/expense.js";
import { CreateExpenseSchema } from "../model/expense.js";
import { createTool, type ServerToolCreator } from "./common.js";
import { resolveSubject, type SubjectResolution } from "./resolveSubject.js";

type SmartCreateExpenseResult =
	| {
			status: "created" | "duplicate_found";
			subject: SubjectResolution;
			document: {
				data: Expense;
				message?: string;
			};
	  }
	| Error;

const DUPLICATE_MESSAGE =
	"Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is.";

const SmartCreateExpenseInputSchema = CreateExpenseSchema.omit({ subject_id: true }).extend({
	registration_no: z.string().describe("Registration number (IČO) of the subject"),
});

type SmartCreateExpenseInput = z.infer<typeof SmartCreateExpenseInputSchema>;

const executeSmartCreateExpense = async <
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
>(
	client: FakturoidClient<Configuration, Strategy>,
	input: SmartCreateExpenseInput,
): Promise<SmartCreateExpenseResult> => {
	const { registration_no, ...expenseData } = input;

	const subjectResult = await resolveSubject(client, registration_no, "supplier");
	if (subjectResult instanceof Error) {
		return subjectResult;
	}

	const subjectId = subjectResult.data.id;

	if (expenseData.original_number != null) {
		const existingExpenses = await client.getExpenses({
			subject_id: subjectId,
		});

		if (existingExpenses instanceof Error) {
			return new Error(`Expense search failed: ${existingExpenses.message}`);
		}

		const duplicate = existingExpenses.find((e) => e.original_number === expenseData.original_number);

		if (duplicate != null) {
			return {
				status: "duplicate_found",
				subject: subjectResult,
				document: {
					data: duplicate as Expense,
					message: DUPLICATE_MESSAGE,
				},
			};
		}
	}

	const created = await client.createExpense({
		...expenseData,
		subject_id: subjectId,
	});

	if (created instanceof Error) {
		return new Error(`Expense creation failed: ${created.message}`);
	}

	return {
		status: "created",
		subject: subjectResult,
		document: { data: created },
	};
};

const SmartCreateExpenseToolSchema = SmartCreateExpenseInputSchema.omit({ attachments: true }).extend({
	attachments: z.array(CreateAttachmentToolSchema).optional(),
});

const smartCreateExpense = createTool(
	"fakturoid_smart_create_expense",
	"Smart Create Expense",
	"PREFERRED tool for creating expenses. Use this instead of fakturoid_create_expense. Automatically resolves the subject by IČO (creates via ARES if not found), checks for duplicate expense by original number, and creates the expense — all in one step. Only requires the subject's registration number (IČO) instead of subject_id. For attachments, provide file_ref (from curl upload to /upload - preferred), source_url, or data_url. Returns existing document with a message if duplicate is found.",
	async (client, input, staging) => {
		const resolvedAttachments = await resolveAttachments(input.attachments, staging);

		const result = await executeSmartCreateExpense(client, {
			...input,
			attachments: resolvedAttachments,
		} as SmartCreateExpenseInput);

		if (result instanceof Error) {
			return {
				content: [{ isError: true, text: result.message, type: "text" as const }],
			};
		}

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" as const }],
		};
	},
	SmartCreateExpenseToolSchema.shape,
);

const smartExpense = [smartCreateExpense] as const satisfies ServerToolCreator[];

export { smartExpense, executeSmartCreateExpense };
