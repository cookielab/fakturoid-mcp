import type { BankAccount } from "../model/bankAccount.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request } from "./request.ts";

const getBankAccounts = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
): ReturnType<typeof request<BankAccount[]>> => {
	return await request<BankAccount[]>(configuration, `/accounts/${accountSlug}/bank_accounts.json`, "GET");
};

export { getBankAccounts };
