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