import type { FakturoidClientConfig, OAuthConfig } from "./client/auth.ts";
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

export class FakturoidClient {
	private readonly config: FakturoidClientConfig;

	private constructor(config: FakturoidClientConfig) {
		this.config = config;
	}

	static async create(config: OAuthConfig, apiUrl: string, accountSlug?: string): Promise<FakturoidClient> {
		if (accountSlug != null) {
			return new FakturoidClient({ ...config, accountSlug: accountSlug, url: apiUrl });
		}

		const user = await getCurrentUser({ ...config, url: apiUrl });
		if (user instanceof Error || user.accounts[0] == null) {
			throw new Error("The user account could not be found.");
		}

		return new FakturoidClient({
			...config,
			accountSlug: user.accounts[0].slug,
			url: apiUrl,
		});
	}

	// Account
	getAccountDetail = (accountSlug: string) => getAccountDetail(this.config, accountSlug);

	// Bank Account
	getBankAccounts = (accountSlug: string) => getBankAccounts(this.config, accountSlug);

	// Event
	getEvents = (accountSlug: string) => getEvents(this.config, accountSlug);

	// Expense
	getExpenses = (accountSlug: string, filters?: GetExpenseFilters) => getExpenses(this.config, accountSlug, filters);
	searchExpenses = (accountSlug: string, query?: string, tags?: string[]) =>
		searchExpenses(this.config, accountSlug, query, tags);
	getExpenseDetail = (accountSlug: string, id: number) => getExpenseDetail(this.config, accountSlug, id);
	downloadExpenseAttachment = (accountSlug: string, expenseId: number, attachmentId: number) =>
		downloadExpenseAttachment(this.config, accountSlug, expenseId, attachmentId);
	fireExpenseAction = (accountSlug: string, id: number, event: "lock" | "unlock") =>
		fireExpenseAction(this.config, accountSlug, id, event);
	createExpense = (accountSlug: string, expenseData: CreateExpense) =>
		createExpense(this.config, accountSlug, expenseData);
	updateExpense = (accountSlug: string, id: number, updateData: UpdateExpense) =>
		updateExpense(this.config, accountSlug, id, updateData);
	deleteExpense = (accountSlug: string, id: number) => deleteExpense(this.config, accountSlug, id);

	// Expense Payment
	createExpensePayment = (accountSlug: string, expenseId: number, paymentData: CreateExpensePayment) =>
		createExpensePayment(this.config, accountSlug, expenseId, paymentData);
	deleteExpensePayment = (accountSlug: string, expenseId: number, paymentId: number) =>
		deleteExpensePayment(this.config, accountSlug, expenseId, paymentId);

	// Generator
	getGenerators = (accountSlug: string) => getGenerators(this.config, accountSlug);
	getGenerator = (accountSlug: string, id: number) => getGenerator(this.config, accountSlug, id);
	createGenerator = (accountSlug: string, generatorData: CreateGenerator) =>
		createGenerator(this.config, accountSlug, generatorData);
	updateGenerator = (accountSlug: string, id: number, generatorData: UpdateGenerator) =>
		updateGenerator(this.config, accountSlug, id, generatorData);
	deleteGenerator = (accountSlug: string, id: number) => deleteGenerator(this.config, accountSlug, id);

	// Inbox File
	getInboxFiles = (accountSlug: string) => getInboxFiles(this.config, accountSlug);
	createInboxFile = (accountSlug: string, inboxFileData: CreateInboxFile) =>
		createInboxFile(this.config, accountSlug, inboxFileData);
	sendInboxFileToOcr = (accountSlug: string, id: number) => sendInboxFileToOcr(this.config, accountSlug, id);
	downloadInboxFile = (accountSlug: string, id: number) => downloadInboxFile(this.config, accountSlug, id);
	deleteInboxFile = (accountSlug: string, id: number) => deleteInboxFile(this.config, accountSlug, id);

	// Inventory Item
	getInventoryItems = (accountSlug: string) => getInventoryItems(this.config, accountSlug);
	getInventoryItem = (accountSlug: string, id: number) => getInventoryItem(this.config, accountSlug, id);
	createInventoryItem = (accountSlug: string, inventoryItemData: CreateInventoryItem) =>
		createInventoryItem(this.config, accountSlug, inventoryItemData);
	updateInventoryItem = (accountSlug: string, id: number, inventoryItemData: UpdateInventoryItem) =>
		updateInventoryItem(this.config, accountSlug, id, inventoryItemData);
	deleteInventoryItem = (accountSlug: string, id: number) => deleteInventoryItem(this.config, accountSlug, id);
	archiveInventoryItem = (accountSlug: string, id: number) => archiveInventoryItem(this.config, accountSlug, id);
	unarchiveInventoryItem = (accountSlug: string, id: number) => unarchiveInventoryItem(this.config, accountSlug, id);

	// Inventory Move
	getInventoryMoves = (accountSlug: string, inventoryItemId: number) =>
		getInventoryMoves(this.config, accountSlug, inventoryItemId);
	getInventoryMove = (accountSlug: string, inventoryItemId: number, id: number) =>
		getInventoryMove(this.config, accountSlug, inventoryItemId, id);
	createInventoryMove = (accountSlug: string, inventoryItemId: number, inventoryMoveData: CreateInventoryMove) =>
		createInventoryMove(this.config, accountSlug, inventoryItemId, inventoryMoveData);
	updateInventoryMove = (
		accountSlug: string,
		inventoryItemId: number,
		id: number,
		inventoryMoveData: UpdateInventoryMove,
	) => updateInventoryMove(this.config, accountSlug, inventoryItemId, id, inventoryMoveData);
	deleteInventoryMove = (accountSlug: string, inventoryItemId: number, id: number) =>
		deleteInventoryMove(this.config, accountSlug, inventoryItemId, id);

	// Invoice
	getInvoices = (accountSlug: string, filters?: GetInvoicesFilters) => getInvoices(this.config, accountSlug, filters);
	searchInvoices = (accountSlug: string, query?: string, tags?: string[]) =>
		searchInvoices(this.config, accountSlug, query, tags);
	getInvoiceDetail = (accountSlug: string, id: number) => getInvoiceDetail(this.config, accountSlug, id);
	downloadInvoicePDF = (accountSlug: string, id: number) => downloadInvoicePDF(this.config, accountSlug, id);
	downloadInvoiceAttachment = (accountSlug: string, invoiceId: number, attachmentId: number) =>
		downloadInvoiceAttachment(this.config, accountSlug, invoiceId, attachmentId);
	fireInvoiceAction = (
		accountSlug: string,
		id: number,
		event:
			| "mark_as_sent"
			| "cancel"
			| "undo_cancel"
			| "lock"
			| "unlock"
			| "mark_as_uncollectible"
			| "undo_uncollectible",
	) => fireInvoiceAction(this.config, accountSlug, id, event);
	createInvoice = (accountSlug: string, invoiceData: CreateInvoice) =>
		createInvoice(this.config, accountSlug, invoiceData);
	updateInvoice = (accountSlug: string, id: number, updateData: UpdateInvoice) =>
		updateInvoice(this.config, accountSlug, id, updateData);
	deleteInvoice = (accountSlug: string, id: number) => deleteInvoice(this.config, accountSlug, id);

	// Invoice Message
	sendInvoiceMessage = (accountSlug: string, invoiceId: number, messageData: InvoiceMessage) =>
		sendInvoiceMessage(this.config, accountSlug, invoiceId, messageData);

	// Invoice Payment
	createInvoicePayment = (accountSlug: string, invoiceId: number, paymentData: CreateInvoicePayment) =>
		createInvoicePayment(this.config, accountSlug, invoiceId, paymentData);
	createTaxDocument = (accountSlug: string, invoiceId: number, paymentId: number) =>
		createTaxDocument(this.config, accountSlug, invoiceId, paymentId);
	deleteInvoicePayment = (accountSlug: string, invoiceId: number, paymentId: number) =>
		deleteInvoicePayment(this.config, accountSlug, invoiceId, paymentId);

	// Number Format
	getNumberFormats = (accountSlug: string) => getNumberFormats(this.config, accountSlug);

	// Recurring Generator
	getRecurringGenerators = (accountSlug: string) => getRecurringGenerators(this.config, accountSlug);
	getRecurringGenerator = (accountSlug: string, id: number) => getRecurringGenerator(this.config, accountSlug, id);
	createRecurringGenerator = (accountSlug: string, recurringGeneratorData: CreateRecurringGenerator) =>
		createRecurringGenerator(this.config, accountSlug, recurringGeneratorData);
	updateRecurringGenerator = (accountSlug: string, id: number, recurringGeneratorData: UpdateRecurringGenerator) =>
		updateRecurringGenerator(this.config, accountSlug, id, recurringGeneratorData);
	deleteRecurringGenerator = (accountSlug: string, id: number) =>
		deleteRecurringGenerator(this.config, accountSlug, id);

	// Subject
	getSubjects = (accountSlug: string, filters?: GetSubjectsFilters) => getSubjects(this.config, accountSlug, filters);
	searchSubjects = (accountSlug: string, query?: string) => searchSubjects(this.config, accountSlug, query);
	getSubjectDetail = (accountSlug: string, id: number) => getSubjectDetail(this.config, accountSlug, id);
	createSubject = (accountSlug: string, subjectData: SubjectCreate) =>
		createSubject(this.config, accountSlug, subjectData);
	updateSubject = (accountSlug: string, id: number, updateData: SubjectUpdate) =>
		updateSubject(this.config, accountSlug, id, updateData);
	deleteSubject = (accountSlug: string, id: number) => deleteSubject(this.config, accountSlug, id);

	// Todo
	getTodos = (accountSlug: string) => getTodos(this.config, accountSlug);
	toggleTodoCompletion = (accountSlug: string, id: number) => toggleTodoCompletion(this.config, accountSlug, id);

	// User
	getCurrentUser = () => getCurrentUser(this.config);
	getUsersForAccount = (accountSlug: string) => getUsersForAccount(this.config, accountSlug);

	// Webhook
	getWebhooks = (accountSlug: string) => getWebhooks(this.config, accountSlug);
	getWebhook = (accountSlug: string, id: number) => getWebhook(this.config, accountSlug, id);
	createWebhook = (accountSlug: string, webhookData: CreateWebhook) =>
		createWebhook(this.config, accountSlug, webhookData);
	updateWebhook = (accountSlug: string, id: number, webhookData: UpdateWebhook) =>
		updateWebhook(this.config, accountSlug, id, webhookData);
	deleteWebhook = (accountSlug: string, id: number) => deleteWebhook(this.config, accountSlug, id);
}
