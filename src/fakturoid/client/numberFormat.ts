import type { NumberFormat } from "../model/numberFormat.ts";
import type { FakturoidClientConfig } from "./auth.ts";
import { request } from "./request.ts";

const getNumberFormats = async (
	configuration: FakturoidClientConfig,
	accountSlug: string,
): ReturnType<typeof request<NumberFormat[]>> => {
	return await request(configuration, `/accounts/${accountSlug}/number_formats/invoices.json`, "GET");
};

export { getNumberFormats };
