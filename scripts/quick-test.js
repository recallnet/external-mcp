#!/usr/bin/env node

/**
 * Quick test for MCP servers
 * This tests directly connecting to an individual module's server
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { fileURLToPath } from "url";
import path from "path";

// Get the directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default to substack if no module specified
const moduleArg = process.argv[2] || "substack";

// Map module names to server paths
const SERVER_PATHS = {
  twitter: path.resolve(__dirname, "../dist/twitter/server.js"),
  substack: path.resolve(__dirname, "../dist/substack/server.js"),
  coingecko: path.resolve(__dirname, "../dist/coingecko/server.js"),
};

const serverPath = SERVER_PATHS[moduleArg];
if (!serverPath) {
  console.error(`Unknown module: ${moduleArg}`);
  console.error(`Valid modules: ${Object.keys(SERVER_PATHS).join(", ")}`);
  process.exit(1);
}

async function main() {
  console.log(`Testing ${moduleArg} server...`);
  console.log(`Using server at ${serverPath}`);

  // Create client with transport to the server
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [serverPath],
    env: {
      DEBUG: "true",
    },
  });

  const client = new Client({
    name: "quick-test-client",
    version: "1.0.0",
  });

  try {
    // Connect to the server
    console.log("Connecting to server...");
    await client.connect(transport);
    console.log("Connected successfully!");

    // List available tools
    console.log("\nAvailable tools:");
    const tools = await client.listTools();
    for (const tool of tools) {
      console.log(`- ${tool.name}: ${tool.description}`);
    }

    // List available resources
    console.log("\nAvailable resources:");
    const resources = await client.listResources();
    for (const resource of resources) {
      console.log(`- ${resource.uri}`);
    }

    // Disconnect
    console.log("\nDisconnecting...");
    await client.disconnect();
    console.log("Test completed successfully!");
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
