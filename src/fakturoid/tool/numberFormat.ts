import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getNumberFormats = createTool(
	"fakturoid_get_number_formats",
	async (client, { accountSlug }) => {
		const numberFormats = await client.getNumberFormats(accountSlug);

		return {
			content: [{ text: JSON.stringify(numberFormats, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const numberFormat = [getNumberFormats] as const satisfies ServerToolCreator[];

export { numberFormat };
