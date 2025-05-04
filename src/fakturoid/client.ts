import type { FakturoidClientConfig } from './client/_shared.js';
import * as users from './client/users.js';
import * as accounts from './client/accounts.js';
import * as invoices from './client/invoices.js';
import * as expenses from './client/expenses.js';

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

  // Invoices API
  getInvoices = (params?: any) => invoices.getInvoices(this.config, params);
  getInvoice = (id: number) => invoices.getInvoice(this.config, id);
  createInvoice = (invoice: any) => invoices.createInvoice(this.config, invoice);
  updateInvoice = (id: number, invoice: any) => invoices.updateInvoice(this.config, id, invoice);
  deleteInvoice = (id: number) => invoices.deleteInvoice(this.config, id);

  // Expenses API
  getExpenses = (params?: any) => expenses.getExpenses(this.config, params);
  getExpense = (id: number) => expenses.getExpense(this.config, id);
  createExpense = (expense: any) => expenses.createExpense(this.config, expense);
  updateExpense = (id: number, expense: any) => expenses.updateExpense(this.config, id, expense);
  deleteExpense = (id: number) => expenses.deleteExpense(this.config, id);
} 