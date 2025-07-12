import type { AuthenticationStrategy } from "../../auth/strategy.js";
import type { NumberFormat } from "../model/numberFormat.js";
import { request } from "./request.js";

const getNumberFormats = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): ReturnType<typeof request<NumberFormat[]>> => {
	return await request(strategy, `/accounts/${accountSlug}/number_formats/invoices.json`, "GET");
};

export { getNumberFormats };
