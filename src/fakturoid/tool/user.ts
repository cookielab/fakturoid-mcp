import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getCurrentUser = createTool("fakturoid_get_current_user", async (client) => {
	const currentUser = await client.getCurrentUser();

	return {
		content: [{ text: JSON.stringify(currentUser, null, 2), type: "text" }],
	};
});

const getUsersForAccount = createTool(
	"fakturoid_get_users_for_account",
	async (client, { accountSlug }) => {
		const users = await client.getUsersForAccount(accountSlug);

		return {
			content: [{ text: JSON.stringify(users, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const user = [getCurrentUser, getUsersForAccount] as const satisfies ServerToolCreator[];

export { user };
