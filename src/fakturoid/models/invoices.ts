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