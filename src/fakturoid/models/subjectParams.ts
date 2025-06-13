export interface SubjectParams {
	name: string;
	type?: "company" | "person" | "government";
	custom_id?: string;
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
}
