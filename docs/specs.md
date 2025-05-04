# MCP Server Specifications

This document outlines the specifications for the MCP (Model Context Protocol) server project.

## Overview

The MCP server provides tools and resources for AI models to interact with the Fakturoid API v3, enabling integration with the accounting and invoicing service.

## Features

- **MCP Protocol Support**: Full implementation of the MCP protocol version 1.11.0
- **Fakturoid API Integration**: Integration with Fakturoid API v3
  - Users API: Get current user information
  - Account API: Get and update account details
  - Invoices API: CRUD operations for invoices
  - Expenses API: CRUD operations for expenses
- **SSE Transport**: Server-Sent Events transport for communication with MCP clients

## Requirements

- Node.js 22+
- TypeScript 5.8+
- Fakturoid account and API credentials

## Configuration

Create a `.env` file in the project root with the following variables:

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

## Development

To develop the MCP server:

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build
```

## Endpoints

The server provides the following HTTP endpoints:

- `GET /sse`: Connect to the server via Server-Sent Events
- `POST /messages`: Send messages to the MCP server

## Example Usage

1. Start the server with `pnpm dev`
2. Connect to `http://localhost:3456/sse` to establish an SSE connection
3. Send messages to `http://localhost:3456/messages` to interact with the MCP tools
