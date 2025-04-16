#!/usr/bin/env node

/**
 * Test script for the combined MCP server
 * This script starts a combined server with all modules and demonstrates
 * how to interact with it using the MCP SDK client.
 */

import dotenv from "dotenv";
import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import {
  StdioClientTransport,
  StdioServerTransport,
} from "@modelcontextprotocol/sdk/server/stdio.js";
import { createCombinedServer } from "../src/index.js";
import { fork } from "child_process";

// Load environment variables
dotenv.config();

async function main() {
  console.log("Starting combined MCP server test...");

  // Fork a process to run the server
  const serverProcess = fork("./dist/index.js", [], {
    stdio: ["pipe", "pipe", "pipe", "ipc"],
    env: process.env,
  });

  // Wait for server to start
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Create a client
  const client = new McpClient();
  const transport = new StdioClientTransport({
    input: serverProcess.stdout,
    output: serverProcess.stdin,
  });

  try {
    // Connect to the server
    await client.connect(transport);
    console.log("Connected to combined server!");

    // Get the server info
    const infoResource = await client.resource("recall://info");
    console.log("\nServer Info:");
    console.log(infoResource.contents[0].text);

    // Test Twitter module if available
    try {
      const twitterStatus = await client.resource("twitter://status");
      console.log("\nTwitter Status:");
      console.log(twitterStatus.contents[0].text);

      if (JSON.parse(twitterStatus.contents[0].text).status === "active") {
        console.log("\nTesting Twitter trends...");
        const trendsResult = await client.invoke("twitter-get-trends", {});
        console.log(
          `Twitter trends retrieved successfully! Found ${
            JSON.parse(trendsResult.content[0].text).length
          } trending topics.`,
        );
      }
    } catch (error) {
      console.log("\nTwitter module test failed:", error.message);
    }

    // Test Substack module if available
    try {
      const substackStatus = await client.resource("substack://status");
      console.log("\nSubstack Status:");
      console.log(substackStatus.contents[0].text);

      if (JSON.parse(substackStatus.contents[0].text).status === "active") {
        console.log("\nTesting Substack publications...");
        const substackResult = await client.invoke("getPublicationInfo", {
          substackId: "sinocism.com",
        });
        console.log("Substack publication info retrieved successfully!");
        console.log(substackResult);
      }
    } catch (error) {
      console.log("\nSubstack module test failed:", error.message);
    }

    // Test CoinGecko module if available
    try {
      const coingeckoStatus = await client.resource("coingecko://status");
      console.log("\nCoinGecko Status:");
      console.log(coingeckoStatus.contents[0].text);

      if (JSON.parse(coingeckoStatus.contents[0].text).status === "active") {
        console.log("\nTesting CoinGecko price...");
        const coingeckoResult = await client.invoke("coingecko-get-price", {
          tokenId: "bitcoin",
          currency: "usd",
        });
        console.log("CoinGecko price retrieved successfully!");
        console.log(coingeckoResult);
      }
    } catch (error) {
      console.log("\nCoinGecko module test failed:", error.message);
    }

    console.log("\nAll tests completed!");
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    // Clean up
    try {
      await client.disconnect();
    } catch (e) {
      console.error("Error disconnecting client:", e);
    }

    console.log("Shutting down server...");
    serverProcess.kill();
  }
}

main().catch((error) => {
  console.error("Test script failed:", error);
  process.exit(1);
});
