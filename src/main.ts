import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { FakturoidClient } from "./fakturoid/client.js";
import { registerFakturoidTools } from "./fakturoid/tools.js";
import { registerFakturoidResources } from "./fakturoid/resources.js";
import { registerFakturoidPrompts } from "./fakturoid/prompts.js";
import { env } from "./utils/env.js";

// Create an MCP server with full capabilities
const server = new McpServer({
  name: "Fakturoid MCP",
  version: "1.0.0",
});

// Log environment variables in development mode (without sensitive values)
if (process.env.NODE_ENV === 'development') {
  console.error('Environment variables detected:');
  console.error(`- FAKTUROID_ACCOUNT_SLUG: ${process.env.FAKTUROID_ACCOUNT_SLUG ? '[set]' : '[not set]'}`);
  console.error(`- FAKTUROID_CLIENT_ID: ${process.env.FAKTUROID_CLIENT_ID ? '[set]' : '[not set]'}`);
  console.error(`- FAKTUROID_CLIENT_SECRET: ${process.env.FAKTUROID_CLIENT_SECRET ? '[set]' : '[not set]'}`);
  console.error(`- FAKTUROID_APP_NAME: ${process.env.FAKTUROID_APP_NAME ? '[set]' : '[not set]'}`);
  console.error(`- FAKTUROID_CONTACT_EMAIL: ${process.env.FAKTUROID_CONTACT_EMAIL ? '[set]' : '[not set]'}`);
}

// Initialize Fakturoid client
const fakturoidClient = new FakturoidClient({
  accountSlug: env.FAKTUROID_ACCOUNT_SLUG,
  clientId: env.FAKTUROID_CLIENT_ID,
  clientSecret: env.FAKTUROID_CLIENT_SECRET,
  appName: env.FAKTUROID_APP_NAME,
  contactEmail: env.FAKTUROID_CONTACT_EMAIL,
});

// Register all MCP features
registerFakturoidTools(server, fakturoidClient);

// Register resources and prompts using the underlying server instance
// Access the underlying Server instance from McpServer to use low-level handlers
const underlyingServer = (server as any).server;
registerFakturoidResources(underlyingServer, fakturoidClient);
registerFakturoidPrompts(underlyingServer);

// For Claude and similar AI tools, always prefer stdio mode 
// This ensures better compatibility when run as a child process
const forcedMode = process.env.MCP_FORCE_MODE;
const isRunningFromAI = process.env.AI_RUNTIME === 'true' || process.argv.includes('--ai-runtime');
const isStdioMode = forcedMode === 'stdio' || isRunningFromAI || !process.stdin.isTTY || !process.stdout.isTTY;

if (isStdioMode) {
  // Running in stdio mode
  console.error("Running in stdio mode. Processing MCP messages from stdin.");
  try {
    const stdioTransport = new StdioServerTransport();
    server.connect(stdioTransport).catch(error => {
      console.error("Error connecting stdio transport:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to initialize stdio transport:", error);
    process.exit(1);
  }
} else {
  // Running in interactive terminal mode - use SSE/HTTP
  // Create Express app
  const app = express();
  const PORT = env.PORT;

  // Set up SSE transport
  let transport: SSEServerTransport | undefined = undefined;

  app.get("/sse", async (req, res) => {
    console.log("SSE connection established.");
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
    req.on("close", () => {
      console.log("SSE connection closed.");
    });
  });

  app.post("/messages", async (req, res) => {
    if (!transport) {
      console.error("SSE transport not ready for POST /messages");
      res.status(400);
      res.json({ error: "No transport" });
      return;
    }
    await transport.handlePostMessage(req, res);
  });

  // Start the Express server
  app.listen(PORT, () => {
    console.log(`SSE Server is running on port ${PORT}`);
    console.log(`Connect to SSE endpoint at http://localhost:${PORT}/sse`);
    console.log(`Send messages to http://localhost:${PORT}/messages`);
  });
}