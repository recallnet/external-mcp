#!/usr/bin/env node

/**
 * Minimal test MCP client to connect to the test server
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the test server
const TEST_SERVER_PATH = path.resolve(__dirname, "./test-stdio-server.js");

async function main() {
  try {
    console.log("Creating MCP client...");

    // Create a transport
    const transport = new StdioClientTransport({
      command: "node",
      args: [TEST_SERVER_PATH],
    });

    // Create a client
    const client = new Client({
      name: "test-client",
      version: "1.0.0",
    });

    // Connect to the server
    console.log("Connecting to test server...");
    await client.connect(transport);
    console.log("Connected to test server!");

    // List tools
    console.log("\nListing available tools:");
    const tools = await client.listTools();
    console.log(JSON.stringify(tools, null, 2));

    // List resources
    console.log("\nListing available resources:");
    const resources = await client.listResources();
    console.log(JSON.stringify(resources, null, 2));

    // Call the echo tool
    console.log("\nCalling echo tool:");
    const result = await client.callTool({
      name: "echo",
      arguments: {
        message: "Hello, MCP!",
      },
    });
    console.log(JSON.stringify(result, null, 2));

    // Read the test resource
    console.log("\nReading test resource:");
    const resource = await client.readResource({
      uri: "test://hello",
    });
    console.log(JSON.stringify(resource, null, 2));

    // Disconnect
    console.log("\nDisconnecting...");
    await client.disconnect();
    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
