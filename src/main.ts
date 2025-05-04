import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FakturoidClient } from "./fakturoid/client.js";
import { registerFakturoidTools } from "./fakturoid/mcp.js";
import { env } from "./utils/env.js";

// Create an MCP server
const server = new McpServer({
  name: "Fakturoid MCP",
  version: "1.0.0",
});

// Initialize Fakturoid client
const fakturoidClient = new FakturoidClient({
  accountSlug: env.FAKTUROID_ACCOUNT_SLUG,
  email: env.FAKTUROID_EMAIL,
  apiKey: env.FAKTUROID_API_KEY,
  appName: env.FAKTUROID_APP_NAME,
  contactEmail: env.FAKTUROID_CONTACT_EMAIL,
});

// Register Fakturoid tools
registerFakturoidTools(server, fakturoidClient);

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport); 