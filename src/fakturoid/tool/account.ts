import { createTool, type ServerToolCreator } from "./common.js";

const getAccountDetail = createTool(
	"fakturoid_get_account_detail",
	"Get Account Detail",
	"Retrieve detailed information about the current Fakturoid account including settings, limits, and configuration",
	async (client) => {
		const account = await client.getAccountDetail();

		return {
			content: [{ text: JSON.stringify(account, null, 2), type: "text" }],
		};
	},
);

const account = [getAccountDetail] as const satisfies ServerToolCreator[];

export { account };
