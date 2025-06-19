import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { Prompt } from "@modelcontextprotocol/sdk/types.js";
import { GetPromptRequestSchema, ListPromptsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// TODO: Remove the disables
// biome-ignore-start lint/complexity/noExcessiveCognitiveComplexity: Disabled for now
// biome-ignore-start lint/complexity/useLiteralKeys: Disabled for now

export function registerFakturoidPrompts(server: Server) {
	// List available prompts
	server.setRequestHandler(ListPromptsRequestSchema, () => {
		const prompts: Prompt[] = [
			{
				arguments: [
					{
						description: "Name of the client/company for the invoice",
						name: "client_name",
						required: true,
					},
					{
						description: "Description of services or products provided",
						name: "services",
						required: true,
					},
					{
						description: "Total amount for the invoice",
						name: "amount",
						required: false,
					},
				],
				description: "Create a new invoice with guided prompts",
				name: "create_invoice",
			},
			{
				arguments: [
					{
						description: "Description of the expense",
						name: "expense_description",
						required: true,
					},
					{
						description: "Expense amount",
						name: "amount",
						required: true,
					},
					{
						description: "Date of the expense",
						name: "date",
						required: false,
					},
				],
				description: "Categorize and analyze business expenses",
				name: "expense_categorization",
			},
			{
				arguments: [
					{
						description: "Name of the client with overdue payment",
						name: "client_name",
						required: true,
					},
					{
						description: "Invoice number that is overdue",
						name: "invoice_number",
						required: true,
					},
					{
						description: "Amount that is overdue",
						name: "amount_due",
						required: true,
					},
					{
						description: "Number of days the payment is overdue",
						name: "days_overdue",
						required: false,
					},
				],
				description: "Generate payment follow-up communication for overdue invoices",
				name: "payment_followup",
			},
			{
				arguments: [
					{
						description: "Month for the summary (e.g., '2024-01')",
						name: "month",
						required: true,
					},
					{
						description: "Specific area to focus on (revenue, expenses, cash flow, etc.)",
						name: "focus_area",
						required: false,
					},
				],
				description: "Generate a monthly financial summary and insights",
				name: "monthly_summary",
			},
			{
				arguments: [
					{
						description: "Tax year for preparation",
						name: "tax_year",
						required: true,
					},
					{
						description: "Type of business (sole proprietorship, corporation, etc.)",
						name: "business_type",
						required: false,
					},
				],
				description: "Assist with tax preparation and documentation",
				name: "tax_preparation",
			},
			{
				arguments: [
					{
						description: "Name of the client to analyze",
						name: "client_name",
						required: true,
					},
					{
						description: "Time period for analysis (e.g., 'last 6 months')",
						name: "time_period",
						required: false,
					},
				],
				description: "Analyze client payment patterns and profitability",
				name: "client_analysis",
			},
		];

		return { prompts: prompts };
	});

	// Get specific prompt
	server.setRequestHandler(GetPromptRequestSchema, (request) => {
		const { name, arguments: args } = request.params;

		switch (name) {
			case "create_invoice":
				return {
					description: "Create a professional invoice with proper details",
					messages: [
						{
							content: {
								text: `I need to create an invoice for ${args?.["client_name"] ?? "[CLIENT_NAME]"}.

Services provided: ${args?.["services"] ?? "[SERVICES_DESCRIPTION]"}
${args?.["amount"] ? `Amount: ${args["amount"]}` : ""}

Please help me:
1. Create a proper invoice with all necessary details
2. Ensure all required fields are included (client info, line items, VAT if applicable)
3. Suggest professional payment terms
4. Add any missing information that might be needed

Use the Fakturoid tools to create this invoice and make sure it follows best practices for professional invoicing.`,
								type: "text",
							},
							role: "user",
						},
					],
				};

			case "expense_categorization":
				return {
					description: "Categorize and analyze business expenses",
					messages: [
						{
							content: {
								text: `I have a business expense that needs to be properly categorized:

Expense: ${args?.["expense_description"] ?? "[EXPENSE_DESCRIPTION]"}
Amount: ${args?.["amount"] ?? "[AMOUNT]"}
${args?.["date"] ? `Date: ${args["date"]}` : ""}

Please help me:
1. Determine the correct expense category for tax purposes
2. Check if this expense is fully deductible or if there are limitations
3. Suggest any documentation I should keep for this expense
4. Add this expense to Fakturoid with the proper categorization

Use the Fakturoid tools to record this expense properly.`,
								type: "text",
							},
							role: "user",
						},
					],
				};

			case "payment_followup":
				return {
					description: "Generate professional payment follow-up communication",
					messages: [
						{
							content: {
								text: `I need to follow up on an overdue payment:

Client: ${args?.["client_name"] ?? "[CLIENT_NAME]"}
Invoice Number: ${args?.["invoice_number"] ?? "[INVOICE_NUMBER]"}
Amount Due: ${args?.["amount_due"] ?? "[AMOUNT]"}
${args?.["days_overdue"] ? `Days Overdue: ${args["days_overdue"]}` : ""}

Please help me:
1. Draft a professional but firm payment reminder email
2. Suggest escalation steps if this is a repeat occurrence
3. Check the invoice status in Fakturoid
4. Recommend next actions based on how overdue the payment is

First, use Fakturoid tools to get the current status of this invoice, then provide appropriate follow-up recommendations.`,
								type: "text",
							},
							role: "user",
						},
					],
				};

			case "monthly_summary":
				return {
					description: "Generate comprehensive monthly financial summary",
					messages: [
						{
							content: {
								text: `I need a comprehensive financial summary for ${args?.["month"] ?? "[MONTH]"}.

${args?.["focus_area"] ? `Focus on: ${args["focus_area"]}` : ""}

Please provide:
1. Total revenue and expenses for the month
2. Outstanding invoices and their aging
3. Key financial metrics and trends
4. Cash flow analysis
5. Recommendations for improvement
${args?.["focus_area"] ? `6. Detailed analysis of ${args["focus_area"]}` : ""}

Use Fakturoid tools to gather all necessary data and provide actionable insights.`,
								type: "text",
							},
							role: "user",
						},
					],
				};

			case "tax_preparation":
				return {
					description: "Assist with tax preparation and documentation",
					messages: [
						{
							content: {
								text: `I need help preparing for tax filing for ${args?.["tax_year"] ?? "[TAX_YEAR]"}.

${args?.["business_type"] ? `Business Type: ${args["business_type"]}` : ""}

Please help me:
1. Gather all necessary financial data from Fakturoid
2. Categorize income and expenses for tax purposes
3. Identify potential deductions I might have missed
4. Create a summary report for my accountant
5. Check for any missing documentation or information
6. Suggest tax optimization strategies for next year

Use Fakturoid tools to compile comprehensive tax preparation materials.`,
								type: "text",
							},
							role: "user",
						},
					],
				};

			case "client_analysis":
				return {
					description: "Analyze client payment patterns and business relationship",
					messages: [
						{
							content: {
								text: `I want to analyze my business relationship with ${args?.["client_name"] ?? "[CLIENT_NAME]"}.

${args?.["time_period"] ? `Analysis Period: ${args["time_period"]}` : ""}

Please analyze:
1. Total revenue from this client
2. Payment patterns and average payment time
3. Frequency of work and project sizes
4. Profitability analysis
5. Payment reliability and any issues
6. Recommendations for improving the relationship

Use Fakturoid tools to gather historical data and provide insights on this client relationship.`,
								type: "text",
							},
							role: "user",
						},
					],
				};

			default:
				throw new Error(`Unknown prompt: ${name}`);
		}
	});
}

// biome-ignore-end lint/complexity/noExcessiveCognitiveComplexity: Disabled for now
// biome-ignore-end lint/complexity/useLiteralKeys: Disabled for now
