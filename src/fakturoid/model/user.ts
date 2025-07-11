import { z } from "zod/v4";

const USER_ALLOWED_SCOPE = ["reports", "expenses", "invoices"] as const;

const UserAccountSchema = z.object({
	/** List of allowed scopes for current user */
	allowed_scope: z.array(z.enum(USER_ALLOWED_SCOPE)).readonly(),

	/** Account logo URL */
	logo: z.string().readonly(),

	/** Account name */
	name: z.string().readonly(),

	/** Current user account permission */
	permission: z.string().readonly(),

	/** Account registration number */
	registration_no: z.string().readonly(),
	/** Account URL slug. Goes to `https://app.fakturoid.cz/api/v3/accounts/{slug}/…` */
	slug: z.string().readonly(),
});

const UserSchema = z.object({
	/** List of accounts the user has access to (Only on the `/user.json` endpoint) */
	accounts: z.array(UserAccountSchema).readonly(),

	/** List of allowed scopes */
	allowed_scope: z.array(z.enum(USER_ALLOWED_SCOPE)).readonly(),

	/** User avatar URL */
	avatar_url: z.string().nullable().readonly(),

	/** Default account slug (Only on the `/user.json` endpoint) */
	default_account: z.string().nullable().readonly(),

	/** User email */
	email: z.string().readonly(),

	/** User full name */
	full_name: z.string().readonly(),
	/** Unique identifier in Fakturoid */
	id: z.number().int().readonly(),

	/** User permission for the current account */
	permission: z.string().readonly(),
});

type User = z.infer<typeof UserSchema>;
type UserAccount = z.infer<typeof UserAccountSchema>;

export type { User, UserAccount };
export { UserSchema, UserAccountSchema, USER_ALLOWED_SCOPE };
