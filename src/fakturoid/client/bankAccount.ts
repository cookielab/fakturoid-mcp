import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { BankAccount } from "../model/bankAccount.ts";
import { request } from "./request.ts";

const getBankAccounts = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): ReturnType<typeof request<BankAccount[]>> => {
	return await request<BankAccount[]>(strategy, `/accounts/${accountSlug}/bank_accounts.json`, "GET");
};

export { getBankAccounts };
