import fetch from 'node-fetch';
import { z } from 'zod';
import type {
  User,
  Account,
  Invoice,
  InvoiceParams,
  Expense,
  ExpenseParams,
  Pagination
} from './models.js';

// Base URL for Fakturoid API v3
const BASE_URL = 'https://app.fakturoid.cz/api/v3';

// Configuration interface
export interface FakturoidClientConfig {
  accountSlug: string;
  email: string;
  apiKey: string;
  appName: string;
  contactEmail: string;
}

// Error response schema
const ErrorResponseSchema = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
  errors: z.record(z.array(z.string())).optional(),
});

export class FakturoidClient {
  private config: FakturoidClientConfig;

  constructor(config: FakturoidClientConfig) {
    this.config = config;
  }

  // Common headers for all requests
  private getHeaders(contentType = true): Record<string, string> {
    const headers: Record<string, string> = {
      'User-Agent': `${this.config.appName} (${this.config.contactEmail})`,
      'Authorization': `Basic ${Buffer.from(`${this.config.email}:${this.config.apiKey}`).toString('base64')}`,
    };

    if (contentType) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
    data?: any,
    queryParams?: Record<string, string>
  ): Promise<T> {
    // Build URL with query parameters
    let url = `${BASE_URL}${endpoint}`;
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value);
        }
      });
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Set up request options
    const options: any = {
      method,
      headers: this.getHeaders(!!data),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    // Send request
    const response = await fetch(url, options);
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const body = isJson ? await response.json() : await response.text();

    // Handle errors
    if (!response.ok) {
      if (isJson) {
        const errorData = ErrorResponseSchema.parse(body);
        if (errorData.error && errorData.error_description) {
          throw new Error(`${errorData.error}: ${errorData.error_description}`);
        } else if (errorData.errors) {
          const messages = Object.entries(errorData.errors)
            .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
            .join('; ');
          throw new Error(`Validation error: ${messages}`);
        }
      }
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    return body as T;
  }

  // Helper method to build account-based endpoint
  private accountEndpoint(path: string): string {
    return `/accounts/${this.config.accountSlug}${path}`;
  }

  // Retry mechanism for rate limiting
  private async withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
    let retries = 0;
    while (true) {
      try {
        return await fn();
      } catch (error: any) {
        if (
          retries < maxRetries &&
          error.message?.includes('429 Too Many Requests')
        ) {
          // Exponential backoff
          const delay = Math.pow(2, retries) * 1000;
          console.warn(`Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          retries++;
        } else {
          throw error;
        }
      }
    }
  }

  // ===== Users API =====

  /**
   * Get the currently authenticated user
   */
  async getCurrentUser(): Promise<User> {
    return this.withRetry(() => this.request<User>('/user.json'));
  }

  // ===== Accounts API =====

  /**
   * Get the account details
   */
  async getAccount(): Promise<Account> {
    return this.withRetry(() => 
      this.request<Account>(this.accountEndpoint('.json'))
    );
  }

  /**
   * Update the account details
   */
  async updateAccount(accountData: Partial<Account>): Promise<Account> {
    return this.withRetry(() => 
      this.request<Account>(
        this.accountEndpoint('.json'), 
        'PATCH', 
        accountData
      )
    );
  }

  // ===== Invoices API =====

  /**
   * Get a list of invoices
   */
  async getInvoices(params?: Pagination & {
    since?: string;
    updated_since?: string;
    until?: string;
    updated_until?: string;
    status?: 'open' | 'paid' | 'overdue' | 'cancelled';
    subject_id?: number;
  }): Promise<Invoice[]> {
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams[key] = String(value);
        }
      });
    }
    
    return this.withRetry(() =>
      this.request<Invoice[]>(
        this.accountEndpoint('/invoices.json'),
        'GET',
        undefined,
        queryParams
      )
    );
  }

  /**
   * Get a single invoice
   */
  async getInvoice(id: number): Promise<Invoice> {
    return this.withRetry(() =>
      this.request<Invoice>(this.accountEndpoint(`/invoices/${id}.json`))
    );
  }

  /**
   * Create a new invoice
   */
  async createInvoice(invoice: InvoiceParams): Promise<Invoice> {
    return this.withRetry(() =>
      this.request<Invoice>(
        this.accountEndpoint('/invoices.json'),
        'POST',
        invoice
      )
    );
  }

  /**
   * Update an existing invoice
   */
  async updateInvoice(id: number, invoice: Partial<InvoiceParams>): Promise<Invoice> {
    return this.withRetry(() =>
      this.request<Invoice>(
        this.accountEndpoint(`/invoices/${id}.json`),
        'PATCH',
        invoice
      )
    );
  }

  /**
   * Delete an invoice
   */
  async deleteInvoice(id: number): Promise<void> {
    return this.withRetry(() =>
      this.request<void>(
        this.accountEndpoint(`/invoices/${id}.json`),
        'DELETE'
      )
    );
  }

  // ===== Expenses API =====

  /**
   * Get a list of expenses
   */
  async getExpenses(params?: Pagination & {
    since?: string;
    updated_since?: string;
    until?: string;
    updated_until?: string;
    status?: 'open' | 'paid' | 'overdue';
  }): Promise<Expense[]> {
    const queryParams: Record<string, string> = {};
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams[key] = String(value);
        }
      });
    }
    
    return this.withRetry(() =>
      this.request<Expense[]>(
        this.accountEndpoint('/expenses.json'),
        'GET',
        undefined,
        queryParams
      )
    );
  }

  /**
   * Get a single expense
   */
  async getExpense(id: number): Promise<Expense> {
    return this.withRetry(() =>
      this.request<Expense>(this.accountEndpoint(`/expenses/${id}.json`))
    );
  }

  /**
   * Create a new expense
   */
  async createExpense(expense: ExpenseParams): Promise<Expense> {
    return this.withRetry(() =>
      this.request<Expense>(
        this.accountEndpoint('/expenses.json'),
        'POST',
        expense
      )
    );
  }

  /**
   * Update an existing expense
   */
  async updateExpense(id: number, expense: Partial<ExpenseParams>): Promise<Expense> {
    return this.withRetry(() =>
      this.request<Expense>(
        this.accountEndpoint(`/expenses/${id}.json`),
        'PATCH',
        expense
      )
    );
  }

  /**
   * Delete an expense
   */
  async deleteExpense(id: number): Promise<void> {
    return this.withRetry(() =>
      this.request<void>(
        this.accountEndpoint(`/expenses/${id}.json`),
        'DELETE'
      )
    );
  }
} 