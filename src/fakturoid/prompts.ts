import { 
  ListPromptsRequestSchema, 
  GetPromptRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import type { Prompt } from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

export function registerFakturoidPrompts(server: Server) {
  // List available prompts
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    const prompts: Prompt[] = [
      {
        name: "create_invoice",
        description: "Create a new invoice with guided prompts",
        arguments: [
          {
            name: "client_name",
            description: "Name of the client/company for the invoice",
            required: true
          },
          {
            name: "services",
            description: "Description of services or products provided",
            required: true
          },
          {
            name: "amount",
            description: "Total amount for the invoice",
            required: false
          }
        ]
      },
      {
        name: "expense_categorization",
        description: "Categorize and analyze business expenses",
        arguments: [
          {
            name: "expense_description",
            description: "Description of the expense",
            required: true
          },
          {
            name: "amount",
            description: "Expense amount",
            required: true
          },
          {
            name: "date",
            description: "Date of the expense",
            required: false
          }
        ]
      },
      {
        name: "payment_followup",
        description: "Generate payment follow-up communication for overdue invoices",
        arguments: [
          {
            name: "client_name",
            description: "Name of the client with overdue payment",
            required: true
          },
          {
            name: "invoice_number",
            description: "Invoice number that is overdue",
            required: true
          },
          {
            name: "amount_due",
            description: "Amount that is overdue",
            required: true
          },
          {
            name: "days_overdue",
            description: "Number of days the payment is overdue",
            required: false
          }
        ]
      },
      {
        name: "monthly_summary",
        description: "Generate a monthly financial summary and insights",
        arguments: [
          {
            name: "month",
            description: "Month for the summary (e.g., '2024-01')",
            required: true
          },
          {
            name: "focus_area",
            description: "Specific area to focus on (revenue, expenses, cash flow, etc.)",
            required: false
          }
        ]
      },
      {
        name: "tax_preparation",
        description: "Assist with tax preparation and documentation",
        arguments: [
          {
            name: "tax_year",
            description: "Tax year for preparation",
            required: true
          },
          {
            name: "business_type",
            description: "Type of business (sole proprietorship, corporation, etc.)",
            required: false
          }
        ]
      },
      {
        name: "client_analysis",
        description: "Analyze client payment patterns and profitability",
        arguments: [
          {
            name: "client_name",
            description: "Name of the client to analyze",
            required: true
          },
          {
            name: "time_period",
            description: "Time period for analysis (e.g., 'last 6 months')",
            required: false
          }
        ]
      }
    ];

    return { prompts };
  });

  // Get specific prompt
  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    switch (name) {
      case "create_invoice":
        return {
          description: "Create a professional invoice with proper details",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need to create an invoice for ${args?.client_name || '[CLIENT_NAME]'}. 

Services provided: ${args?.services || '[SERVICES_DESCRIPTION]'}
${args?.amount ? `Amount: ${args.amount}` : ''}

Please help me:
1. Create a proper invoice with all necessary details
2. Ensure all required fields are included (client info, line items, VAT if applicable)
3. Suggest professional payment terms
4. Add any missing information that might be needed

Use the Fakturoid tools to create this invoice and make sure it follows best practices for professional invoicing.`
              }
            }
          ]
        };

      case "expense_categorization":
        return {
          description: "Categorize and analyze business expenses",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I have a business expense that needs to be properly categorized:

Expense: ${args?.expense_description || '[EXPENSE_DESCRIPTION]'}
Amount: ${args?.amount || '[AMOUNT]'}
${args?.date ? `Date: ${args.date}` : ''}

Please help me:
1. Determine the correct expense category for tax purposes
2. Check if this expense is fully deductible or if there are limitations
3. Suggest any documentation I should keep for this expense
4. Add this expense to Fakturoid with the proper categorization

Use the Fakturoid tools to record this expense properly.`
              }
            }
          ]
        };

      case "payment_followup":
        return {
          description: "Generate professional payment follow-up communication",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need to follow up on an overdue payment:

Client: ${args?.client_name || '[CLIENT_NAME]'}
Invoice Number: ${args?.invoice_number || '[INVOICE_NUMBER]'}
Amount Due: ${args?.amount_due || '[AMOUNT]'}
${args?.days_overdue ? `Days Overdue: ${args.days_overdue}` : ''}

Please help me:
1. Draft a professional but firm payment reminder email
2. Suggest escalation steps if this is a repeat occurrence
3. Check the invoice status in Fakturoid
4. Recommend next actions based on how overdue the payment is

First, use Fakturoid tools to get the current status of this invoice, then provide appropriate follow-up recommendations.`
              }
            }
          ]
        };

      case "monthly_summary":
        return {
          description: "Generate comprehensive monthly financial summary",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need a comprehensive financial summary for ${args?.month || '[MONTH]'}.

${args?.focus_area ? `Focus on: ${args.focus_area}` : ''}

Please provide:
1. Total revenue and expenses for the month
2. Outstanding invoices and their aging
3. Key financial metrics and trends
4. Cash flow analysis
5. Recommendations for improvement
${args?.focus_area ? `6. Detailed analysis of ${args.focus_area}` : ''}

Use Fakturoid tools to gather all necessary data and provide actionable insights.`
              }
            }
          ]
        };

      case "tax_preparation":
        return {
          description: "Assist with tax preparation and documentation",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I need help preparing for tax filing for ${args?.tax_year || '[TAX_YEAR]'}.

${args?.business_type ? `Business Type: ${args.business_type}` : ''}

Please help me:
1. Gather all necessary financial data from Fakturoid
2. Categorize income and expenses for tax purposes
3. Identify potential deductions I might have missed
4. Create a summary report for my accountant
5. Check for any missing documentation or information
6. Suggest tax optimization strategies for next year

Use Fakturoid tools to compile comprehensive tax preparation materials.`
              }
            }
          ]
        };

      case "client_analysis":
        return {
          description: "Analyze client payment patterns and business relationship",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `I want to analyze my business relationship with ${args?.client_name || '[CLIENT_NAME]'}.

${args?.time_period ? `Analysis Period: ${args.time_period}` : ''}

Please analyze:
1. Total revenue from this client
2. Payment patterns and average payment time
3. Frequency of work and project sizes
4. Profitability analysis
5. Payment reliability and any issues
6. Recommendations for improving the relationship

Use Fakturoid tools to gather historical data and provide insights on this client relationship.`
              }
            }
          ]
        };

      default:
        throw new Error(`Unknown prompt: ${name}`);
    }
  });
} 