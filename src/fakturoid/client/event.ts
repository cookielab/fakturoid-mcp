import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { Event } from "../model/event.ts";
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
const getEvents = async (strategy: AuthenticationStrategy, accountSlug: string): Promise<Event[] | Error> => {
	return await requestAllPages(strategy, `/accounts/${accountSlug}/events.json`);
};

export { getEvents };
