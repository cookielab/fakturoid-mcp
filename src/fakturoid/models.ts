export * from './models/index.js';

// Common types
export interface Pagination {
  page?: number;
}

// Users
export interface User {
  id: number;
  name: string;
  email: string;
  full_name: string;
  subdomain: string;
  updated_at: string;
  features?: {
    full_api_access?: boolean;
    expenses?: boolean;
    inventory?: boolean;
  };
}

// Accounts
export interface Account {
  name: string;
  full_name: string;
  registration_no: string;
  vat_no: string;
  vat_mode: string;
  vat_price_mode: string;
  company_name?: string;
  email?: string;
  phone?: string;
  web?: string;
  address_street?: string;
  address_street2?: string;
  address_city?: string;
  address_postcode?: string;
  address_country?: string;
  bank_account?: string;
  iban?: string;
  swift_bic?: string;
  currency?: string;
  unit_name?: string;
  vat_rate?: number;
  displayed_note?: string;
  invoice_note?: string;
  html_url?: string;
  url?: string;
  updated_at?: string;
  created_at?: string;
}

// Invoices
export interface Invoice {
  id: number;
  number: string;
  subject_id: number;
  status: string;
  issued_on: string;
  taxable_fulfillment_due: string;
  due_on: string;
  paid_on?: string;
  amount: number;
  currency: string;
  payment_method: string;
  html_url: string;
  public_html_url: string;
  updated_at: string;
  note?: string;
  attachment?: {
    file_name: string;
    content_type: string;
    download_url: string;
  };
  lines?: InvoiceLine[];
  tags?: string[];
}

export interface InvoiceLine {
  name: string;
  quantity: number;
  unit_name?: string;
  unit_price: number;
  vat_rate: number;
  amount?: number;
  unit_price_without_vat?: number;
  unit_price_with_vat?: number;
}

export interface InvoiceParams {
  subject_id: number;
  lines: InvoiceLine[];
  number?: string;
  number_format_id?: number;
  payment_method?: 'bank' | 'cash' | 'cod' | 'paypal' | 'card' | 'other';
  currency?: string;
  variable_symbol?: string;
  iban?: string;
  swift_bic?: string;
  issued_on?: string;
  taxable_fulfillment_due?: string;
  due_on?: string;
  note?: string;
  private_note?: string;
  tags?: string[];
  bank_account_id?: number;
  language?: string;
}

// Expenses
export interface Expense {
  id: number;
  number?: string;
  supplier_name: string;
  status: string;
  document_type?: 'invoice' | 'bill' | 'creditnote' | 'advancedinvoice' | 'other';
  paid_on?: string;
  taxable_fulfillment_due?: string;
  description?: string;
  total?: number;
  total_with_vat?: number;
  currency?: string;
  payment_method?: 'bank' | 'cash' | 'other';
  tags?: string[];
  attachment?: {
    file_name: string;
    content_type: string;
    download_url: string;
  };
  updated_at: string;
  created_at: string;
  lines?: ExpenseLine[];
}

export interface ExpenseLine {
  name?: string;
  amount?: number;
  amount_with_vat?: number;
  vat_rate?: number;
  vat_price_mode?: 'with_vat' | 'without_vat' | 'no_vat';
  quantity?: number;
  unit_price?: number;
  unit_price_with_vat?: number;
}

export interface ExpenseParams {
  supplier_name: string;
  description?: string;
  number?: string;
  original_number?: string;
  variable_symbol?: string;
  status?: 'paid' | 'overdue' | 'open';
  document_type?: 'invoice' | 'bill' | 'creditnote' | 'advancedinvoice' | 'other';
  issued_on?: string;
  taxable_fulfillment_due?: string;
  due_on?: string;
  paid_on?: string;
  currency?: string;
  total?: number;
  total_with_vat?: number;
  exchange_rate?: number;
  lines?: ExpenseLine[];
  tags?: string[];
  payment_method?: 'bank' | 'cash' | 'other';
  private_note?: string;
} 