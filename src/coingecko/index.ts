/**
 * CoinGecko module for @recallnet/external-mcp
 * Provides MCP server and client functionality for interacting with cryptocurrency data.
 */

// Export everything from the client module
export * from "./client.js";

// Export server functionality
export { createCoinGeckoServer } from "./server.js";
export type { CoinGeckoServerOptions } from "./server.js";

// Re-export important interfaces for better discoverability
export type {
  CoinGeckoFeatures,
  TokenPrice,
  TokenContract,
  SearchResult,
} from "./client.js";

// Default export
import { createCoinGeckoServer as createServer } from "./server.js";
export default createServer;
