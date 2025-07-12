import { z } from "zod/v3";

const USER_ALLOWED_SCOPE = ["reports", "expenses", "invoices"] as const;

const UserAccountSchema = z.object({
	/** List of allowed scopes for current user */
	allowed_scope: z.array(z.enum(USER_ALLOWED_SCOPE)),

	/** Account logo URL */
	logo: z.string(),

	/** Account name */
	name: z.string(),

	/** Current user account permission */
	permission: z.string(),

	/** Account registration number */
	registration_no: z.string(),
	/** Account URL slug. Goes to `https://app.fakturoid.cz/api/v3/accounts/{slug}/…` */
	slug: z.string(),
});

const UserSchema = z.object({
	/** List of accounts the user has access to (Only on the `/user.json` endpoint) */
	accounts: z.array(UserAccountSchema),

	/** List of allowed scopes */
	allowed_scope: z.array(z.enum(USER_ALLOWED_SCOPE)),

	/** User avatar URL */
	avatar_url: z.string().nullable(),

	/** Default account slug (Only on the `/user.json` endpoint) */
	default_account: z.string().nullable(),

	/** User email */
	email: z.string(),

	/** User full name */
	full_name: z.string(),
	/** Unique identifier in Fakturoid */
	id: z.number().int(),

	/** User permission for the current account */
	permission: z.string(),
});

type User = z.infer<typeof UserSchema>;
type UserAccount = z.infer<typeof UserAccountSchema>;

export type { User, UserAccount };
export { UserSchema, UserAccountSchema, USER_ALLOWED_SCOPE };
