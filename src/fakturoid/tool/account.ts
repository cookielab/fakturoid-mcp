import { createTool, type ServerToolCreator } from "./common.ts";

const getAccountDetail = createTool("fakturoid_get_account_detail", async (client) => {
	const account = await client.getAccountDetail();

	return {
		content: [{ text: JSON.stringify(account, null, 2), type: "text" }],
	};
});

const account = [getAccountDetail] as const satisfies ServerToolCreator[];

export { account };
