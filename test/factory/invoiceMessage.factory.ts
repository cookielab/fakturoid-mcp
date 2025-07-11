import type { InvoiceMessage } from "../../src/fakturoid/model/invoiceMessage";
import { copycat, type Input } from "@snaplet/copycat";

const createInvoiceMessage = (seed: Input, initial: Partial<InvoiceMessage> = {}): InvoiceMessage => {
	// biome-ignore-start lint/nursery/noSecrets: Not a secret
	const messageTemplates = [
		"Hello,\n\nPlease find attached invoice #no# for the amount of #price#.\n\nDue date: #due#\nVariable symbol: #vs#\nBank account: #bank#\n\nYou can view and pay the invoice online at #link#\n\nThank you for your business!\n\nBest regards",
		"Dear Client,\n\nWe are sending you invoice #no# in the amount of #price#.\n\nPayment is due on #due#. Please use variable symbol #vs# for the payment.\n\nOnline invoice: #link#\n\nThank you!",
		"Invoice #no# is ready for payment.\n\nAmount: #price#\nDue date: #due#\nVariable symbol: #vs#\n\nPay online: #link#\n\nNote: #note#",
		"Hi,\n\nPlease pay invoice #no# (amount: #price#) by #due#.\n\nUse variable symbol #vs# when making the payment to our account #bank#.\n\nView invoice: #link#\n\nThanks!",
		"Your invoice #no# is attached.\n\nAmount to pay: #price#\nPayment due: #due#\nVariable symbol: #vs#\n\nQuick payment link: #link#\n\nBest regards",
	] as const;
	// biome-ignore-end lint/nursery/noSecrets: Not a secret

	const subjectTemplates = [
		"Invoice #no# from {company_name}",
		"Invoice #no# - Amount #price#",
		"Payment Request - Invoice #no#",
		"Invoice #no# - Due #due#",
		"New Invoice #no# - Please Pay #price#",
		"Invoice #no# - Variable Symbol #vs#",
		"Payment Due: Invoice #no#",
		"Invoice #no# - Online Payment Available",
	] as const;

	const isReminderEmail = copycat.bool(`${seed}_is_reminder`);
	const hasEmailCopy = copycat.bool(`${seed}_has_email_copy`);
	const deliverNow = copycat.bool(`${seed}_deliver_now`);

	const reminderSubjectTemplates = [
		"Reminder: Invoice #no# - #overdue# days overdue",
		"Payment Reminder - Invoice #no#",
		"Overdue Invoice #no# - Please Pay #price#",
		"Urgent: Invoice #no# is #overdue# days overdue",
		"Final Notice: Invoice #no# - #price# overdue",
	] as const;

	// biome-ignore-start lint/nursery/noSecrets: Not a secret
	const reminderMessageTemplates = [
		"Dear Client,\n\nThis is a reminder that invoice #no# is now #overdue# days overdue.\n\nAmount: #price#\nOriginal due date: #due#\nVariable symbol: #vs#\n\nPlease pay as soon as possible: #link#\n\nContact us if you have any questions.\n\nBest regards",
		"Invoice #no# is #overdue# days overdue.\n\nAmount: #price#\nDue date: #due#\nVariable symbol: #vs#\n\nPay now: #link#\n\nPlease arrange payment immediately.",
		"OVERDUE NOTICE\n\nInvoice #no# is #overdue# days past due.\n\nAmount owed: #price#\nOriginal due date: #due#\nVariable symbol: #vs#\n\nImmediate payment required: #link#\n\nThank you",
	] as const;
	// biome-ignore-end lint/nursery/noSecrets: Not a secret

	const subject = isReminderEmail
		? copycat.oneOf(`${seed}_reminder_subject`, [...reminderSubjectTemplates])
		: copycat.oneOf(`${seed}_subject`, [...subjectTemplates]);

	const message = isReminderEmail
		? copycat.oneOf(`${seed}_reminder_message`, [...reminderMessageTemplates])
		: copycat.oneOf(`${seed}_message`, [...messageTemplates]);

	return {
		deliver_now: deliverNow,
		email: copycat.email(`${seed}_email`),
		email_copy: hasEmailCopy ? copycat.email(`${seed}_email_copy`) : undefined,
		message: message,
		subject: subject,

		...initial,
	};
};

export { createInvoiceMessage };
