import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const sendInvoiceMessage = createTool(
	"fakturoid_send_invoice_message",
	async (client, { accountSlug, invoiceId, messageData }) => {
		const result = await client.sendInvoiceMessage(accountSlug, invoiceId, messageData);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	z.object({
		accountSlug: z.string().min(1),
		invoiceId: z.number(),
		messageData: z.any(), // Using z.any() since InvoiceMessage type is not available here
	}),
);

const invoiceMessage = [sendInvoiceMessage] as const satisfies ServerToolCreator[];

export { invoiceMessage };
