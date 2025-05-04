import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
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

// Create Express app
const app = express();
const PORT = env.PORT;

// Set up SSE transport
let transport: SSEServerTransport | undefined = undefined;

app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (!transport) {
    res.status(400);
    res.json({ error: "No transport" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Connect to SSE endpoint at http://localhost:${PORT}/sse`);
  console.log(`Send messages to http://localhost:${PORT}/messages`);
}); 