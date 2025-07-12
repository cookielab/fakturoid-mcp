import { createTool, type ServerToolCreator } from "./common.js";

const getBankAccounts = createTool(
	"fakturoid_get_bank_accounts",
	"Get Bank Accounts",
	"Retrieve a list of all bank accounts associated with the account",
	async (client) => {
		const bankAccounts = await client.getBankAccounts();

		return {
			content: [{ text: JSON.stringify(bankAccounts, null, 2), type: "text" }],
		};
	},
);

const bankAccount = [getBankAccounts] as const satisfies ServerToolCreator[];

export { bankAccount };
