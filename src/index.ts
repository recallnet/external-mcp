/**
 * @recallnet/external-mcp
 * A modular Model Context Protocol (MCP) library providing access to various external data feeds
 */

import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";
import { z } from "zod";
import { fileURLToPath } from "url";

// Module imports
import { createTwitterServer } from "./twitter/server.js";
import { createSubstackServer } from "./substack/server.js";
import { createCoinGeckoServer } from "./coingecko/server.js";

// Re-export module functionality without causing naming conflicts
export { default as twitter } from "./twitter/index.js";
export { default as substack } from "./substack/index.js";
export { default as coingecko } from "./coingecko/index.js";
export * as utils from "./utils/index.js";

// Load environment variables
dotenv.config();

/**
 * Available modules that can be included in the combined server
 */
export type ModuleType = "twitter" | "substack" | "coingecko";

/**
 * Configuration options for the combined MCP server
 */
export interface CombinedServerOptions {
  /**
   * Server name (default: "recall-mcp-server")
   */
  name?: string;

  /**
   * Server version (default: "1.0.0")
   */
  version?: string;

  /**
   * List of modules to include (default: all modules)
   */
  modules?: ModuleType[];

  /**
   * Twitter-specific options
   */
  twitterOptions?: {
    /**
     * Whether to include all Twitter tools
     */
    includeAllTools?: boolean;

    /**
     * Whether to include read-only Twitter tools
     */
    includeReadTools?: boolean;

    /**
     * Whether to include write Twitter tools
     */
    includeWriteTools?: boolean;

    /**
     * Whether to include Grok tools
     */
    includeGrokTools?: boolean;
  };

  /**
   * Substack-specific options
   */
  substackOptions?: {
    /**
     * Whether to include all tools
     */
    includeAllTools?: boolean;
  };

  /**
   * CoinGecko-specific options
   */
  coingeckoOptions?: {
    /**
     * Whether to include all CoinGecko tools
     */
    includeAllTools?: boolean;

    /**
     * Whether to include basic CoinGecko tools
     */
    includeBasicTools?: boolean;

    /**
     * Whether to include advanced CoinGecko tools
     */
    includeAdvancedTools?: boolean;
  };
}

/**
 * Creates a combined MCP server with all or selected modules
 * @param options Server configuration options
 * @returns Configured MCP server instance
 */
export function createCombinedServer(
  options: CombinedServerOptions = {},
): McpServer {
  // Set default options
  const serverOptions = {
    name: options.name || "recall-mcp-server",
    version: options.version || "1.0.0",
    modules: options.modules || ["twitter", "substack", "coingecko"],
  };

  // Create a new MCP server
  const server = new McpServer({
    name: serverOptions.name,
    version: serverOptions.version,
  });

  // Add combined server resource
  server.resource("recall-info", "recall://info", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(
          {
            name: serverOptions.name,
            version: serverOptions.version,
            modules: serverOptions.modules,
          },
          null,
          2,
        ),
      },
    ],
  }));

  // Add module-specific tools based on configuration

  // Add Twitter module
  if (serverOptions.modules.includes("twitter")) {
    try {
      const twitterServer = createTwitterServer({
        name: `${serverOptions.name}-twitter`,
        version: serverOptions.version,
        includeAllTools: options.twitterOptions?.includeAllTools,
        includeReadTools: options.twitterOptions?.includeReadTools,
        includeWriteTools: options.twitterOptions?.includeWriteTools,
        includeGrokTools: options.twitterOptions?.includeGrokTools,
      });

      // Access the internal server instance to copy its resources and tools
      const twitterMcpServer = twitterServer.server;

      // Here we would merge the registered resources and tools from twitterServer
      // However, since the McpServer doesn't expose a way to directly access registered tools,
      // we rely on the fact that the tools are already registered in the twitterServer

      server.resource("twitter-status", "twitter://status", async (uri) => ({
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(
              {
                status: "active",
                module: "twitter",
                server: `${serverOptions.name}-twitter`,
                version: serverOptions.version,
              },
              null,
              2,
            ),
          },
        ],
      }));
    } catch (error) {
      console.error("Error initializing Twitter module:", error);
      server.resource("twitter-status", "twitter://status", async (uri) => ({
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(
              {
                status: "error",
                module: "twitter",
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2,
            ),
          },
        ],
      }));
    }
  }

  // Add Substack module
  if (serverOptions.modules.includes("substack")) {
    try {
      // Note: The Substack server options may be different, passing only name and version
      const substackServer = createSubstackServer({
        name: `${serverOptions.name}-substack`,
        version: serverOptions.version,
      });

      // Access the internal server instance to copy its resources and tools
      const substackMcpServer = substackServer.server;

      server.resource("substack-status", "substack://status", async (uri) => ({
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(
              {
                status: "active",
                module: "substack",
                server: `${serverOptions.name}-substack`,
                version: serverOptions.version,
              },
              null,
              2,
            ),
          },
        ],
      }));
    } catch (error) {
      console.error("Error initializing Substack module:", error);
      server.resource("substack-status", "substack://status", async (uri) => ({
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(
              {
                status: "error",
                module: "substack",
                error: error instanceof Error ? error.message : String(error),
              },
              null,
              2,
            ),
          },
        ],
      }));
    }
  }

  // Add CoinGecko module
  if (serverOptions.modules.includes("coingecko")) {
    try {
      const coingeckoServer = createCoinGeckoServer({
        name: `${serverOptions.name}-coingecko`,
        version: serverOptions.version,
        includeAllTools: options.coingeckoOptions?.includeAllTools,
        includeBasicTools: options.coingeckoOptions?.includeBasicTools,
        includeAdvancedTools: options.coingeckoOptions?.includeAdvancedTools,
      });

      // Access the internal server instance to copy its resources and tools
      const coingeckoMcpServer = coingeckoServer.server;

      server.resource(
        "coingecko-status",
        "coingecko://status",
        async (uri) => ({
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  status: "active",
                  module: "coingecko",
                  server: `${serverOptions.name}-coingecko`,
                  version: serverOptions.version,
                },
                null,
                2,
              ),
            },
          ],
        }),
      );
    } catch (error) {
      console.error("Error initializing CoinGecko module:", error);
      server.resource(
        "coingecko-status",
        "coingecko://status",
        async (uri) => ({
          contents: [
            {
              uri: uri.href,
              text: JSON.stringify(
                {
                  status: "error",
                  module: "coingecko",
                  error: error instanceof Error ? error.message : String(error),
                },
                null,
                2,
              ),
            },
          ],
        }),
      );
    }
  }

  // Add a help tool to show available modules and tools
  server.tool(
    "recall-help",
    "Gets information about the available modules and tools in this server.",
    {
      module: z
        .enum(["all", "twitter", "substack", "coingecko"])
        .default("all")
        .describe("The module to get help for (default: 'all')"),
    },
    async ({ module }) => {
      const activeModules = serverOptions.modules;

      let helpText = `# Recall External MCP Server\n\n`;
      helpText += `Version: ${serverOptions.version}\n\n`;

      if (module === "all") {
        helpText += `## Active Modules\n\n`;
        helpText += activeModules.map((m) => `- ${m}`).join("\n");
        helpText += `\n\nUse \`recall-help\` with a specific module name to see detailed help.`;
      } else if (module === "twitter" && activeModules.includes("twitter")) {
        helpText += `## Twitter Module\n\n`;
        helpText += `Tools for accessing Twitter/X data and functionality.\n\n`;
        helpText += `### Available Tools\n\n`;
        helpText += `- twitter-get-profile: Get a user's profile information\n`;
        helpText += `- twitter-get-tweets: Get recent tweets from a user\n`;
        helpText += `- twitter-search-tweets: Search for tweets\n`;
        helpText += `- twitter-get-trends: Get trending topics\n`;
        helpText += `- twitter-send-tweet: Send a tweet (requires authentication)\n`;
        helpText += `- twitter-like-tweet: Like a tweet (requires authentication)\n`;
        helpText += `- twitter-follow-user: Follow a user (requires authentication)\n`;
      } else if (module === "substack" && activeModules.includes("substack")) {
        helpText += `## Substack Module\n\n`;
        helpText += `Tools for accessing Substack publications and content.\n\n`;
        helpText += `### Available Tools\n\n`;
        helpText += `- substack-get-publication-info: Get information about a publication\n`;
        helpText += `- substack-get-recent-posts: Get recent posts from a publication\n`;
        helpText += `- substack-get-post: Get a specific post by ID\n`;
        helpText += `- substack-get-comments: Get comments for a post\n`;
        helpText += `- substack-search-posts: Search for posts in a publication\n`;
        helpText += `- getContentBySlug: Get post content in plain text/markdown format by slug\n`;
        helpText += `- getContentLatest: Get the latest post's content in plain text/markdown format\n`;
        helpText += `- getMetadataBySlug: Get metadata for a post by its slug\n`;
        helpText += `- getPostMetadata: Get metadata for a post by URL\n`;
      } else if (
        module === "coingecko" &&
        activeModules.includes("coingecko")
      ) {
        helpText += `## CoinGecko Module\n\n`;
        helpText += `Tools for accessing cryptocurrency data from CoinGecko.\n\n`;
        helpText += `### Available Tools\n\n`;
        helpText += `- coingecko-get-price: Get the current price of a token\n`;
        helpText += `- coingecko-search: Search for tokens\n`;
        helpText += `- coingecko-get-contracts: Get contract addresses for a token\n`;
        helpText += `- coingecko-trending: Get trending tokens\n`;
        helpText += `- coingecko-get-features: Check available CoinGecko API features\n`;
      } else {
        helpText += `Module "${module}" is not available or not enabled in this server.`;
      }

      return {
        content: [
          {
            type: "text",
            text: helpText,
          },
        ],
      };
    },
  );

  return server;
}

/**
 * Main function to run the combined MCP server with stdio transport
 */
export async function main() {
  try {
    // Check for modules in environment variable
    const modulesEnv = process.env.MODULES;
    let modules: ModuleType[] | undefined = undefined;

    if (modulesEnv) {
      // Parse comma-separated list of modules
      const modulesList = modulesEnv.split(",").map((m) => m.trim());

      // Filter to only valid module types
      modules = modulesList.filter(
        (m) => m === "twitter" || m === "substack" || m === "coingecko",
      ) as ModuleType[];

      console.error(`Loading specified modules: ${modules.join(", ")}`);
    }

    // Create the server with options based on environment
    const server = createCombinedServer({
      modules,
    });

    // Create a stdio transport
    const transport = new StdioServerTransport();

    // Set up error handling
    process.on("uncaughtException", (error) => {
      console.error("Uncaught exception:", error);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
    });

    // CRITICAL: This event handler is needed for stdio transport to work properly
    // The server will naturally exit when stdin ends, which is the expected behavior for MCP servers
    process.stdin.on("end", () => {
      console.error("stdin ended, shutting down");
      process.exit(0);
    });

    // Connect to the transport and start the server
    console.error("Connecting to transport...");
    await server.connect(transport);
    console.error("Server started. Waiting for requests on stdio transport...");

    // Handle termination signals
    process.on("SIGINT", async () => {
      console.error("Shutting down server...");
      process.exit(0);
    });

    process.on("SIGTERM", async () => {
      console.error("Shutting down server...");
      process.exit(0);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
}

// If this file is executed directly (not imported), start the server
if (
  require.main === module ||
  process.argv[1] === fileURLToPath(import.meta.url)
) {
  main().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}

// Default export
export default createCombinedServer;
