import { createTool, type ServerToolCreator } from "./common.js";

const getCurrentUser = createTool(
	"fakturoid_get_current_user",
	"Get Current User",
	"Retrieve information about the currently authenticated user",
	async (client) => {
		const currentUser = await client.getCurrentUser();

		return {
			content: [{ text: JSON.stringify(currentUser, null, 2), type: "text" }],
		};
	},
);

const getUsersForAccount = createTool(
	"fakturoid_get_users_for_account",
	"Get Users for Account",
	"Retrieve a list of all users associated with the current account",
	async (client) => {
		const users = await client.getUsersForAccount();

		return {
			content: [{ text: JSON.stringify(users, null, 2), type: "text" }],
		};
	},
);

const user = [getCurrentUser, getUsersForAccount] as const satisfies ServerToolCreator[];

export { user };
