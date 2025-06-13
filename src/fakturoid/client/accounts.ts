import type { Account } from "../models/accounts.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { accountEndpoint, request, withRetry } from "./_shared.ts";

export function getAccount(config: FakturoidClientConfig): Promise<Account> {
	return withRetry(() => request<Account>(config, accountEndpoint(config, ".json")));
}

export function updateAccount(config: FakturoidClientConfig, accountData: Partial<Account>): Promise<Account> {
	return withRetry(() =>
		request<Account, Partial<Account>>(config, accountEndpoint(config, ".json"), "PATCH", accountData),
	);
}
