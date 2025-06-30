import type { AuthenticationStrategy } from "../auth/strategy.ts";
import type { CreateExpense, GetExpenseFilters, UpdateExpense } from "./model/expense.ts";
import type { CreateExpensePayment } from "./model/expensePayment.ts";
import type { CreateGenerator, UpdateGenerator } from "./model/generator.ts";
import type { CreateInboxFile } from "./model/inboxFile.ts";
import type { CreateInventoryItem, UpdateInventoryItem } from "./model/inventoryItem.ts";
import type { CreateInventoryMove, UpdateInventoryMove } from "./model/inventoryMove.ts";
import type { CreateInvoice, GetInvoicesFilters, UpdateInvoice } from "./model/invoice.ts";
import type { InvoiceMessage } from "./model/invoiceMessage.ts";
import type { CreateInvoicePayment } from "./model/invoicePayment.ts";
import type { CreateRecurringGenerator, UpdateRecurringGenerator } from "./model/recurringGenerator.ts";
import type { GetSubjectsFilters, SubjectCreate, SubjectUpdate } from "./model/subject.ts";
import type { CreateWebhook, UpdateWebhook } from "./model/webhook.ts";
import { getAccountDetail } from "./client/account.ts";
import { getBankAccounts } from "./client/bankAccount.ts";
import { getEvents } from "./client/event.ts";
import {
	createExpense,
	deleteExpense,
	downloadExpenseAttachment,
	fireExpenseAction,
	getExpenseDetail,
	getExpenses,
	searchExpenses,
	updateExpense,
} from "./client/expense.ts";
import { createExpensePayment, deleteExpensePayment } from "./client/expensePayment.ts";
import { createGenerator, deleteGenerator, getGenerator, getGenerators, updateGenerator } from "./client/generator.ts";
import {
	createInboxFile,
	deleteInboxFile,
	downloadInboxFile,
	getInboxFiles,
	sendInboxFileToOcr,
} from "./client/inboxFile.ts";
import {
	archiveInventoryItem,
	createInventoryItem,
	deleteInventoryItem,
	getInventoryItem,
	getInventoryItems,
	unarchiveInventoryItem,
	updateInventoryItem,
} from "./client/inventoryItem.ts";
import {
	createInventoryMove,
	deleteInventoryMove,
	getInventoryMove,
	getInventoryMoves,
	updateInventoryMove,
} from "./client/inventoryMove.ts";
import {
	createInvoice,
	deleteInvoice,
	downloadInvoiceAttachment,
	downloadInvoicePDF,
	fireInvoiceAction,
	getInvoiceDetail,
	getInvoices,
	searchInvoices,
	updateInvoice,
} from "./client/invoice.ts";
import { sendInvoiceMessage } from "./client/invoiceMessage.ts";
import { createInvoicePayment, createTaxDocument, deleteInvoicePayment } from "./client/invoicePayment.ts";
import { getNumberFormats } from "./client/numberFormat.ts";
import {
	createRecurringGenerator,
	deleteRecurringGenerator,
	getRecurringGenerator,
	getRecurringGenerators,
	updateRecurringGenerator,
} from "./client/recurringGenerator.ts";
import {
	createSubject,
	deleteSubject,
	getSubjectDetail,
	getSubjects,
	searchSubjects,
	updateSubject,
} from "./client/subject.ts";
import { getTodos, toggleTodoCompletion } from "./client/todo.ts";
import { getCurrentUser, getUsersForAccount } from "./client/user.ts";
import { createWebhook, deleteWebhook, getWebhook, getWebhooks, updateWebhook } from "./client/webhook.ts";

export class FakturoidClient<Configuration extends object, Strategy extends AuthenticationStrategy<Configuration>> {
	private readonly strategy: Strategy;
	private readonly accountSlug: string;

	private constructor(strategy: Strategy, accountSlug: string) {
		this.strategy = strategy;
		this.accountSlug = accountSlug;
	}

	static async create<
		StaticConfiguration extends object,
		StaticStrategy extends AuthenticationStrategy<StaticConfiguration>,
	>(strategy: StaticStrategy): Promise<FakturoidClient<StaticConfiguration, StaticStrategy>> {
		const user = await getCurrentUser(strategy);
		if (user instanceof Error || user.accounts[0] == null) {
			throw new Error("The user account could not be found.");
		}

		return new FakturoidClient(strategy, user.accounts[0].slug);
	}

	// Account
	getAccountDetail = () => getAccountDetail(this.strategy, this.accountSlug);

	// Bank Account
	getBankAccounts = () => getBankAccounts(this.strategy, this.accountSlug);

	// Event
	getEvents = () => getEvents(this.strategy, this.accountSlug);

	// Expense
	getExpenses = (filters?: GetExpenseFilters) => getExpenses(this.strategy, this.accountSlug, filters);
	searchExpenses = (query?: string, tags?: string[]) => searchExpenses(this.strategy, this.accountSlug, query, tags);
	getExpenseDetail = (id: number) => getExpenseDetail(this.strategy, this.accountSlug, id);
	downloadExpenseAttachment = (expenseId: number, attachmentId: number) =>
		downloadExpenseAttachment(this.strategy, this.accountSlug, expenseId, attachmentId);
	fireExpenseAction = (id: number, event: "lock" | "unlock") =>
		fireExpenseAction(this.strategy, this.accountSlug, id, event);
	createExpense = (expenseData: CreateExpense) => createExpense(this.strategy, this.accountSlug, expenseData);
	updateExpense = (id: number, updateData: UpdateExpense) =>
		updateExpense(this.strategy, this.accountSlug, id, updateData);
	deleteExpense = (id: number) => deleteExpense(this.strategy, this.accountSlug, id);

	// Expense Payment
	createExpensePayment = (expenseId: number, paymentData: CreateExpensePayment) =>
		createExpensePayment(this.strategy, this.accountSlug, expenseId, paymentData);
	deleteExpensePayment = (expenseId: number, paymentId: number) =>
		deleteExpensePayment(this.strategy, this.accountSlug, expenseId, paymentId);

	// Generator
	getGenerators = () => getGenerators(this.strategy, this.accountSlug);
	getGenerator = (id: number) => getGenerator(this.strategy, this.accountSlug, id);
	createGenerator = (generatorData: CreateGenerator) => createGenerator(this.strategy, this.accountSlug, generatorData);
	updateGenerator = (id: number, generatorData: UpdateGenerator) =>
		updateGenerator(this.strategy, this.accountSlug, id, generatorData);
	deleteGenerator = (id: number) => deleteGenerator(this.strategy, this.accountSlug, id);

	// Inbox File
	getInboxFiles = () => getInboxFiles(this.strategy, this.accountSlug);
	createInboxFile = (inboxFileData: CreateInboxFile) => createInboxFile(this.strategy, this.accountSlug, inboxFileData);
	sendInboxFileToOcr = (id: number) => sendInboxFileToOcr(this.strategy, this.accountSlug, id);
	downloadInboxFile = (id: number) => downloadInboxFile(this.strategy, this.accountSlug, id);
	deleteInboxFile = (id: number) => deleteInboxFile(this.strategy, this.accountSlug, id);

	// Inventory Item
	getInventoryItems = () => getInventoryItems(this.strategy, this.accountSlug);
	getInventoryItem = (id: number) => getInventoryItem(this.strategy, this.accountSlug, id);
	createInventoryItem = (inventoryItemData: CreateInventoryItem) =>
		createInventoryItem(this.strategy, this.accountSlug, inventoryItemData);
	updateInventoryItem = (id: number, inventoryItemData: UpdateInventoryItem) =>
		updateInventoryItem(this.strategy, this.accountSlug, id, inventoryItemData);
	deleteInventoryItem = (id: number) => deleteInventoryItem(this.strategy, this.accountSlug, id);
	archiveInventoryItem = (id: number) => archiveInventoryItem(this.strategy, this.accountSlug, id);
	unarchiveInventoryItem = (id: number) => unarchiveInventoryItem(this.strategy, this.accountSlug, id);

	// Inventory Move
	getInventoryMoves = (inventoryItemId: number) => getInventoryMoves(this.strategy, this.accountSlug, inventoryItemId);
	getInventoryMove = (inventoryItemId: number, id: number) =>
		getInventoryMove(this.strategy, this.accountSlug, inventoryItemId, id);
	createInventoryMove = (inventoryItemId: number, inventoryMoveData: CreateInventoryMove) =>
		createInventoryMove(this.strategy, this.accountSlug, inventoryItemId, inventoryMoveData);
	updateInventoryMove = (inventoryItemId: number, id: number, inventoryMoveData: UpdateInventoryMove) =>
		updateInventoryMove(this.strategy, this.accountSlug, inventoryItemId, id, inventoryMoveData);
	deleteInventoryMove = (inventoryItemId: number, id: number) =>
		deleteInventoryMove(this.strategy, this.accountSlug, inventoryItemId, id);

	// Invoice
	getInvoices = (filters?: GetInvoicesFilters) => getInvoices(this.strategy, this.accountSlug, filters);
	searchInvoices = (query?: string, tags?: string[]) => searchInvoices(this.strategy, this.accountSlug, query, tags);
	getInvoiceDetail = (id: number) => getInvoiceDetail(this.strategy, this.accountSlug, id);
	downloadInvoicePDF = (id: number) => downloadInvoicePDF(this.strategy, this.accountSlug, id);
	downloadInvoiceAttachment = (invoiceId: number, attachmentId: number) =>
		downloadInvoiceAttachment(this.strategy, this.accountSlug, invoiceId, attachmentId);
	fireInvoiceAction = (
		id: number,
		event:
			| "mark_as_sent"
			| "cancel"
			| "undo_cancel"
			| "lock"
			| "unlock"
			| "mark_as_uncollectible"
			| "undo_uncollectible",
	) => fireInvoiceAction(this.strategy, this.accountSlug, id, event);
	createInvoice = (invoiceData: CreateInvoice) => createInvoice(this.strategy, this.accountSlug, invoiceData);
	updateInvoice = (id: number, updateData: UpdateInvoice) =>
		updateInvoice(this.strategy, this.accountSlug, id, updateData);
	deleteInvoice = (id: number) => deleteInvoice(this.strategy, this.accountSlug, id);

	// Invoice Message
	sendInvoiceMessage = (invoiceId: number, messageData: InvoiceMessage) =>
		sendInvoiceMessage(this.strategy, this.accountSlug, invoiceId, messageData);

	// Invoice Payment
	createInvoicePayment = (invoiceId: number, paymentData: CreateInvoicePayment) =>
		createInvoicePayment(this.strategy, this.accountSlug, invoiceId, paymentData);
	createTaxDocument = (invoiceId: number, paymentId: number) =>
		createTaxDocument(this.strategy, this.accountSlug, invoiceId, paymentId);
	deleteInvoicePayment = (invoiceId: number, paymentId: number) =>
		deleteInvoicePayment(this.strategy, this.accountSlug, invoiceId, paymentId);

	// Number Format
	getNumberFormats = () => getNumberFormats(this.strategy, this.accountSlug);

	// Recurring Generator
	getRecurringGenerators = () => getRecurringGenerators(this.strategy, this.accountSlug);
	getRecurringGenerator = (id: number) => getRecurringGenerator(this.strategy, this.accountSlug, id);
	createRecurringGenerator = (recurringGeneratorData: CreateRecurringGenerator) =>
		createRecurringGenerator(this.strategy, this.accountSlug, recurringGeneratorData);
	updateRecurringGenerator = (id: number, recurringGeneratorData: UpdateRecurringGenerator) =>
		updateRecurringGenerator(this.strategy, this.accountSlug, id, recurringGeneratorData);
	deleteRecurringGenerator = (id: number) => deleteRecurringGenerator(this.strategy, this.accountSlug, id);

	// Subject
	getSubjects = (filters?: GetSubjectsFilters) => getSubjects(this.strategy, this.accountSlug, filters);
	searchSubjects = (query?: string) => searchSubjects(this.strategy, this.accountSlug, query);
	getSubjectDetail = (id: number) => getSubjectDetail(this.strategy, this.accountSlug, id);
	createSubject = (subjectData: SubjectCreate) => createSubject(this.strategy, this.accountSlug, subjectData);
	updateSubject = (id: number, updateData: SubjectUpdate) =>
		updateSubject(this.strategy, this.accountSlug, id, updateData);
	deleteSubject = (id: number) => deleteSubject(this.strategy, this.accountSlug, id);

	// Todo
	getTodos = () => getTodos(this.strategy, this.accountSlug);
	toggleTodoCompletion = (id: number) => toggleTodoCompletion(this.strategy, this.accountSlug, id);

	// User
	getCurrentUser = () => getCurrentUser(this.strategy);
	getUsersForAccount = () => getUsersForAccount(this.strategy, this.accountSlug);

	// Webhook
	getWebhooks = () => getWebhooks(this.strategy, this.accountSlug);
	getWebhook = (id: number) => getWebhook(this.strategy, this.accountSlug, id);
	createWebhook = (webhookData: CreateWebhook) => createWebhook(this.strategy, this.accountSlug, webhookData);
	updateWebhook = (id: number, webhookData: UpdateWebhook) =>
		updateWebhook(this.strategy, this.accountSlug, id, webhookData);
	deleteWebhook = (id: number) => deleteWebhook(this.strategy, this.accountSlug, id);
}
