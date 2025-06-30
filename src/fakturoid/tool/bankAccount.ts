import { createTool, type ServerToolCreator } from "./common.ts";

const getBankAccounts = createTool("fakturoid_get_bank_accounts", async (client) => {
	const bankAccounts = await client.getBankAccounts();

	return {
		content: [{ text: JSON.stringify(bankAccounts, null, 2), type: "text" }],
	};
});

const bankAccount = [getBankAccounts] as const satisfies ServerToolCreator[];

export { bankAccount };
