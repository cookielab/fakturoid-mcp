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

- Node.js 24.2.0 (see `.node-version`)
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
   # Fakturoid OAuth Credentials
   CLIENT_ID=your-client-id
   CLIENT_SECRET=your-client-secret

   # Fakturoid API URL
   API_URL=https://app.fakturoid.cz/api/v3

   # MCP Transport type (stdio, sse, or http)
   MCP_TRANSPORT=http
   ```

4. Build the project:
   ```bash
   pnpm build
   ```

## Usage

### Transport Modes

The server supports three transport modes, configurable via the `MCP_TRANSPORT` environment variable:

1. **STDIO** (default) - Standard input/output communication, ideal for direct AI tool integration
2. **SSE** (deprecated) - Server-Sent Events, replaced by Streamable HTTP transport as of MCP protocol version 2024-11-05
3. **HTTP** (recommended for web) - Streamable HTTP transport with SSE support, suitable for stateless HTTP clients and web-based integrations

### With Claude Desktop

The server can be configured in Claude Desktop using any of the three transport modes. Example configurations are provided in `mcp.json`:

1. Copy the appropriate configuration:

   ```bash
   cp claude_desktop_config.example.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
   ```

2. Choose your preferred transport mode and update the configuration:

   **For STDIO mode (recommended for Claude Desktop):**

   ```json
   {
     "mcpServers": {
       "fakturoid": {
         "command": "pnpm",
         "args": ["dev"]
       }
     }
   }
   ```

   **For SSE mode (deprecated - use HTTP mode instead):**

   ```json
   {
     "mcpServers": {
       "fakturoid": {
         "type": "sse",
         "url": "http://localhost:5173/sse"
       }
     }
   }
   ```

   > **⚠️ Deprecation Notice**: SSE as a standalone transport is deprecated as of MCP protocol version 2024-11-05. Use HTTP mode instead, which incorporates SSE as an optional streaming mechanism.

   **For HTTP mode:**

   ```json
   {
     "mcpServers": {
       "fakturoid": {
         "type": "http",
         "url": "http://localhost:5173/mcp"
       }
     }
   }
   ```

3. Update the configuration with your environment variables and correct path to the project.

4. Restart Claude Desktop to load the MCP server.

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

The inspector will launch and connect to your server based on the configured transport mode:

- **STDIO**: Direct process communication
- **SSE** (deprecated): Available at `http://localhost:5173/sse`
- **HTTP**: Available at `http://localhost:5173/mcp`

## Migrating from SSE to HTTP Transport

If you're currently using the deprecated SSE transport, migrating to HTTP transport is straightforward:

### Configuration Changes

1. **Update your `.env` file**:

   ```bash
   # Change from:
   MCP_TRANSPORT=sse

   # To:
   MCP_TRANSPORT=http
   ```

2. **Update Claude Desktop configuration**:

   ```json
   // Change from:
   {
     "mcpServers": {
       "fakturoid": {
         "type": "sse",
         "url": "http://localhost:5173/sse"
       }
     }
   }

   // To:
   {
     "mcpServers": {
       "fakturoid": {
         "type": "http",
         "url": "http://localhost:5173/mcp"
       }
     }
   }
   ```

### Key Differences

- **Endpoint**: Changes from `/sse` to `/mcp`
- **Protocol**: HTTP transport supports bidirectional communication with session management
- **Streaming**: SSE functionality is still available within HTTP transport when needed
- **Performance**: Better connection handling and resumability support

### Why Migrate?

1. **Future-proof**: SSE transport is deprecated in MCP protocol version 2024-11-05
2. **Better Features**: HTTP transport includes session management, resumability, and better error handling
3. **Active Development**: All new features will be added to HTTP transport only

## Architecture

The server uses a flexible authentication strategy pattern that allows for different authentication methods:

```
MCP Server
├── Transport Layer
│   ├── STDIO (Standard I/O)
│   ├── SSE (Server-Sent Events - deprecated)
│   └── HTTP (Streamable HTTP with SSE support)
├── Protocol Handler (JSON-RPC 2.0)
├── Authentication Strategy
│   ├── Abstract Strategy (src/auth/strategy.ts)
│   └── Local Strategy (src/auth/localStrategy.ts)
├── Feature Handlers
│   ├── Tools (src/fakturoid/tools/)
│   ├── Resources (src/fakturoid/resources.ts)
│   └── Prompts (src/fakturoid/prompts.ts)
├── Fakturoid Client (src/fakturoid/client.ts)
└── OAuth 2.0 Authentication
```

### Key Architecture Features

- **Authentication Strategy Pattern**: Extensible authentication system supporting multiple auth methods
- **Automatic Account Detection**: No need to manually specify account slug - automatically determined from the authenticated user
- **Simplified Tool Interface**: All tools now work without requiring explicit account slug parameters
- **Multiple Transport Options**: Supports STDIO, SSE (deprecated), and HTTP transport modes for maximum flexibility
- **Session Management**: HTTP transport includes session management for stateless clients
- **Backwards Compatibility**: Maintains support for legacy SSE transport while encouraging migration to HTTP transport

## Implementing Custom Authentication Strategies

The server uses an extensible authentication strategy pattern that allows you to implement custom authentication methods. All strategies must extend the abstract `AuthenticationStrategy` class.

### Required Methods

```typescript
abstract class AuthenticationStrategy<Configuration extends object = object> {
  abstract getContactEmail(): Promise<string> | string;
  abstract getHeaders(
    headers: Record<string, string>,
  ): Promise<Record<string, string>>;
  abstract getAccessToken(): Promise<string>;
  abstract refreshToken(): Promise<string>;
}
```

### Example: LocalStrategy

The included `LocalStrategy` (see `src/auth/localStrategy.ts`) demonstrates a complete implementation using OAuth 2.0 client credentials:

```typescript
class LocalStrategy extends AuthenticationStrategy<Configuration> {
  async getAccessToken() {
    // Check if cached token is still valid
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }
    // Otherwise refresh the token
    return await this.refreshToken();
  }

  async refreshToken(): Promise<string> {
    // Implement OAuth 2.0 client credentials flow
    const response = await fetch(`${this.configuration.baseURL}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grant_type: "client_credentials" }),
    });
    // Parse response and cache token with expiry
    // ...
  }

  async getHeaders(headers: Record<string, string>) {
    const token = await this.getAccessToken();
    return {
      ...headers,
      Authorization: `Bearer ${token}`,
    };
  }
}
```

### Creating Your Own Strategy

To implement a custom authentication strategy:

1. Extend the `AuthenticationStrategy` class
2. Define your configuration interface
3. Implement all required methods
4. Use your strategy when creating the server:

```typescript
import { MyCustomStrategy } from "./auth/myCustomStrategy.ts";

const strategy = new MyCustomStrategy(myConfig);
const server = await createServer(strategy);
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
