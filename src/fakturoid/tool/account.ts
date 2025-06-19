import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getAccountDetail = createTool(
	"fakturoid_get_account_detail",
	async (client, { accountSlug }) => {
		const account = await client.getAccountDetail(accountSlug);

		return {
			content: [{ text: JSON.stringify(account, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const account = [getAccountDetail] as const satisfies ServerToolCreator[];

export { account };
