/**
 * Twitter module for @recallnet/external-mcp
 * Provides MCP server and client functionality for interacting with Twitter/X.
 */
// Export everything from the client module
export * from "./client.js";
// Export server functionality
export { createTwitterServer } from "./server.js";
// Default export
import { createTwitterServer as createServer } from "./server.js";
export default createServer;
