import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { Event } from "../model/event.js";
import { requestAllPages } from "./request.js";

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
