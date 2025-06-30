import { createTool, type ServerToolCreator } from "./common.ts";

const getEvents = createTool("fakturoid_get_events", async (client) => {
	const events = await client.getEvents();

	return {
		content: [{ text: JSON.stringify(events, null, 2), type: "text" }],
	};
});

const event = [getEvents] as const satisfies ServerToolCreator[];

export { event };
