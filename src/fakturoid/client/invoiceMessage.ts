import type { InvoiceMessage } from "../model/invoiceMessage.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request } from "./request.ts";

/**
 * Send an email message for an invoice.
 *
 * Messages are available only for paid plans.
 *
 * Available variables for the message:
 * - `#no#` - Invoice number
 * - `#link#` - Link to the webinvoice preview and print
 * - `#vs#` - Invoice variable symbol
 * - `#price#` - Total amount to pay
 * - `#due#` - Due date
 * - `#overdue#` - Number of days overdue
 * - `#bank#` - Bank account number
 * - `#note#` - Note
 *
 * @see https://www.fakturoid.cz/api/v3/invoice-messages#create-message
 *
 * @param configuration
 * @param accountSlug
 * @param invoiceId
 * @param messageData
 *
 * @returns Success or Error.
 */
const sendInvoiceMessage = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
	invoiceId: number,
	messageData: InvoiceMessage,
): ReturnType<typeof request<undefined, InvoiceMessage>> => {
	return await request(
		configuration,
		`/accounts/${accountSlug}/invoices/${invoiceId}/message.json`,
		"POST",
		messageData,
	);
};

export { sendInvoiceMessage };
