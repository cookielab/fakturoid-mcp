# Fakturoid MCP Server

This project provides a Model Context Protocol (MCP) server that enables AI models to interact with the Fakturoid API, allowing you to integrate accounting and invoicing functionality into your AI tools in Cursor.

## 📋 Features

- **Complete Fakturoid API Integration** - Access Fakturoid's accounting and invoicing features
- **Model Context Protocol Support** - Built on MCP v1.11.0
- **Easy Integration with Cursor** - Seamlessly connect to Cursor AI tools
- **OAuth 2.0 Authentication** - Secure access to your Fakturoid account

## 🚀 Getting Started

### Prerequisites

- Node.js 22.0.0 or higher
- pnpm package manager (recommended) or npm
- Fakturoid account with API access

### Authentication Setup

Fakturoid API v3 requires OAuth 2.0 authentication. You need to obtain OAuth credentials from your Fakturoid account:

1. Log in to your Fakturoid account
2. Go to **Settings → User account**
3. Look for the API section (or Client Credentials section)
4. Generate or view your **Client ID** and **Client Secret**

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
   FAKTUROID_CLIENT_ID=your-client-id
   FAKTUROID_CLIENT_SECRET=your-client-secret
   FAKTUROID_APP_NAME=Your App Name
   FAKTUROID_CONTACT_EMAIL=contact-email@example.com

   # Server Configuration
   PORT=3456
   ```

   > **Note:** You can find your OAuth credentials in your Fakturoid account settings as described above.

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. The server will be running at `http://localhost:3456`

## 🚀 Running with OAuth Authentication

After setting up your OAuth credentials, you can run the MCP server in different ways:

### Development Mode

For local development with hot reloading:

```bash
pnpm dev
```

### Production Mode

Build and run in production mode:

```bash
pnpm build
NODE_ENV=production node dist/main.js
```

### Testing OAuth Authentication

To verify your OAuth authentication is working correctly:

```bash
# Run with debug output
DEBUG=true NODE_ENV=development node dist/main.js

# Test a specific API endpoint
curl -X GET http://localhost:3456/api/test

# Or use the MCP Inspector
npx @modelcontextprotocol/inspector node dist/main.js
```

### Command-line Arguments

The server supports these command-line arguments:

- `--ai-runtime`: Force stdio mode for AI assistants
- `--debug`: Enable debug logging

Example:
```bash
node dist/main.js --ai-runtime --debug
```

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

To connect this MCP server to your local Claude desktop app, you have two options:

### Option 1: Web Server Mode (HTTP/SSE)

1. Start the MCP server:
   ```bash
   pnpm dev
   ```

2. Open the Claude desktop app on your computer.

3. Navigate to Settings > Developer > Edit Config.

4. Add a new MCP connection with the local URL:
   ```
   http://localhost:3456/sse
   ```

5. Save the settings and restart Claude.

### Option 2: Direct Integration with OAuth (Recommended)

1. Build the MCP server:
   ```bash
   pnpm build
   ```

2. Open the Claude desktop app on your computer.

3. Navigate to Settings > Developer > Edit Config.

4. Add the following to your `claude_desktop_config.json` file:
   ```json
   {
     "mcpServers": {
       "fakturoid": {
         "command": "node",
         "args": [
           "/FULL/PATH/TO/fakturoid-mcp/dist/main.js",
           "--ai-runtime"
         ],
         "env": {
           "FAKTUROID_ACCOUNT_SLUG": "your-account-slug",
           "FAKTUROID_CLIENT_ID": "your-client-id",
           "FAKTUROID_CLIENT_SECRET": "your-client-secret",
           "FAKTUROID_APP_NAME": "FakturoidMCP",
           "FAKTUROID_CONTACT_EMAIL": "your-contact-email@example.com",
           "NODE_ENV": "development",
           "DEBUG": "true"
         }
       }
     }
   }
   ```

5. **OAuth Credentials**: Make sure to replace the placeholders with your actual Fakturoid OAuth credentials:
   - `your-account-slug`: Your Fakturoid account slug (e.g., `mycompany`)
   - `your-client-id`: Client ID from Fakturoid Settings → User account
   - `your-client-secret`: Client Secret from Fakturoid Settings → User account

6. **Full Path**: Replace `/FULL/PATH/TO/` with the absolute path to your project directory.
   - macOS/Linux example: `/Users/username/projects/fakturoid-mcp`
   - Windows example: `C:\\Users\\username\\projects\\fakturoid-mcp`

7. Save the settings and restart Claude.

8. Your Fakturoid tools should now be available to Claude in your local conversations.

9. To verify it's working, ask Claude to get your current Fakturoid user info or list expenses.

## 🧪 Developing Locally

- Run in development mode with automatic restart: `pnpm dev`
- Build for production: `pnpm build`
- Start the production build: `node dist/main.js`

## 🔍 Troubleshooting

### Connection Issues
- Make sure your MCP server is running and the URL is correct in Cursor settings.
- Check if the server is accessible from your network (especially relevant for remote connections).

### OAuth Authentication Errors
- **Invalid Credentials**: Verify your Client ID and Client Secret are correct and not expired.
- **Token Errors**: If you see "Failed to obtain token" errors, check:
  - Your credentials have not been revoked
  - Your account has API access enabled
  - You're using the correct account slug
- **Permission Denied**: Ensure your OAuth credentials have the necessary scopes/permissions in Fakturoid.
- **Debug Mode**: Run with `DEBUG=true` to see detailed authentication logs.

### Claude Desktop Integration Issues
- **JSON Parsing Error**: If you see `Unexpected token 'U', "Users modu"... is not valid JSON` in Claude Desktop:
  - This occurs when `console.log` statements write non-JSON data to stdout
  - Make sure all debugging output uses `console.error` instead of `console.log` 
  - Rebuild the project with `pnpm build` after any code changes
  - Restart Claude Desktop to pick up the changes
- **Server Connection**: Ensure your Claude Desktop config uses the correct path to `dist/main.js`
- **Environment Variables**: Verify all required environment variables are set in your Claude Desktop config

### Common Error Messages
- **401 Unauthorized**: Your OAuth credentials are invalid or expired.
- **403 Forbidden**: Your account doesn't have permission to perform the requested action.
- **404 Not Found**: The requested resource doesn't exist (check account slug).
- **429 Too Many Requests**: You've hit API rate limits (the client will retry automatically).

### Tool Usage Issues
- Ensure you're using the correct tool names as listed in this README.
- Check the parameters match the expected format.

### Enabling Debug Logs
To see more detailed logs:

```bash
DEBUG=true NODE_ENV=development node dist/main.js
```

This will show API call attempts, token refresh operations, and any errors encountered.

## 📄 License

This project is licensed under the MIT License.

### OAuth Token Management

The MCP server includes automatic OAuth token management:

- **Token Caching**: OAuth tokens are cached in memory for better performance
- **Automatic Refresh**: Tokens are automatically refreshed when they expire (every 2 hours)
- **Error Handling**: Token failures are properly handled with detailed error messages

You don't need to manually refresh tokens or handle token expiration. The server takes care of this for you. 