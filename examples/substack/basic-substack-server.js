/**
 * Basic Substack MCP Server Example
 *
 * This example shows how to set up a Substack MCP server.
 */

import { createSubstackServer } from "@recallnet/external-mcp/substack";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Create a Substack MCP server with default options
  const server = createSubstackServer({
    name: "substack-example-server",
    version: "1.0.0",
  });

  console.log(
    `Server created: ${server.server.name} v${server.server.version}`,
  );
  console.log("Available tools:");

  // List registered tools
  server.server.tools.forEach((tool) => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });

  // Connect to transport (this example uses stdio)
  try {
    await server.connect();
    console.log("Server connected to transport");
    console.log("Server is ready to receive requests!");

    // Example 1: Get recent posts with pagination
    console.log("\nExample 1: Get recent posts with pagination");
    console.log("Use the following request:");
    console.log(`{
  "tool_name": "getRecentPosts",
  "tool_args": {
    "substackId": "example.substack.com",
    "page": 1
  }
}`);

    // Example 2: Get a post's content in markdown format
    console.log("\nExample 2: Get a post's content in markdown format");
    console.log("Use the following request:");
    console.log(`{
  "tool_name": "getContentBySlug",
  "tool_args": {
    "substackId": "example.substack.com",
    "slug": "post-slug",
    "format": "markdown"
  }
}`);

    // Example 3: Get the latest post's content
    console.log("\nExample 3: Get the latest post's content");
    console.log("Use the following request:");
    console.log(`{
  "tool_name": "getContentLatest",
  "tool_args": {
    "substackId": "example.substack.com",
    "format": "plain"
  }
}`);

    // Example 4: Search for posts with pagination
    console.log("\nExample 4: Search for posts with pagination");
    console.log("Use the following request:");
    console.log(`{
  "tool_name": "searchPosts",
  "tool_args": {
    "substackId": "example.substack.com",
    "searchTerm": "ai",
    "page": 1
  }
}`);

  } catch (error) {
    console.error("Failed to connect server:", error);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
