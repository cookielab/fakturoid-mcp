import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { FakturoidClient } from "./client.ts";
import type { ServerToolCreator } from "./tool/common.ts";
import { account } from "./tool/account.ts";
import { bankAccount } from "./tool/bankAccount.ts";
import { event } from "./tool/event.ts";
import { expense } from "./tool/expense.ts";
import { expensePayment } from "./tool/expensePayment.ts";
import { generator } from "./tool/generator.ts";
import { inboxFile } from "./tool/inboxFile.ts";
import { inventoryItem } from "./tool/inventoryItem.ts";
import { inventoryMove } from "./tool/inventoryMove.ts";
import { invoice } from "./tool/invoice.ts";
import { invoiceMessage } from "./tool/invoiceMessage.ts";
import { invoicePayment } from "./tool/invoicePayment.ts";
import { numberFormat } from "./tool/numberFormat.ts";
import { recurringGenerator } from "./tool/recurringGenerator.ts";
import { subject } from "./tool/subject.ts";
import { todo } from "./tool/todo.ts";
import { user } from "./tool/user.ts";
import { webhook } from "./tool/webhook.ts";

const registerFakturoidTools = (server: McpServer, client: FakturoidClient): void => {
	const tools: ServerToolCreator[] = [
		account,
		bankAccount,
		event,
		expense,
		expensePayment,
		generator,
		inboxFile,
		inventoryItem,
		inventoryMove,
		invoice,
		invoiceMessage,
		invoicePayment,
		numberFormat,
		recurringGenerator,
		subject,
		todo,
		user,
		webhook,
	].flat();

	for (const registerTool of tools) {
		registerTool(server, client);
	}
};

export { registerFakturoidTools };
