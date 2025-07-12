import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { BankAccount } from "../model/bankAccount.js";
import { request } from "./request.js";

const getBankAccounts = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): ReturnType<typeof request<BankAccount[]>> => {
	return await request<BankAccount[]>(strategy, `/accounts/${accountSlug}/bank_accounts.json`, "GET");
};

export { getBankAccounts };
