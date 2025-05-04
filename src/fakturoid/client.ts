import type { FakturoidClientConfig } from './client/_shared.js';
import * as users from './client/users.js';
import * as accounts from './client/accounts.js';
import * as invoices from './client/invoices.js';
import * as expenses from './client/expenses.js';
import * as subjects from './client/subjects.js';
import * as invoicePayments from './client/invoice_payments.js';
import * as expensePayments from './client/expense_payments.js';
import * as inboxFiles from './client/inbox_files.js';

export class FakturoidClient {
  private config: FakturoidClientConfig;

  constructor(config: FakturoidClientConfig) {
    this.config = config;
  }

  // Users API
  getCurrentUser = () => users.getCurrentUser(this.config);

  // Accounts API
  getAccount = () => accounts.getAccount(this.config);
  updateAccount = (accountData: any) => accounts.updateAccount(this.config, accountData);

  // Subjects API
  getSubjects = (params?: any) => subjects.getSubjects(this.config, params);
  getSubject = (id: number) => subjects.getSubject(this.config, id);
  createSubject = (subject: any) => subjects.createSubject(this.config, subject);
  updateSubject = (id: number, subject: any) => subjects.updateSubject(this.config, id, subject);
  deleteSubject = (id: number) => subjects.deleteSubject(this.config, id);

  // Invoices API
  getInvoices = (params?: any) => invoices.getInvoices(this.config, params);
  getInvoice = (id: number) => invoices.getInvoice(this.config, id);
  createInvoice = (invoice: any) => invoices.createInvoice(this.config, invoice);
  updateInvoice = (id: number, invoice: any) => invoices.updateInvoice(this.config, id, invoice);
  deleteInvoice = (id: number) => invoices.deleteInvoice(this.config, id);

  // Invoice Payments API
  getInvoicePayments = (invoiceId: number, params?: any) => 
    invoicePayments.getInvoicePayments(this.config, invoiceId, params);
  getInvoicePayment = (invoiceId: number, paymentId: number) => 
    invoicePayments.getInvoicePayment(this.config, invoiceId, paymentId);
  createInvoicePayment = (invoiceId: number, payment: any) => 
    invoicePayments.createInvoicePayment(this.config, invoiceId, payment);
  updateInvoicePayment = (invoiceId: number, paymentId: number, payment: any) => 
    invoicePayments.updateInvoicePayment(this.config, invoiceId, paymentId, payment);
  deleteInvoicePayment = (invoiceId: number, paymentId: number) => 
    invoicePayments.deleteInvoicePayment(this.config, invoiceId, paymentId);

  // Expenses API
  getExpenses = (params?: any) => expenses.getExpenses(this.config, params);
  getExpense = (id: number) => expenses.getExpense(this.config, id);
  createExpense = (expense: any) => expenses.createExpense(this.config, expense);
  updateExpense = (id: number, expense: any) => expenses.updateExpense(this.config, id, expense);
  deleteExpense = (id: number) => expenses.deleteExpense(this.config, id);

  // Expense Payments API
  getExpensePayments = (expenseId: number, params?: any) => 
    expensePayments.getExpensePayments(this.config, expenseId, params);
  getExpensePayment = (expenseId: number, paymentId: number) => 
    expensePayments.getExpensePayment(this.config, expenseId, paymentId);
  createExpensePayment = (expenseId: number, payment: any) => 
    expensePayments.createExpensePayment(this.config, expenseId, payment);
  updateExpensePayment = (expenseId: number, paymentId: number, payment: any) => 
    expensePayments.updateExpensePayment(this.config, expenseId, paymentId, payment);
  deleteExpensePayment = (expenseId: number, paymentId: number) => 
    expensePayments.deleteExpensePayment(this.config, expenseId, paymentId);

  // Inbox Files API
  getInboxFiles = (params?: any) => inboxFiles.getInboxFiles(this.config, params);
  getInboxFile = (id: number) => inboxFiles.getInboxFile(this.config, id);
  createInboxFile = (file: any) => inboxFiles.createInboxFile(this.config, file);
  updateInboxFile = (id: number, fileData: any) => inboxFiles.updateInboxFile(this.config, id, fileData);
  deleteInboxFile = (id: number) => inboxFiles.deleteInboxFile(this.config, id);
} 