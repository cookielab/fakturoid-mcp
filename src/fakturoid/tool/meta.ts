import z from "zod/v3";
import { createTool, type ServerToolCreator } from "./common.js";

const getAvailableAccounts = createTool(
	"fakturoid_get_available_accounts",
	"Get Available Fakturoid Accounts",
	"Get the list of all available Fakturoid accounts.",
	async (client) => {
		const accounts = await client.getAvailableAccounts();

		return {
			content: [{ text: JSON.stringify(accounts, null, 2), type: "text" }],
		};
	},
	{},
);

const changeActiveAccount = createTool(
	"fakturoid_change_active_account",
	"Change the Active Fakturoid Account",
	"Change the account used to interact with the Fakturoid API using an account slug from the list of available accounts.",
	async (client, { accountSlug }) => {
		await client.changeAccountSlug(accountSlug);

		return {
			content: [{ text: "Account changed successfully", type: "text" }],
		};
	},
	{
		accountSlug: z.string().nonempty(),
	},
);

const meta = [getAvailableAccounts, changeActiveAccount] as const satisfies ServerToolCreator[];

export { meta };
