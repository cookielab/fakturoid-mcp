import { z } from "zod/v3";
import { InvoiceMessageSchema } from "../model/invoiceMessage.js";
import { createTool, type ServerToolCreator } from "./common.js";

const sendInvoiceMessage = createTool(
	"fakturoid_send_invoice_message",
	"Send Invoice Message",
	"Send a message (email) to the customer about an invoice",
	async (client, { invoiceId, messageData }) => {
		const result = await client.sendInvoiceMessage(invoiceId, messageData);

		return {
			content: [{ text: JSON.stringify(result, null, 2), type: "text" }],
		};
	},
	{
		invoiceId: z.number(),
		messageData: InvoiceMessageSchema,
	},
);

const invoiceMessage = [sendInvoiceMessage] as const satisfies ServerToolCreator[];

export { invoiceMessage };
