// Subjects
export interface Subject {
	id: number;
	custom_id?: string;
	type: "company" | "person" | "government";
	name: string;
	street?: string;
	street2?: string;
	city?: string;
	zip?: string;
	country?: string;
	registration_no?: string;
	vat_no?: string;
	bank_account?: string;
	iban?: string;
	variable_symbol?: string;
	full_name?: string;
	email?: string;
	email_copy?: string;
	phone?: string;
	web?: string;
	private_note?: string;
	avatar_url?: string;
	html_url?: string;
	url?: string;
	updated_at: string;
	created_at: string;
}
