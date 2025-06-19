import type { Account } from "../model/account.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request } from "./request.ts";

const getAccountDetail = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
): ReturnType<typeof request<Account>> => {
	return await request<Account>(configuration, `/accounts/${accountSlug}/account.json`, "GET");
};

export { getAccountDetail };
