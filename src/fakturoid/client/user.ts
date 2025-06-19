import type { User } from "../model/user.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request } from "./request.ts";

const getCurrentUser = async (
	configuration: Omit<FakturoidClientConfig, "accountSlug">,
): ReturnType<typeof request<User>> => {
	return await request<User>(configuration, "/user.json", "GET");
};

const getUsersForAccount = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
): ReturnType<typeof request<User[]>> => {
	return await request<User[]>(configuration, `/accounts/${accountSlug}/users.json`, "GET");
};

export { getCurrentUser, getUsersForAccount };
