# Fakturoid MCP Server

This project provides a Model Context Protocol (MCP) server that enables AI models to interact with the Fakturoid API, allowing you to integrate accounting and invoicing functionality into your AI tools in Cursor.

## 📋 Features

- **Complete Fakturoid API Integration** - Access Fakturoid's accounting and invoicing features
- **Model Context Protocol Support** - Built on MCP v1.11.0
- **Easy Integration with Cursor** - Seamlessly connect to Cursor AI tools

## 🚀 Getting Started

### Prerequisites

- Node.js 22.0.0 or higher
- pnpm package manager (recommended) or npm
- Fakturoid account with API access

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/fakturoid-mcp.git
   cd fakturoid-mcp
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Create a `.env` file in the project root with your Fakturoid credentials:
   ```
   # Fakturoid API Credentials
   FAKTUROID_ACCOUNT_SLUG=your-account-slug
   FAKTUROID_EMAIL=your-email@example.com
   FAKTUROID_API_KEY=your-api-key
   FAKTUROID_APP_NAME=Your App Name
   FAKTUROID_CONTACT_EMAIL=contact-email@example.com

   # Server Configuration
   PORT=3456
   ```

   > **Note:** You can find your API credentials in your Fakturoid account settings.

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. The server will be running at `http://localhost:3456`

## 📞 Supported API Endpoints

The Fakturoid MCP server exposes the following tools for AI models to use:

### Users API

- `fakturoid_get_current_user` - Get information about the current user

### Accounts API

- `fakturoid_get_account` - Get details about your Fakturoid account
- `fakturoid_update_account` - Update your account information

### Invoices API

- `fakturoid_get_invoices` - List invoices with optional filtering
  - Parameters: page, since, updated_since, until, updated_until, status, subject_id
- `fakturoid_get_invoice` - Get details of a specific invoice
  - Parameters: id
- `fakturoid_create_invoice` - Create a new invoice
  - Parameters: invoiceData (with subject_id, lines, etc.)
- `fakturoid_update_invoice` - Update an existing invoice
  - Parameters: id, invoiceData
- `fakturoid_delete_invoice` - Delete an invoice
  - Parameters: id

### Expenses API

- `fakturoid_get_expenses` - List expenses with optional filtering
  - Parameters: page, since, updated_since, until, updated_until, status
- `fakturoid_get_expense` - Get details of a specific expense
  - Parameters: id
- `fakturoid_create_expense` - Create a new expense
  - Parameters: expenseData (with supplier_name, etc.)
- `fakturoid_update_expense` - Update an existing expense
  - Parameters: id, expenseData
- `fakturoid_delete_expense` - Delete an expense
  - Parameters: id

## 🔗 Connecting to Cursor

To connect this MCP server to Cursor, follow these steps:

1. Start the MCP server:
   ```bash
   pnpm dev
   ```

2. In Cursor, open Settings and navigate to the AI tab.

3. Scroll down to the "Model Context Protocol (MCP)" section.

4. Add a new MCP source with the following URL:
   ```
   http://localhost:3456/sse
   ```

5. Save the settings and restart Cursor if necessary.

6. Your Fakturoid MCP tools should now be available in Cursor's AI assistant.

## 🤖 Connecting to Claude

To connect this MCP server to your local Claude desktop app, follow these steps:

1. Start the MCP server:
   ```bash
   pnpm dev
   ```

2. Open the Claude desktop app on your computer.

3. Start a new conversation or continue an existing one.

4. Click on your profile or settings icon in the Claude app.

5. Navigate to "Settings" and look for "Developer" or "Extensions" options.

6. Add a new MCP connection with the local URL:
   ```
   http://localhost:3456/sse
   ```

7. Save the settings.

8. Your Fakturoid tools should now be available to Claude in your local conversations.

## 🧪 Developing Locally

- Run in development mode with automatic restart: `pnpm dev`
- Build for production: `pnpm build`
- Start the production build: `node dist/main.js`

## 🔍 Troubleshooting

- **Connection Issues**: Make sure your MCP server is running and the URL is correct in Cursor settings.
- **Authentication Errors**: Double-check your Fakturoid API credentials in the `.env` file.
- **Tool Not Found**: Ensure you're using the correct tool names as listed in this README.

## 📄 License

This project is licensed under the MIT License. 