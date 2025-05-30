# Fakturoid MCP Server

A comprehensive Model Context Protocol (MCP) server for integrating with Fakturoid accounting software. This server provides AI applications with access to your Fakturoid data through **tools**, **resources**, and **prompts**.

## Features

### 🔧 Tools (Active Operations)
Interactive tools that allow AI models to perform actions on your Fakturoid account:
- **Account Management**: Get account details and user information
- **Invoice Operations**: Create, read, update, search, and manage invoices
- **Expense Management**: Handle business expenses and categorization
- **Contact Management**: Manage subjects (clients, vendors, contacts)
- **Payment Tracking**: Record and track invoice and expense payments
- **File Management**: Handle document uploads and management

### 📚 Resources (Contextual Data)
Rich contextual data that AI models can access for informed assistance:
- **Account Information**: Current account details and settings
- **Recent Invoices**: Latest 20 invoices from your account
- **Open/Overdue Invoices**: Unpaid invoices requiring attention
- **Recent Expenses**: Latest business expenses
- **Contact Lists**: Company and individual contacts
- **Dashboard Summary**: Key metrics and recent activity overview

### 💡 Prompts (Guided Workflows)
Pre-built templates for common accounting workflows:
- **Invoice Creation**: Guided invoice creation with best practices
- **Expense Categorization**: Proper expense categorization for tax purposes
- **Payment Follow-up**: Professional overdue payment communications
- **Monthly Summaries**: Comprehensive financial reporting
- **Tax Preparation**: Organized tax documentation assistance
- **Client Analysis**: Business relationship and profitability insights

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your Fakturoid credentials
   ```

3. **Build the server:**
   ```bash
   npm run build
   ```

4. **Run the server:**
   ```bash
   npm start
   ```

## Configuration

Set these environment variables in your `.env` file:

```env
FAKTUROID_ACCOUNT_SLUG=your-account-slug
FAKTUROID_CLIENT_ID=your-client-id
FAKTUROID_CLIENT_SECRET=your-client-secret
FAKTUROID_APP_NAME=your-app-name
FAKTUROID_CONTACT_EMAIL=your-email@example.com
PORT=3000
```

## Usage Examples

### Using Resources for Context
Access real-time Fakturoid data:
- `fakturoid://account` - Account information
- `fakturoid://invoices/recent` - Recent invoices
- `fakturoid://dashboard/summary` - Financial overview

### Using Tools for Actions
Perform operations on your Fakturoid account:
- Create new invoices with proper formatting
- Categorize and record business expenses
- Search and filter invoices by various criteria
- Manage client and vendor information

### Using Prompts for Workflows
Get guided assistance with:
- Professional invoice creation
- Tax-compliant expense categorization
- Payment follow-up communications
- Monthly financial analysis
- Tax preparation organization

## API Coverage

This MCP server implements the full Fakturoid API:

- ✅ **Users** - User account management
- ✅ **Accounts** - Account information and settings
- ✅ **Invoices** - Complete invoice lifecycle management
- ✅ **Expenses** - Business expense tracking
- ✅ **Subjects** - Contact and client management
- ✅ **Invoice Payments** - Payment recording and tracking
- ✅ **Expense Payments** - Expense payment management
- ✅ **Inbox Files** - Document and file management

## MCP Protocol Support

This server implements the full Model Context Protocol specification:

- ✅ **Tools** - Interactive functions for AI models
- ✅ **Resources** - Contextual data access
- ✅ **Prompts** - Templated workflows
- ✅ **Authentication** - Secure OAuth2 integration
- ✅ **Error Handling** - Comprehensive error reporting
- ✅ **Transport Support** - stdio and SSE transports

## Development

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Type checking
npm run type-check

# Build for production
npm run build

# Run tests
npm test
```

## Architecture

The server is built with a modular architecture:

- **Client Layer** (`src/fakturoid/client.ts`) - Fakturoid API integration
- **Tools Layer** (`src/fakturoid/tools.ts` + `src/fakturoid/tools/`) - MCP tool implementations
- **Resources Layer** (`src/fakturoid/resources.ts`) - MCP resource handlers
- **Prompts Layer** (`src/fakturoid/prompts.ts`) - MCP prompt templates
- **Transport Layer** (`src/main.ts`) - MCP protocol handling

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## Support

- Check the [Fakturoid API documentation](https://www.fakturoid.cz/api/v2.html)
- Review the [Model Context Protocol specification](https://modelcontextprotocol.io/)
- Open an issue for bugs or feature requests 