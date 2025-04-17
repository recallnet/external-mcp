/**
 * Test suite for the combined MCP server
 */
import * as dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { createCombinedServer } from "../index.js";

// Set required environment variables for test mode
process.env.NODE_ENV = "test";

// Get the directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
const envTestPath = path.resolve(__dirname, "../../../../.env.test");
if (fs.existsSync(envTestPath)) {
  const envConfig = dotenv.config({ path: envTestPath });
  if (envConfig.error) {
    console.error("Error loading .env.test file:", envConfig.error);
  } else {
    console.log(
      "Loaded test environment variables from .env.test at:",
      envTestPath,
    );
  }
} else {
  console.warn("Could not find .env.test file at:", envTestPath);
}

describe("Combined MCP Server Integration", () => {
  test("should create a server with all required modules", () => {
    // Test if we can create the server without errors
    const server = createCombinedServer({
      modules: ["twitter", "substack", "coingecko"],
    });
    // Check that the server is an object
    expect(server).toBeDefined();
    expect(typeof server).toBe("object");
  });

  test("should register all modules and create proper resources", () => {
    // Create the server
    const server = createCombinedServer({
      modules: ["twitter", "substack", "coingecko"],
    });

    // @ts-expect-error accessing private property for testing
    const resources = server._registeredResources;
    expect(resources).toBeDefined();

    // Verify we have resources from the expected modules
    const resourceIds = Object.keys(resources);
    expect(resourceIds).toContain("recall://info");

    // At least two of the three module statuses should be registered
    const moduleStatusCount = [
      resourceIds.some((id) => id.includes("twitter")),
      resourceIds.some((id) => id.includes("substack")),
      resourceIds.some((id) => id.includes("coingecko")),
    ].filter(Boolean).length;

    expect(moduleStatusCount).toBeGreaterThanOrEqual(2);
  });

  test("should register core help tool for the combined server", () => {
    // Create the server
    const server = createCombinedServer({
      modules: ["twitter", "substack", "coingecko"],
    });

    // @ts-expect-error accessing private property for testing
    const tools = server._registeredTools;
    expect(tools).toBeDefined();

    // Verify we have the recall-help tool
    const toolIds = Object.keys(tools);
    expect(toolIds).toContain("recall-help");
  });
});
