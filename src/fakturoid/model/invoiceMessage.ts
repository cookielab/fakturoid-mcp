import { z } from "zod/v4";

const InvoiceMessageSchema = z.object({
	/**
	 * Deliver e-mail immediately if you are outside of the delivery times set in settings
	 * Default: false
	 *
	 * This option has effect only if you have set e-mail delivery window in Fakturoid
	 * settings and you are outside of the given times. If the delivery times are not set
	 * or you are in the given window e-mail are always sent immediately.
	 */
	deliver_now: z.boolean().optional(),

	/**
	 * Email address
	 * Default: Inherit from invoice subject
	 */
	email: z.string(),

	/**
	 * Email copy address
	 * Default: Inherit from invoice subject
	 */
	email_copy: z.string().optional(),

	/**
	 * Email message
	 * Default: Inherit from account settings
	 *
	 * Variables you can use:
	 * - #no# - Invoice number
	 * - #link# - Link to the webinvoice preview and print
	 * - #vs# - Invoice variable symbol
	 * - #price# - Total amount to pay
	 * - #due# - Due date
	 * - #overdue# - Number of days overdue
	 * - #bank# - Bank account number
	 * - #note# - Note
	 */
	message: z.string().optional(),
	/**
	 * Email subject
	 * Default: Inherit from account settings
	 */
	subject: z.string(),
});

type InvoiceMessage = z.infer<typeof InvoiceMessageSchema>;

export { InvoiceMessageSchema };
export type { InvoiceMessage };
