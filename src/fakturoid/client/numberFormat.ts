import type { AuthenticationStrategy } from "../../auth/strategy.ts";
import type { NumberFormat } from "../model/numberFormat.ts";
import { request } from "./request.ts";

const getNumberFormats = async (
	strategy: AuthenticationStrategy,
	accountSlug: string,
): ReturnType<typeof request<NumberFormat[]>> => {
	return await request(strategy, `/accounts/${accountSlug}/number_formats/invoices.json`, "GET");
};

export { getNumberFormats };
