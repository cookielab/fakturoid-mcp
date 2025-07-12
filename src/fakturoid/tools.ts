import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { AuthenticationStrategy } from "../auth/strategy.js";
import type { FakturoidClient } from "./client.js";
import type { ServerToolCreator } from "./tool/common.js";
import { account } from "./tool/account.js";
import { bankAccount } from "./tool/bankAccount.js";
import { event } from "./tool/event.js";
import { expense } from "./tool/expense.js";
import { expensePayment } from "./tool/expensePayment.js";
import { generator } from "./tool/generator.js";
import { inboxFile } from "./tool/inboxFile.js";
import { inventoryItem } from "./tool/inventoryItem.js";
import { inventoryMove } from "./tool/inventoryMove.js";
import { invoice } from "./tool/invoice.js";
import { invoiceMessage } from "./tool/invoiceMessage.js";
import { invoicePayment } from "./tool/invoicePayment.js";
import { numberFormat } from "./tool/numberFormat.js";
import { recurringGenerator } from "./tool/recurringGenerator.js";
import { subject } from "./tool/subject.js";
import { todo } from "./tool/todo.js";
import { user } from "./tool/user.js";
import { webhook } from "./tool/webhook.js";

const registerFakturoidTools = <
	Configuration extends object = object,
	Strategy extends AuthenticationStrategy<Configuration> = AuthenticationStrategy<Configuration>,
>(
	server: McpServer,
	client: FakturoidClient<Configuration, Strategy>,
): void => {
	const tools: ServerToolCreator<Configuration, Strategy>[] = [
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
