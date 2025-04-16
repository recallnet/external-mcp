/**
 * Twitter module for @recallnet/external-mcp
 * Provides MCP server and client functionality for interacting with Twitter/X.
 */

// Export everything from the client module
export * from "./client.js";

// Export server functionality
export { createTwitterServer } from "./server.js";
export type { TwitterServerOptions } from "./server.js";

// Re-export TwitterFeatures interface for better discoverability
export type {
  TwitterFeatures,
  TwitterUser,
  GrokMessage,
  GrokChatResponse,
  TwitterDirectMessagesResponse,
  TwitterSendDirectMessageResponse,
} from "./client.js";

// Default export
import { createTwitterServer as createServer } from "./server.js";
export default createServer;
