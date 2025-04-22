/**
 * Basic Twitter MCP Server Example
 *
 * This example shows how to set up a Twitter MCP server with read-only tools.
 */

import { createTwitterServer } from "@recallnet/external-mcp/twitter";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Check for required environment variables
  if (
    !process.env.TWITTER_USERNAME ||
    !process.env.TWITTER_PASSWORD ||
    !process.env.TWITTER_EMAIL
  ) {
    console.error(
      "Error: Twitter credentials are required. Please set TWITTER_USERNAME, TWITTER_PASSWORD, and TWITTER_EMAIL environment variables.",
    );
    process.exit(1);
  }

  // Create a Twitter MCP server with read-only tools
  const server = createTwitterServer({
    name: "twitter-example-server",
    version: "1.0.0",
    includeReadTools: true,
    includeWriteTools: false, // Set to true to enable write operations (tweet, like, follow)
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
  } catch (error) {
    console.error("Failed to connect server:", error);
  }
}

// Run the main function
main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
});
