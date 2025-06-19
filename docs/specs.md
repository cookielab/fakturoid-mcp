# MCP Server Specifications

This document outlines the comprehensive Model Context Protocol (MCP) server implementation for Fakturoid API integration.

## Overview

The Fakturoid MCP server is a **complete implementation** of the Model Context Protocol that provides AI models with powerful capabilities for accounting and invoicing automation through:

- **🔧 Tools** - 18+ interactive functions for performing actions
- **📚 Resources** - 10 contextual data sources for real-time insights
- **💡 Prompts** - 6 guided workflow templates for common tasks

## Architecture

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Model      │    │   MCP Server     │    │   Fakturoid     │
│   (Claude,      │◄──►│   (This Server)  │◄──►│   API v3        │
│   GPT, etc.)    │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
     JSON-RPC 2.0         TypeScript            REST API
```

### Component Structure

```
fakturoid-mcp/
├── src/
│   ├── main.ts                 # Entry point & transport handling
│   ├── server.ts               # MCP server initialization
│   ├── fakturoid/
│   │   ├── client.ts           # Fakturoid API client
│   │   ├── tools.ts            # Tool registration
│   │   ├── resources.ts        # Resource handlers
│   │   ├── prompts.ts          # Prompt templates
│   │   ├── client/             # API client implementations
│   │   ├── model/              # TypeScript models & schemas
│   │   ├── tool/               # Individual tool implementations
│   │   └── resource/           # Individual resource handlers
│   └── utils/
│       └── env.ts              # Environment configuration
└── dist/                       # Compiled JavaScript output
```

## Implementation Details

### 1. Tools Implementation

**Architecture**: High-level McpServer API with Zod schema validation

**Tool Categories**:

- **Account Management** (2 tools)

  - `fakturoid_get_account` - Retrieve account information
  - `fakturoid_update_account` - Update account settings

- **Invoice Operations** (8 tools)

  - `fakturoid_get_invoices` - List invoices with filters
  - `fakturoid_search_invoices` - Search by query and tags
  - `fakturoid_get_invoice_detail` - Get specific invoice
  - `fakturoid_create_invoice` - Create new invoice
  - `fakturoid_update_invoice` - Update existing invoice
  - `fakturoid_delete_invoice` - Delete invoice
  - `fakturoid_fire_invoice` - Send invoice to client
  - `fakturoid_download_invoice_pdf` - Get PDF version

- **Expense Management** (5 tools)

  - `fakturoid_get_expenses` - List expenses
  - `fakturoid_get_expense_detail` - Get specific expense
  - `fakturoid_create_expense` - Create new expense
  - `fakturoid_update_expense` - Update expense
  - `fakturoid_delete_expense` - Delete expense

- **Contact Management** (4 tools)

  - `fakturoid_get_subjects` - List contacts
  - `fakturoid_search_subjects` - Search contacts
  - `fakturoid_create_subject` - Create new contact
  - `fakturoid_update_subject` - Update contact

- **Additional Features** (Multiple tools for each)
  - Bank accounts
  - Events
  - Generators (recurring invoices)
  - Inbox files
  - Inventory management
  - Invoice/expense payments
  - Messages
  - Number formats
  - Todos
  - Users
  - Webhooks

**Tool Structure Example**:

```typescript
const createInvoice = createTool(
  "fakturoid_create_invoice",
  async (client, params) => {
    const invoice = await client.createInvoice(
      params.accountSlug,
      params.invoice,
    );
    return {
      content: [{ text: JSON.stringify(invoice, null, 2), type: "text" }],
    };
  },
  z.object({
    accountSlug: z.string().min(1),
    invoice: CreateInvoiceSchema,
  }),
);
```

### 2. Resources Implementation

**Architecture**: Low-level Server API with custom URI scheme

**Resource Format**: `fakturoid://[resource-type]/[resource-id]`

**Available Resources**:

```typescript
const RESOURCES: FakturoidResource[] = [
  accountResource, // fakturoid://account
  dashboardSummaryResource, // fakturoid://dashboard/summary
  expensesOpenResource, // fakturoid://expenses/open
  expensesRecentResource, // fakturoid://expenses/recent
  invoicesOpenResource, // fakturoid://invoices/open
  invoicesOverdueResource, // fakturoid://invoices/overdue
  invoicesRecentResource, // fakturoid://invoices/recent
  subjectsCustomersResource, // fakturoid://subjects/customers
  subjectsRecentResource, // fakturoid://subjects/recent
  subjectsSuppliersResource, // fakturoid://subjects/suppliers
];
```

**Resource Handler Example**:

```typescript
export const invoicesRecentResource: FakturoidResource = {
  uri: "fakturoid://invoices/recent",
  name: "Recent Invoices",
  description: "Latest 20 invoices from your account",
  mimeType: "application/json",
  implementation: async (client, accountSlug) => {
    const invoices = await client.getInvoices(accountSlug, { limit: 20 });
    return {
      contents: [
        {
          uri: "fakturoid://invoices/recent",
          mimeType: "application/json",
          text: JSON.stringify(invoices, null, 2),
        },
      ],
    };
  },
};
```

### 3. Prompts Implementation

**Architecture**: Low-level Server API with parameterized templates

**Available Prompts**:

```typescript
const prompts: Prompt[] = [
  {
    name: "create_invoice",
    description: "Create a new invoice with guided prompts",
    arguments: [
      { name: "client_name", required: true },
      { name: "services", required: true },
      { name: "amount", required: false },
    ],
  },
  // ... 5 more prompts
];
```

**Prompt Handler Example**:

```typescript
case "create_invoice":
  return {
    description: "Create a professional invoice with proper details",
    messages: [{
      role: "user",
      content: {
        type: "text",
        text: `I need to create an invoice for ${args?.client_name}.
               Services: ${args?.services}
               ${args?.amount ? `Amount: ${args.amount}` : ""}

               Please help me create a professional invoice...`
      }
    }]
  };
```

## Protocol Implementation

### MCP Capabilities

```json
{
  "capabilities": {
    "tools": {},
    "resources": {},
    "prompts": {}
  }
}
```

### Transport Support

- **stdio** (Default) - Direct process communication for desktop AI apps
- **SSE/HTTP** - Server-Sent Events for web-based integrations

### Message Flow

```
1. Initialize → Capability negotiation
2. List Tools/Resources/Prompts → Available features
3. Execute Tool → Perform action via Fakturoid API
4. Read Resource → Fetch contextual data
5. Get Prompt → Retrieve workflow template
```

## Authentication & Security

### OAuth 2.0 Flow

```typescript
class FakturoidClient {
  private async ensureAuthenticated(): Promise<void> {
    if (!this.accessToken || this.isTokenExpired()) {
      await this.refreshToken();
    }
  }
}
```

### Security Features

- Environment variable configuration
- Automatic token refresh
- No credential storage in code
- Secure token handling
- Rate limiting compliance

## Data Models

### Type Safety

All API interactions use Zod schemas for runtime validation:

```typescript
export const InvoiceSchema = z.object({
  id: z.number(),
  number: z.string(),
  variable_symbol: z.string(),
  your_name: z.string(),
  client_name: z.string(),
  client_id: z.number(),
  issued_on: z.string(),
  due_on: z.string(),
  total: z.string(),
  remaining_amount: z.string(),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  // ... more fields
});
```

### Model Organization

- `model/` directory contains all TypeScript interfaces and Zod schemas
- Each entity has its own model file (invoice.ts, expense.ts, etc.)
- Common types shared in `model/common.ts`

## Error Handling

### Error Types

```typescript
export class FakturoidError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}
```

### Error Responses

All errors are caught and returned as structured JSON:

```json
{
  "error": "Error message",
  "timestamp": "2024-01-01T00:00:00Z",
  "uri": "fakturoid://resource/path"
}
```

## Performance Considerations

### Current Implementation

- Synchronous API calls
- No caching layer
- Direct API passthrough

### Future Optimizations

- Response caching for resources
- Batch API operations
- Connection pooling
- Rate limit management

## Testing Strategy

### Required Test Coverage

- Unit tests for each tool
- Integration tests for API client
- MCP protocol compliance tests
- Resource handler tests
- Prompt template validation

### Test Structure

```
tests/
├── unit/
│   ├── tools/
│   ├── resources/
│   └── client/
├── integration/
│   ├── api/
│   └── mcp/
└── e2e/
    └── workflows/
```

## Deployment

### Build Process

```bash
pnpm build  # TypeScript compilation
```

### Runtime Requirements

- Node.js 24.2.0+
- Environment variables configured
- Network access to Fakturoid API

### Production Considerations

- Process management (PM2, systemd)
- Log aggregation
- Error monitoring
- Health checks
- Automatic restarts

## Compliance

### MCP Protocol

- Full JSON-RPC 2.0 compliance
- Proper capability declaration
- Standard error codes
- Transport abstraction

### Fakturoid API

- API v3 compliance
- Rate limiting respect
- Proper authentication
- Complete endpoint coverage

This specification represents a production-ready MCP server implementation that fully leverages the Model Context Protocol for AI-powered accounting automation.
