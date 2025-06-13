import type { FakturoidClientConfig } from "./client/_shared.ts";
import type { GetExpensesParameters } from "./client/expenses.ts";
import type { GetInboxFilesParameters } from "./client/inbox_files.ts";
import type { GetInvoicesParameters } from "./client/invoices.ts";
import type { GetSubjectParameters } from "./client/subjects.ts";
import type { Account } from "./models/accounts.ts";
import type { ExpensePaymentParams } from "./models/expensePaymentParams.ts";
import type { ExpenseParams } from "./models/expenses.ts";
import type { InboxFileParams } from "./models/inboxFileParams.ts";
import type { InvoicePaymentParams } from "./models/invoicePaymentParams.ts";
import type { InvoiceParams } from "./models/invoices.ts";
import type { Pagination } from "./models/pagination.ts";
import type { SubjectParams } from "./models/subjectParams.ts";
// TODO: Remove
// biome-ignore-start lint/performance/noNamespaceImport: Disabled for now
import * as accounts from "./client/accounts.ts";
import * as expensePayments from "./client/expense_payments.ts";
import * as expenses from "./client/expenses.ts";
import * as inboxFiles from "./client/inbox_files.ts";
import * as invoicePayments from "./client/invoice_payments.ts";
import * as invoices from "./client/invoices.ts";
import * as subjects from "./client/subjects.ts";
import * as users from "./client/users.ts";
// biome-ignore-end lint/performance/noNamespaceImport: Disabled for now

export class FakturoidClient {
	private config: FakturoidClientConfig;

	constructor(config: FakturoidClientConfig) {
		this.config = config;
	}

	// Users API
	getCurrentUser = () => users.getCurrentUser(this.config);

	// Accounts API
	getAccount = () => accounts.getAccount(this.config);
	updateAccount = (accountData: Partial<Account>) => accounts.updateAccount(this.config, accountData);

	// Subjects API
	getSubjects = (params?: GetSubjectParameters) => subjects.getSubjects(this.config, params);
	getSubject = (id: number) => subjects.getSubject(this.config, id);
	createSubject = (subject: SubjectParams) => subjects.createSubject(this.config, subject);
	updateSubject = (id: number, subject: Partial<SubjectParams>) => subjects.updateSubject(this.config, id, subject);
	deleteSubject = (id: number) => subjects.deleteSubject(this.config, id);

	// Invoices API
	getInvoices = (params?: GetInvoicesParameters) => invoices.getInvoices(this.config, params);
	getInvoice = (id: number) => invoices.getInvoice(this.config, id);
	createInvoice = (invoice: InvoiceParams) => invoices.createInvoice(this.config, invoice);
	updateInvoice = (id: number, invoice: Partial<InvoiceParams>) => invoices.updateInvoice(this.config, id, invoice);
	deleteInvoice = (id: number) => invoices.deleteInvoice(this.config, id);

	// Invoice Payments API
	getInvoicePayments = (invoiceId: number, params?: Pagination) =>
		invoicePayments.getInvoicePayments(this.config, invoiceId, params);
	getInvoicePayment = (invoiceId: number, paymentId: number) =>
		invoicePayments.getInvoicePayment(this.config, invoiceId, paymentId);
	createInvoicePayment = (invoiceId: number, payment: InvoicePaymentParams) =>
		invoicePayments.createInvoicePayment(this.config, invoiceId, payment);
	updateInvoicePayment = (invoiceId: number, paymentId: number, payment: Partial<InvoicePaymentParams>) =>
		invoicePayments.updateInvoicePayment(this.config, invoiceId, paymentId, payment);
	deleteInvoicePayment = (invoiceId: number, paymentId: number) =>
		invoicePayments.deleteInvoicePayment(this.config, invoiceId, paymentId);

	// Expenses API
	getExpenses = (params?: GetExpensesParameters) => expenses.getExpenses(this.config, params);
	getExpense = (id: number) => expenses.getExpense(this.config, id);
	createExpense = (expense: ExpenseParams) => expenses.createExpense(this.config, expense);
	updateExpense = (id: number, expense: Partial<ExpenseParams>) => expenses.updateExpense(this.config, id, expense);
	deleteExpense = (id: number) => expenses.deleteExpense(this.config, id);

	// Expense Payments API
	getExpensePayments = (expenseId: number, params?: Pagination) =>
		expensePayments.getExpensePayments(this.config, expenseId, params);
	getExpensePayment = (expenseId: number, paymentId: number) =>
		expensePayments.getExpensePayment(this.config, expenseId, paymentId);
	createExpensePayment = (expenseId: number, payment: ExpensePaymentParams) =>
		expensePayments.createExpensePayment(this.config, expenseId, payment);
	updateExpensePayment = (expenseId: number, paymentId: number, payment: Partial<ExpensePaymentParams>) =>
		expensePayments.updateExpensePayment(this.config, expenseId, paymentId, payment);
	deleteExpensePayment = (expenseId: number, paymentId: number) =>
		expensePayments.deleteExpensePayment(this.config, expenseId, paymentId);

	// Inbox Files API
	getInboxFiles = (params?: GetInboxFilesParameters) => inboxFiles.getInboxFiles(this.config, params);
	getInboxFile = (id: number) => inboxFiles.getInboxFile(this.config, id);
	createInboxFile = (file: InboxFileParams) => inboxFiles.createInboxFile(this.config, file);
	updateInboxFile = (id: number, fileData: { name: string }) => inboxFiles.updateInboxFile(this.config, id, fileData);
	deleteInboxFile = (id: number) => inboxFiles.deleteInboxFile(this.config, id);
}
