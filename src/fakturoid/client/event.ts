import type { Event } from "../model/event.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { requestAllPages } from "./request.ts";

/**
 * Get all events.
 *
 * @see https://www.fakturoid.cz/api/v3/events#events-index
 *
 * @param configuration
 * @param accountSlug
 *
 * @returns List of all events.
 */
const getEvents = async (configuration: FakturoidClientConfig, accountSlug: string): Promise<Event[] | Error> => {
	const path = `/accounts/${accountSlug}/events.json`;

	return await requestAllPages(configuration, path);
};

export { getEvents };
