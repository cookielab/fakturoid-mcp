import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { Account } from "../model/account.ts";
import { request } from "./request.ts";

const getAccountDetail = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): ReturnType<typeof request<Account>> => {
	return await request<Account>(strategy, `/accounts/${accountSlug}/account.json`, "GET");
};

export { getAccountDetail };
