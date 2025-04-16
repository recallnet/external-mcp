#!/usr/bin/env node

/**
 * MCP Test Client
 *
 * A simple CLI tool to test MCP servers
 *
 * Usage:
 *   node scripts/test-client.js [module] [command]
 *
 * Examples:
 *   node scripts/test-client.js combined help
 *   node scripts/test-client.js twitter list-tools
 *   node scripts/test-client.js substack list-resources
 *   node scripts/test-client.js coingecko call-tool recall-help all
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the built servers
const SERVER_PATH = path.resolve(__dirname, "../dist/index.js");

// Parse arguments
const [, , moduleArg = "combined", command = "help", ...args] = process.argv;

// Map modules to their environment variables
const moduleMapping = {
  twitter: ["twitter"],
  substack: ["substack"],
  coingecko: ["coingecko"],
  combined: ["twitter", "substack", "coingecko"],
};

const modules = moduleMapping[moduleArg] || moduleMapping.combined;

// Create a transport
const transport = new StdioClientTransport({
  command: "node",
  args: [SERVER_PATH],
  env: {
    ...process.env,
    MODULES: modules.join(","),
    NODE_ENV: "development",
  },
});

// Create a client
const client = new Client({
  name: "test-client",
  version: "1.0.0",
});

async function main() {
  try {
    console.log(`Connecting to ${moduleArg} server...`);
    await client.connect(transport);
    console.log("Connected successfully!");

    switch (command) {
      case "help":
        console.log(`
MCP Test Client
--------------

Available commands:
  help              - Show this help message
  list-tools        - List all available tools
  list-resources    - List all available resources
  call-tool <name> [args...] - Call a tool
  read-resource <uri> - Read a resource

Examples:
  node scripts/test-client.js twitter list-tools
  node scripts/test-client.js substack call-tool recall-help substack
  node scripts/test-client.js coingecko read-resource coingecko://status
  node scripts/test-client.js combined call-tool recall-help all
        `);
        break;

      case "list-tools":
        const tools = await client.listTools();
        console.log("Available tools:");
        tools.forEach((tool) => {
          console.log(`- ${tool.name}: ${tool.description}`);
        });
        break;

      case "list-resources":
        const resources = await client.listResources();
        console.log("Available resources:");
        resources.forEach((resource) => {
          console.log(`- ${resource.uri}`);
        });
        break;

      case "call-tool": {
        const [toolName, ...toolArgs] = args;
        if (!toolName) {
          console.error("Error: Tool name is required");
          process.exit(1);
        }

        // Parse tool arguments
        const toolArgObj = {};
        if (toolName === "recall-help" && toolArgs.length > 0) {
          toolArgObj.module = toolArgs[0];
        }

        console.log(`Calling tool: ${toolName}`);
        const result = await client.callTool({
          name: toolName,
          arguments: toolArgObj,
        });

        console.log("Result:", JSON.stringify(result, null, 2));
        break;
      }

      case "read-resource": {
        const [uri] = args;
        if (!uri) {
          console.error("Error: Resource URI is required");
          process.exit(1);
        }

        console.log(`Reading resource: ${uri}`);
        const resource = await client.readResource({ uri });
        console.log("Resource:", JSON.stringify(resource, null, 2));
        break;
      }

      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    // Disconnect
    try {
      await client.disconnect();
    } catch (e) {
      console.error("Error disconnecting:", e);
    }
  }
}

main();
