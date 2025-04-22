import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import * as coingeckoClient from './client.js';

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

  /**
   * Whether to include the features tool that shows API capabilities
   * (default: false)
   */
  includeFeaturesTool?: boolean;
}

/**
 * Creates a CoinGecko MCP server with the specified options
 * @param options Server configuration options
 * @returns Configured MCP server instance
 */
export function createCoinGeckoServer(options: CoinGeckoServerOptions = {}): McpServer {
  // Set default options
  const serverOptions = {
    name: options.name || 'coingecko-mcp-server',
    version: options.version || '1.0.0',
    includeAllTools: options.includeAllTools !== false, // Default to true
    includeBasicTools: options.includeBasicTools !== false, // Default to true
    includeAdvancedTools: options.includeAdvancedTools !== false, // Default to true
    includeFeaturesTool: options.includeFeaturesTool === true, // Default to false
  };

  // Get available CoinGecko features
  const coingeckoFeatures = coingeckoClient.getAvailableFeatures();

  // Create a new MCP server
  const server = new McpServer({
    name: serverOptions.name,
    version: serverOptions.version,
  });

  // Add CoinGecko resource for available features
  server.resource('coingecko-features', 'coingecko://features', async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(coingeckoFeatures, null, 2),
      },
    ],
  }));

  // Add basic tools if API access is available
  if (
    coingeckoFeatures.apiAccess &&
    (serverOptions.includeAllTools || serverOptions.includeBasicTools)
  ) {
    // Get token price
    server.tool(
      'coingecko-get-price',
      "Gets the current price and market data of a cryptocurrency token in USD, including market capitalization, 24h volume, and 24h price change. The tokenId parameter must be the CoinGecko internal ID (not the symbol). You can find a token's ID using the coingecko-search tool.",
      {
        tokenId: z
          .string()
          .describe(
            "CoinGecko token ID (e.g., 'bitcoin' for Bitcoin, 'ethereum' for Ethereum). Use the coingecko-search tool to find a token's ID.",
          ),
      },
      async ({ tokenId }) => {
        // Call the refactored getTokenPrice which now only takes tokenId and currency
        const tokenInfo = await coingeckoClient.getTokenPrice(tokenId, 'usd');

        return {
          content: [
            {
              type: 'text',
              text: tokenInfo
                ? JSON.stringify(tokenInfo, null, 2)
                : `Price not found for ${tokenId}`,
            },
          ],
        };
      },
    );

    // Search tokens
    server.tool(
      'coingecko-search',
      'Searches for cryptocurrency tokens that match the provided query. Returns the token symbol, name, market rank, and most importantly the CoinGecko asset ID which is required to use other tools like coingecko-get-price.',
      {
        query: z
          .string()
          .describe(
            "Search query for cryptocurrency name or symbol (e.g., 'bitcoin', 'ethereum', 'BTC', 'ETH')",
          ),
        limit: z
          .number()
          .min(1)
          .max(100)
          .default(10)
          .describe('Maximum number of results to return (max: 100)'),
      },
      async ({ query, limit }) => {
        const results = await coingeckoClient.searchTokens(query, limit);

        return {
          content: [
            {
              type: 'text',
              text:
                results.length > 0
                  ? JSON.stringify(results, null, 2)
                  : 'No tokens found matching your query',
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
      'coingecko-get-contracts',
      "Gets contract addresses and blockchain platforms for a specific cryptocurrency token. This is useful for finding the token's smart contract addresses across different blockchains.",
      {
        tokenId: z
          .string()
          .describe(
            "CoinGecko token ID (e.g., 'ethereum' for Ethereum). Use the coingecko-search tool to find a token's ID.",
          ),
      },
      async ({ tokenId }) => {
        const contracts = await coingeckoClient.getTokenContracts(tokenId);

        return {
          content: [
            {
              type: 'text',
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
      'coingecko-trending',
      "Gets a list of currently trending cryptocurrency tokens based on CoinGecko search and popularity metrics. Each result includes the token's ID which can be used with other tools.",
      {
        limit: z
          .number()
          .min(1)
          .max(10)
          .default(10)
          .describe('Maximum number of trending tokens to return (max: 10)'),
      },
      async ({ limit }) => {
        const trending = await coingeckoClient.getTrendingTokens(limit);

        return {
          content: [
            {
              type: 'text',
              text:
                trending.length > 0
                  ? JSON.stringify(trending, null, 2)
                  : 'No trending tokens found',
            },
          ],
        };
      },
    );
  }

  // Add Pro API features tool to check availability
  if (serverOptions.includeFeaturesTool) {
    server.tool(
      'coingecko-get-features',
      "Gets information about available CoinGecko API features based on your configuration. Shows whether you're using the free API or the Pro API with an API key.",
      {},
      async () => {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(coingeckoFeatures, null, 2),
            },
          ],
        };
      },
    );
  }

  return server;
}

export default createCoinGeckoServer;

async function runServer() {
  try {
    console.error('Starting CoinGecko MCP server...');
    const coingeckoServer = createCoinGeckoServer();
    const transport = new StdioServerTransport();

    // Handle stdin end for clean shutdown
    process.stdin.on('end', () => {
      process.exit(0);
    });

    await coingeckoServer.server.connect(transport);
    console.error('CoinGecko MCP server started and listening');
  } catch (error) {
    console.error('Failed to start Substack MCP server:', error);
    process.exit(1);
  }
}

// Run the server
runServer();
