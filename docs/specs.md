# MCP Server Specifications

This document outlines the comprehensive Model Context Protocol (MCP) server implementation for Fakturoid API integration.

## Overview

The Fakturoid MCP server is a **comprehensive implementation** that leverages the full potential of the Model Context Protocol by providing:

- **🔧 Tools** - Interactive functions for AI models to perform actions
- **📚 Resources** - Contextual data for AI model awareness  
- **💡 Prompts** - Templated workflows for common accounting tasks

## Architecture

### High-Level Design
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   AI Model      │    │   MCP Server     │    │   Fakturoid     │
│   (Claude,      │◄──►│   (This Server)  │◄──►│   API           │
│   Cursor, etc.) │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Component Architecture
```
MCP Server
├── Transport Layer (stdio/SSE)
├── Protocol Handler (JSON-RPC 2.0)
├── Feature Handlers
│   ├── Tools (src/fakturoid/tools.ts + src/fakturoid/tools/)
│   ├── Resources (src/fakturoid/resources.ts)
│   └── Prompts (src/fakturoid/prompts.ts)
├── Fakturoid Client (src/fakturoid/client.ts)
└── OAuth Authentication
```

## Feature Implementation

### 1. Tools (Interactive Functions)

**Purpose**: Allow AI models to perform actions on Fakturoid data

**Implementation**: High-level McpServer API for type-safe tool registration

**Coverage**:
- ✅ User management
- ✅ Account operations  
- ✅ Invoice lifecycle (CRUD + search)
- ✅ Expense management
- ✅ Contact/subject management
- ✅ Payment tracking
- ✅ File management

**Example Usage**:
```typescript
server.tool('fakturoid_create_invoice', schema, async (params) => {
  const invoice = await client.createInvoice(params);
  return { content: [{ type: 'text', text: JSON.stringify(invoice) }] };
});
```

### 2. Resources (Contextual Data)

**Purpose**: Provide AI models with real-time Fakturoid data for context

**Implementation**: Low-level Server API with custom URI scheme `fakturoid://`

**Available Resources**:
- `fakturoid://account` - Account information
- `fakturoid://invoices/recent` - Latest invoices
- `fakturoid://invoices/open` - Unpaid invoices
- `fakturoid://invoices/overdue` - Overdue invoices
- `fakturoid://expenses/recent` - Recent expenses
- `fakturoid://expenses/open` - Unpaid expenses
- `fakturoid://subjects/recent` - Recent contacts
- `fakturoid://subjects/companies` - Company contacts
- `fakturoid://subjects/people` - Individual contacts
- `fakturoid://dashboard/summary` - Financial overview

**Example Usage**:
AI models can reference these resources to get context before making decisions or providing advice.

### 3. Prompts (Workflow Templates)

**Purpose**: Provide pre-built templates for common accounting workflows

**Implementation**: Low-level Server API with parameterized prompt templates

**Available Prompts**:
- `create_invoice` - Guided invoice creation
- `expense_categorization` - Tax-compliant expense handling
- `payment_followup` - Professional payment reminders
- `monthly_summary` - Financial reporting
- `tax_preparation` - Tax documentation organization
- `client_analysis` - Customer relationship analysis

**Example Usage**:
```typescript
// AI model can call:
// GetPrompt("create_invoice", {client_name: "ACME Corp", services: "Consulting"})
// Returns a structured prompt with best practices and guidance
```

## Protocol Compliance

### MCP Capabilities Declaration
```json
{
  "capabilities": {
    "resources": {},
    "prompts": {},
    "tools": {}
  }
}
```

### Transport Support
- ✅ **stdio** - For direct AI integration (Claude Desktop, etc.)
- ✅ **SSE/HTTP** - For web-based AI applications
- ✅ **Session management** - For stateful connections

### Error Handling
- Comprehensive error catching and reporting
- Graceful degradation when Fakturoid API is unavailable
- Proper JSON-RPC error codes and messages

## Data Flow Examples

### 1. Invoice Creation Workflow
```
1. AI Model → Get Prompt "create_invoice" → MCP Server
2. MCP Server → Return guided invoice creation template
3. AI Model → Use Tools to create invoice → MCP Server
4. MCP Server → Call Fakturoid API → Create invoice
5. AI Model → Access Resources for confirmation → MCP Server
```

### 2. Monthly Analysis Workflow  
```
1. AI Model → Access Resource "dashboard/summary" → MCP Server
2. MCP Server → Fetch data from Fakturoid → Return summary
3. AI Model → Get Prompt "monthly_summary" → MCP Server
4. AI Model → Use Tools for detailed analysis → MCP Server
5. AI Model → Generate comprehensive report
```

## Security & Authentication

### OAuth 2.0 Flow
```
1. Server starts with client credentials
2. Automatic token acquisition on first API call
3. Token caching and automatic refresh
4. Secure credential management via environment variables
```

### Security Features
- ✅ Secure credential storage
- ✅ Automatic token refresh
- ✅ Rate limiting compliance
- ✅ Error handling without credential exposure

## Quality Assurance

### Code Quality
- ✅ TypeScript for type safety
- ✅ Modular architecture
- ✅ Comprehensive error handling
- ✅ Environment-based configuration

### MCP Compliance
- ✅ Full protocol implementation
- ✅ Proper capability declaration  
- ✅ Standard message formats
- ✅ Transport layer abstraction

### API Coverage
- ✅ Complete Fakturoid API v3 support
- ✅ All CRUD operations
- ✅ Advanced search and filtering
- ✅ File upload and management

## Deployment

### Development
```bash
npm run dev    # Hot reload development
npm run build  # Production build
npm start      # Start production server
```

### Production Considerations
- Environment variable security
- Process management (PM2, Docker, etc.)
- Logging and monitoring
- Health checks and error alerting

## Future Enhancements

### Potential Extensions
- **Caching Layer** - Redis/memory caching for frequently accessed data
- **Webhooks** - Real-time updates from Fakturoid
- **Multi-tenant** - Support for multiple Fakturoid accounts
- **Advanced Analytics** - More sophisticated financial analysis tools
- **Bulk Operations** - Batch processing capabilities

### MCP Protocol Evolution
- **Sampling** - Server-initiated LLM interactions
- **Additional Resource Types** - Binary data, streaming resources
- **Enhanced Prompts** - Multi-modal prompts with images/documents

This comprehensive implementation demonstrates the full potential of the Model Context Protocol for accounting and business automation workflows.
