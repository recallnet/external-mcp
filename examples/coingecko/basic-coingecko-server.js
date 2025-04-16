/**
 * Basic CoinGecko MCP Server Example
 *
 * This example shows how to set up a CoinGecko MCP server.
 */

import { createCoinGeckoServer } from "@recallnet/external-mcp/coingecko";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

async function main() {
  // Create a CoinGecko MCP server with default options
  const server = createCoinGeckoServer({
    name: "coingecko-example-server",
    version: "1.0.0",
    // If you have a CoinGecko Pro API key, it will be automatically used from the COINGECKO_API_KEY environment variable
  });

  console.log(
    `Server created: ${server.server.name} v${server.server.version}`,
  );
  console.log("Available tools:");

  // List registered tools
  server.server.tools.forEach((tool) => {
    console.log(`- ${tool.name}: ${tool.description}`);
  });

  // Check API features
  const features = await server.server.execute("coingecko-get-features", {});
  console.log("\nAvailable CoinGecko API features:");
  console.log(features);

  // Connect to transport (this example uses stdio)
  try {
    await server.connect();
    console.log("Server connected to transport");
    console.log("Server is ready to receive requests!");

    // Example of how to get the price of Bitcoin
    console.log("\nExample: Get the price of Bitcoin");
    console.log("Use the following request:");
    console.log(`{
  "tool_name": "coingecko-get-price",
  "tool_args": {
    "tokenId": "bitcoin",
    "currency": "usd"
  }
}`);

    // Example of how to search for tokens
    console.log("\nExample: Search for tokens");
    console.log("Use the following request:");
    console.log(`{
  "tool_name": "coingecko-search",
  "tool_args": {
    "query": "ethereum",
    "limit": 5
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
