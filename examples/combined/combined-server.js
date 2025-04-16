/**
 * Combined MCP Server Example
 *
 * This example shows how to set up a combined MCP server with all modules.
 */

import { createCombinedServer } from "@recallnet/external-mcp";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Check for required environment variables for Twitter
  if (
    !process.env.TWITTER_USERNAME ||
    !process.env.TWITTER_PASSWORD ||
    !process.env.TWITTER_EMAIL
  ) {
    console.warn(
      "Warning: Twitter credentials not found. Twitter module will have limited functionality.",
    );
  }

  // Create a combined server with all modules
  const server = createCombinedServer({
    name: "combined-example-server",
    version: "1.0.0",
    modules: ["twitter", "substack", "coingecko"],
    // Module-specific options
    twitterOptions: {
      includeReadTools: true,
      includeWriteTools: process.env.TWITTER_USERNAME !== undefined, // Only include write tools if credentials are available
    },
    substackOptions: {
      includeAllTools: true,
    },
    coingeckoOptions: {
      includeAllTools: true,
    },
  });

  console.log(`Server created: ${server.name} v${server.version}`);
  console.log(
    "Available modules:",
    server.availableModules || ["twitter", "substack", "coingecko"],
  );

  // Get help for all modules
  const helpResult = await server.execute("recall-help", { module: "all" });
  console.log("\nHelp for all modules:");
  console.log(helpResult);

  // Connect to transport (this example uses stdio)
  try {
    await server.connect();
    console.log("Server connected to transport");
    console.log("Server is ready to receive requests!");

    // Example of tools from different modules
    console.log("\nExample: Using tools from different modules");
    console.log("Use the following requests:");

    console.log("\n1. Get trending topics from Twitter:");
    console.log(`{
  "tool_name": "twitter-get-trends",
  "tool_args": {}
}`);

    console.log("\n2. Get the latest post from a Substack publication:");
    console.log(`{
  "tool_name": "substack-get-latest-post-simplified",
  "tool_args": {
    "substackId": "example.substack.com"
  }
}`);

    console.log("\n3. Get the price of Bitcoin:");
    console.log(`{
  "tool_name": "coingecko-get-price",
  "tool_args": {
    "tokenId": "bitcoin",
    "currency": "usd"
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
