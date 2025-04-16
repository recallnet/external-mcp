#!/usr/bin/env node

/**
 * Minimal test MCP server using stdio transport
 * This is a direct implementation using the MCP SDK
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Create a simple MCP server
const server = new McpServer({
  name: "test-mcp-server",
  version: "1.0.0",
});

// Add a simple echo tool
server.tool(
  "echo",
  "Echoes back the input message",
  {
    message: z.string().describe("The message to echo back"),
  },
  async ({ message }) => {
    console.error(`Received message: ${message}`);
    return {
      content: [
        {
          type: "text",
          text: `You said: ${message}`,
        },
      ],
    };
  },
);

// Add a simple resource
server.resource("test", "test://hello", async (uri) => ({
  contents: [
    {
      uri: uri.href,
      text: "Hello, world!",
    },
  ],
}));

async function main() {
  try {
    // Create a stdio transport
    const transport = new StdioServerTransport();

    // Set up error handling
    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

    // IMPORTANT: This setup is needed for stdio transport to work correctly
    process.stdin.on("end", () => {
      console.error("stdin ended, shutting down");
      process.exit(0);
    });

    // Connect to the transport
    console.error("Connecting to transport...");
    await server.connect(transport);
    console.error("Server started. Waiting for requests...");

    // Handle termination
    process.on("SIGINT", async () => {
      console.error("Shutting down server...");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// Run the server
main();
