import type { User } from "../models/users.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request, withRetry } from "./_shared.ts";

export function getCurrentUser(config: FakturoidClientConfig): Promise<User> {
	return withRetry(() => request<User>(config, "/user.json"));
}
