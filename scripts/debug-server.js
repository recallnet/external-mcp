#!/usr/bin/env node

/**
 * Debug script to directly run and test the MCP server
 * without using the MCP client
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

// Get the directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse arguments
const [, , moduleArg = "twitter"] = process.argv;

// Determine which module server to run
let serverPath;
switch (moduleArg) {
  case "twitter":
    serverPath = path.resolve(__dirname, "../dist/twitter/server.js");
    break;
  case "substack":
    serverPath = path.resolve(__dirname, "../dist/substack/server.js");
    break;
  case "coingecko":
    serverPath = path.resolve(__dirname, "../dist/coingecko/server.js");
    break;
  case "combined":
    serverPath = path.resolve(__dirname, "../dist/index.js");
    break;
  default:
    console.error(`Unknown module: ${moduleArg}`);
    process.exit(1);
}

// Start the server
console.log(`Starting ${moduleArg} server using: ${serverPath}`);

const serverProcess = spawn("node", [serverPath], {
  env: {
    ...process.env,
    NODE_ENV: "development",
    DEBUG: "true",
  },
  stdio: "inherit", // This will pipe the output directly to our console
});

// Handle process events
serverProcess.on("error", (error) => {
  console.error("Failed to start server:", error);
});

serverProcess.on("close", (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle Ctrl+C to terminate the server
process.on("SIGINT", () => {
  console.log("Terminating server...");
  serverProcess.kill("SIGINT");
  process.exit(0);
});

console.log("Debug server running. Press Ctrl+C to exit.");
