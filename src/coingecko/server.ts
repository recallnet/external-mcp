import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as coingeckoClient from "./client.js";
import { fileURLToPath } from "url";

/**
 * Configuration options for the CoinGecko server
 */
export interface CoinGeckoServerOptions {
  /**
   * Server name (default: "coingecko-mcp-server")
   */
  name?: string;

  /**
   * Server version (default: "1.0.0")
   */
  version?: string;

  /**
   * Whether to include all available tools
   * (default: true, set to false to selectively enable tools)
   */
  includeAllTools?: boolean;

  /**
   * Whether to include basic tools (get price, search)
   * Only relevant if includeAllTools is false
   */
  includeBasicTools?: boolean;

  /**
   * Whether to include advanced tools (contract details, trending)
   * Only relevant if includeAllTools is false
   */
  includeAdvancedTools?: boolean;
}

/**
 * Creates a CoinGecko MCP server with the specified options
 * @param options Server configuration options
 * @returns Configured MCP server instance
 */
export function createCoinGeckoServer(
  options: CoinGeckoServerOptions = {},
): McpServer {
  // Set default options
  const serverOptions = {
    name: options.name || "coingecko-mcp-server",
    version: options.version || "1.0.0",
    includeAllTools: options.includeAllTools !== false, // Default to true
    includeBasicTools: options.includeBasicTools !== false, // Default to true
    includeAdvancedTools: options.includeAdvancedTools !== false, // Default to true
  };

  // Get available CoinGecko features
  const coingeckoFeatures = coingeckoClient.getAvailableFeatures();

  // Create a new MCP server
  const server = new McpServer({
    name: serverOptions.name,
    version: serverOptions.version,
  });

  // Add CoinGecko resource for available features
  server.resource(
    "coingecko-features",
    "coingecko://features",
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(coingeckoFeatures, null, 2),
        },
      ],
    }),
  );

  // Add basic tools if API access is available
  if (
    coingeckoFeatures.apiAccess &&
    (serverOptions.includeAllTools || serverOptions.includeBasicTools)
  ) {
    // Get token price
    server.tool(
      "coingecko-get-price",
      "Gets the current price of a cryptocurrency token in a specific currency.",
      {
        tokenId: z.string().describe("CoinGecko token ID (e.g., 'bitcoin')"),
        currency: z
          .string()
          .default("usd")
          .describe("Currency to get the price in (default: 'usd')"),
      },
      async ({ tokenId, currency }) => {
        const price = await coingeckoClient.getTokenPrice(tokenId, currency);

        return {
          content: [
            {
              type: "text",
              text: price
                ? JSON.stringify(price, null, 2)
                : `Price not found for ${tokenId}`,
            },
          ],
        };
      },
    );

    // Search tokens
    server.tool(
      "coingecko-search",
      "Searches for cryptocurrency tokens that match the provided query.",
      {
        query: z.string().describe("Search query"),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe("Maximum number of results to return (max: 100)"),
      },
      async ({ query, limit }) => {
        const results = await coingeckoClient.searchTokens(query, limit);

        return {
          content: [
            {
              type: "text",
              text:
                results.length > 0
                  ? JSON.stringify(results, null, 2)
                  : "No tokens found matching your query",
            },
          ],
        };
      },
    );
  }

  // Add advanced tools if API access is available
  if (
    coingeckoFeatures.apiAccess &&
    (serverOptions.includeAllTools || serverOptions.includeAdvancedTools)
  ) {
    // Get token contracts
    server.tool(
      "coingecko-get-contracts",
      "Gets contract addresses and chains for a specific token.",
      {
        tokenId: z.string().describe("CoinGecko token ID (e.g., 'ethereum')"),
      },
      async ({ tokenId }) => {
        const contracts = await coingeckoClient.getTokenContracts(tokenId);

        return {
          content: [
            {
              type: "text",
              text: contracts
                ? JSON.stringify(contracts, null, 2)
                : `Contract information not found for ${tokenId}`,
            },
          ],
        };
      },
    );

    // Get trending tokens
    server.tool(
      "coingecko-trending",
      "Gets a list of trending cryptocurrency tokens.",
      {
        limit: z
          .number()
          .min(1)
          .max(10)
          .default(10)
          .describe("Maximum number of trending tokens to return (max: 10)"),
      },
      async ({ limit }) => {
        const trending = await coingeckoClient.getTrendingTokens(limit);

        return {
          content: [
            {
              type: "text",
              text:
                trending.length > 0
                  ? JSON.stringify(trending, null, 2)
                  : "No trending tokens found",
            },
          ],
        };
      },
    );
  }

  // Add Pro API features tool to check availability
  server.tool(
    "coingecko-get-features",
    "Gets information about available CoinGecko API features based on your configuration.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(coingeckoFeatures, null, 2),
          },
        ],
      };
    },
  );

  return server;
}

export default createCoinGeckoServer;

/**
 * Run the CoinGecko MCP server directly with stdio transport
 */
// When this file is run directly by Node.js
if (
  require.main === module ||
  process.argv[1] === fileURLToPath(import.meta.url)
) {
  // Dynamic import to avoid TypeScript errors
  const { StdioServerTransport } = await import(
    "@modelcontextprotocol/sdk/server/stdio.js"
  );

  try {
    console.error("Starting CoinGecko MCP server...");
    const coingeckoServer = createCoinGeckoServer();
    const transport = new StdioServerTransport();

    // Handle stdin end for clean shutdown
    process.stdin.on("end", () => {
      process.exit(0);
    });

    await coingeckoServer.server.connect(transport);
    console.error("CoinGecko MCP server started and listening");
  } catch (error) {
    console.error("Failed to start CoinGecko MCP server:", error);
    process.exit(1);
  }
}
