import { copycat, type Input } from "@snaplet/copycat";
import { USER_ALLOWED_SCOPE, type User, type UserAccount } from "../../src/fakturoid/model/user";

const createUserAccount = (seed: Input, initial: Partial<UserAccount> = {}): UserAccount => {
	const permissions = ["owner", "admin", "user", "viewer"] as const;
	const allowedScopeCount = copycat.int(`${seed}_scope_count`, { min: 1, max: 3 });
	const allowedScopes = copycat.someOf(
		`${seed}_scopes`,
		[allowedScopeCount, allowedScopeCount],
		[...USER_ALLOWED_SCOPE],
	);

	return {
		allowed_scope: allowedScopes,
		logo: copycat.url(`${seed}_logo`),
		name: copycat.username(`${seed}_name`),
		permission: copycat.oneOf(`${seed}_permission`, [...permissions]),
		registration_no: copycat.phoneNumber(`${seed}_registration_no`).replace(/\D/g, ""),
		slug: copycat.username(`${seed}_slug`).toLowerCase(),

		...initial,
	};
};

const createUser = (seed: Input, initial: Partial<User> = {}): User => {
	const permissions = ["owner", "admin", "user", "viewer"] as const;
	const allowedScopeCount = copycat.int(`${seed}_scope_count`, { min: 1, max: 3 });
	const allowedScopes = copycat.someOf(
		`${seed}_scopes`,
		[allowedScopeCount, allowedScopeCount],
		[...USER_ALLOWED_SCOPE],
	);

	const accountCount = copycat.int(`${seed}_account_count`, { min: 1, max: 5 });
	const accounts = Array.from({ length: accountCount }, (_, i) => createUserAccount(`${seed}_account_${i}`));

	return {
		accounts: accounts,
		allowed_scope: allowedScopes,
		avatar_url: copycat.bool(`${seed}_avatar_null`) ? null : copycat.url(`${seed}_avatar`),
		default_account: copycat.bool(`${seed}_default_account_null`)
			? null
			: copycat.username(`${seed}_default_account`).toLowerCase(),
		email: copycat.email(`${seed}_email`),
		full_name: copycat.fullName(`${seed}_full_name`),
		id: copycat.int(`${seed}_id`, { min: 1, max: 999_999 }),
		permission: copycat.oneOf(`${seed}_permission`, [...permissions]),

		...initial,
	};
};

export { createUser, createUserAccount };
