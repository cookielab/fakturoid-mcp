import { z } from "zod/v3";
import type { AuthenticationStrategy } from "../../auth/strategy.js";
import { resolveAttachments } from "../../staging/resolver.js";
import type { FakturoidClient } from "../client.js";
import { CreateAttachmentToolSchema } from "../model/common.js";
import type { Invoice } from "../model/invoice.js";
import { CreateInvoiceSchema } from "../model/invoice.js";
import { createTool, type ServerToolCreator } from "./common.js";
import { resolveSubject, type SubjectResolution } from "./resolveSubject.js";

type SmartCreateInvoiceResult =
	| {
			status: "created" | "duplicate_found";
			subject: SubjectResolution;
			document: {
				data: Invoice;
				message?: string;
			};
	  }
	| Error;

const DUPLICATE_MESSAGE =
	"Document with this number already exists for this subject. Ask the user whether to update it or leave it as-is.";

const SmartCreateInvoiceInputSchema = CreateInvoiceSchema.omit({ subject_id: true }).extend({
	registration_no: z.string().describe("Registration number (IČO) of the subject"),
});

type SmartCreateInvoiceInput = z.infer<typeof SmartCreateInvoiceInputSchema>;

const executeSmartCreateInvoice = async <
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
>(
	client: FakturoidClient<Configuration, Strategy>,
	input: SmartCreateInvoiceInput,
): Promise<SmartCreateInvoiceResult> => {
	const { registration_no, ...invoiceData } = input;

	const subjectResult = await resolveSubject(client, registration_no, "customer");
	if (subjectResult instanceof Error) {
		return subjectResult;
	}

	const subjectId = subjectResult.data.id;

	if (invoiceData.number != null) {
		const existingInvoices = await client.getInvoices({
			subject_id: subjectId,
			number: invoiceData.number,
		});

		if (existingInvoices instanceof Error) {
			return new Error(`Invoice search failed: ${existingInvoices.message}`);
		}

		if (existingInvoices.length > 0) {
			return {
				status: "duplicate_found",
				subject: subjectResult,
				document: {
					data: existingInvoices[0] as Invoice,
					message: DUPLICATE_MESSAGE,
				},
			};
		}
	}

	const created = await client.createInvoice({
		...invoiceData,
		subject_id: subjectId,
	});

	if (created instanceof Error) {
		return new Error(`Invoice creation failed: ${created.message}`);
	}

	return {
		status: "created",
		subject: subjectResult,
		document: { data: created },
	};
};

const SmartCreateInvoiceToolSchema = SmartCreateInvoiceInputSchema.omit({ attachments: true }).extend({
	attachments: z.array(CreateAttachmentToolSchema).optional(),
});

const smartCreateInvoice = createTool(
	"fakturoid_smart_create_invoice",
	"Smart Create Invoice",
	"PREFERRED tool for creating invoices. Use this instead of fakturoid_create_invoice. Automatically resolves the subject by IČO (creates via ARES if not found), checks for duplicate invoice by number, and creates the invoice — all in one step. Only requires the subject's registration number (IČO) instead of subject_id. For attachments, provide file_ref (from curl upload to /upload - preferred), source_url, or data_url. Returns existing document with a message if duplicate is found.",
	async (client, input, staging) => {
		const resolvedAttachments = await resolveAttachments(input.attachments, staging);

		const result = await executeSmartCreateInvoice(client, {
			...input,
			attachments: resolvedAttachments,
		} as SmartCreateInvoiceInput);

		if (result instanceof Error) {
			return {
				content: [{ isError: true, text: result.message, type: "text" as const }],
			};
		}

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" as const }],
		};
	},
	SmartCreateInvoiceToolSchema.shape,
);

const smartInvoice = [smartCreateInvoice] as const satisfies ServerToolCreator[];

export { smartInvoice, executeSmartCreateInvoice };
