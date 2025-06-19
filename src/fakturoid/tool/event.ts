import { z } from "zod/v4";
import { createTool, type ServerToolCreator } from "./common.ts";

const getEvents = createTool(
	"fakturoid_get_events",
	async (client, { accountSlug }) => {
		const events = await client.getEvents(accountSlug);

		return {
			content: [{ text: JSON.stringify(events, null, 2), type: "text" }],
		};
	},
	z.object({ accountSlug: z.string().min(1) }),
);

const event = [getEvents] as const satisfies ServerToolCreator[];

export { event };
