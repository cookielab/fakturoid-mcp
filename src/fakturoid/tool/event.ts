import { createTool, type ServerToolCreator } from "./common.js";

const getEvents = createTool(
	"fakturoid_get_events",
	"Get Events",
	"Retrieve a list of events (audit trail) showing activities and changes in the account",
	async (client) => {
		const events = await client.getEvents();

		return {
			content: [{ text: JSON.stringify(events, null, 2), type: "text" }],
		};
	},
);

const event = [getEvents] as const satisfies ServerToolCreator[];

export { event };
