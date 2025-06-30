import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { User } from "../model/user.ts";
import { request } from "./request.ts";

const getCurrentUser = async (strategy: AuthenticationStrategy): ReturnType<typeof request<User>> => {
	return await request<User>(strategy, "/user.json", "GET");
};

const getUsersForAccount = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): ReturnType<typeof request<User[]>> => {
	return await request<User[]>(strategy, `/accounts/${accountSlug}/users.json`, "GET");
};

export { getCurrentUser, getUsersForAccount };
