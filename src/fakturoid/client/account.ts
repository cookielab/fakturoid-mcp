import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { Account } from "../model/account.js";
import { request } from "./request.js";

const getAccountDetail = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): ReturnType<typeof request<Account>> => {
	return await request<Account>(strategy, `/accounts/${accountSlug}/account.json`, "GET");
};

export { getAccountDetail };
