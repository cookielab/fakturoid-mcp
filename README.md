# Fakturoid MCP Server

A comprehensive Model Context Protocol (MCP) server implementation for the Fakturoid API, enabling AI models to interact with accounting and invoicing data through a rich set of tools, resources, and guided workflows.

## Overview

This MCP server provides a complete integration with Fakturoid API v3, demonstrating the full potential of the Model Context Protocol by implementing all three core MCP features:

- **🔧 Tools** - 18+ interactive functions for performing actions on Fakturoid data
- **📚 Resources** - 10 contextual data sources providing real-time business insights
- **💡 Prompts** - 6 professional workflow templates for common accounting tasks

## Features

### Tools (Interactive Functions)

The server implements comprehensive coverage of the Fakturoid API:

- **Account Management** - Get and update account information
- **Invoice Operations** - Full CRUD operations, search, filtering, and PDF generation
- **Expense Tracking** - Create, read, update, delete, and categorize expenses
- **Contact Management** - Manage subjects (companies and individuals)
- **Payment Processing** - Track and manage invoice and expense payments
- **Document Management** - Upload and manage files through inbox
- **Advanced Features** - Recurring generators, inventory management, webhooks

### Resources (Contextual Data)

Real-time business context through custom `fakturoid://` URI scheme:

- `fakturoid://account` - Account information and settings
- `fakturoid://dashboard/summary` - Financial overview and key metrics
- `fakturoid://invoices/recent` - Latest 20 invoices
- `fakturoid://invoices/open` - All unpaid invoices
- `fakturoid://invoices/overdue` - Overdue invoices requiring attention
- `fakturoid://expenses/recent` - Recent business expenses
- `fakturoid://expenses/open` - Unpaid expenses
- `fakturoid://subjects/recent` - Recently added contacts
- `fakturoid://subjects/customers` - Customer contacts
- `fakturoid://subjects/suppliers` - Supplier contacts

### Prompts (Workflow Templates)

Professional templates for common accounting workflows:

- `create_invoice` - Guided invoice creation with best practices
- `expense_categorization` - Tax-compliant expense handling
- `payment_followup` - Professional payment reminder communications
- `monthly_summary` - Comprehensive financial reporting
- `tax_preparation` - Tax documentation organization
- `client_analysis` - Customer relationship and profitability analysis

## Installation

### Prerequisites

- Node.js 24.2.0 or higher
- pnpm package manager
- Fakturoid API credentials

### Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd fakturoid-mcp
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Fakturoid API credentials:

   ```
   FAKTUROID_CLIENT_ID=your_client_id
   FAKTUROID_CLIENT_SECRET=your_client_secret
   FAKTUROID_REDIRECT_URI=your_redirect_uri
   FAKTUROID_USER_AGENT=your_app_name/1.0 (your_email@example.com)
   ```

4. Build the project:
   ```bash
   pnpm build
   ```

## Usage

### With Claude Desktop

1. Copy the example configuration:

   ```bash
   cp claude_desktop_config.example.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Update the configuration with your environment variables and correct path to the project.

3. Restart Claude Desktop to load the MCP server.

### Development Mode

Run the server in development mode with hot reload:

```bash
pnpm dev
```

### Testing with MCP Inspector

Test the server using the MCP Inspector UI:

```bash
pnpm ui
```

## Architecture

```
MCP Server
├── Transport Layer (stdio/SSE)
├── Protocol Handler (JSON-RPC 2.0)
├── Feature Handlers
│   ├── Tools (src/fakturoid/tools/)
│   ├── Resources (src/fakturoid/resources.ts)
│   └── Prompts (src/fakturoid/prompts.ts)
├── Fakturoid Client (src/fakturoid/client.ts)
└── OAuth Authentication
```

## Code Quality

- **TypeScript** - Full type safety with strict mode
- **Zod Validation** - Runtime schema validation for all inputs
- **Biome** - Code formatting and linting
- **Modular Design** - Clean separation of concerns

## Security

- OAuth 2.0 authentication flow
- Automatic token refresh
- Secure credential management via environment variables
- No hardcoded secrets or API keys

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Run `pnpm lint` and `pnpm format` before committing
4. Submit a pull request

## License

[Add your license here]

## Acknowledgments

Built with the [Model Context Protocol SDK](https://github.com/modelcontextprotocol/sdk) for seamless AI integration.
