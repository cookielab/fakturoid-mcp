import { createTool, type ServerToolCreator } from "./common.js";

const getNumberFormats = createTool(
	"fakturoid_get_number_formats",
	"Get Number Formats",
	"Retrieve available number formats for invoices, expenses, and other documents",
	async (client) => {
		const numberFormats = await client.getNumberFormats();

		return {
			content: [{ text: JSON.stringify(numberFormats, null, 2), type: "text" }],
		};
	},
);

const numberFormat = [getNumberFormats] as const satisfies ServerToolCreator[];

export { numberFormat };
