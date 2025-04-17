# Combined Server Documentation

This document provides detailed information about the combined server in the `@recallnet/external-mcp` package, which allows you to use all modules (Twitter, Substack, CoinGecko) together through a unified interface.

## Overview

The combined server provides a single MCP server instance that integrates all available modules. This makes it easier to set up and manage multiple data sources for AI models, reducing the need to configure and run separate servers for each module.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Configuration

Create a `.env` file with the required environment variables for the modules you want to use:

```bash
# Twitter credentials (required for Twitter module)
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TWITTER_EMAIL=your_twitter_email

# CoinGecko API key (optional - only for Pro features)
COINGECKO_API_KEY=your_api_key

# Server configuration
PORT=3008
```

## Usage

### Basic setup

```javascript
import dotenv from "dotenv";

import { createCombinedServer } from "@recallnet/external-mcp";

// Load environment variables
dotenv.config();

// Create combined server with all modules
const server = createCombinedServer({
  name: "combined-mcp-server",
  version: "1.0.0",
  modules: ["twitter", "substack", "coingecko"], // Include all modules
});

// Connect to transport
await server.connect();
```

### Selective Module Loading

You can choose which modules to include:

```javascript
// Create server with only Twitter and Substack
const server = createCombinedServer({
  modules: ["twitter", "substack"], // Only include Twitter and Substack
});
```

### Module-Specific Options

You can configure each module individually:

```javascript
const server = createCombinedServer({
  modules: ["twitter", "substack", "coingecko"],
  // Twitter-specific options
  twitterOptions: {
    includeReadTools: true,
    includeWriteTools: false,
    includeGrokTools: false,
  },
  // Substack-specific options
  substackOptions: {
    includeAllTools: true,
  },
  // CoinGecko-specific options
  coingeckoOptions: {
    includeBasicTools: true,
    includeAdvancedTools: false,
  },
});
```

## Available Resources and Tools

The combined server includes all resources and tools from the enabled modules, plus:

| Resource      | Description                                               |
| ------------- | --------------------------------------------------------- |
| `recall-info` | Information about the server, including available modules |

| Tool Name     | Description                                            |
| ------------- | ------------------------------------------------------ |
| `recall-help` | Get help information about available modules and tools |

## Tool Prefixes

Tools from each module maintain their original prefixes for clear identification:

- Twitter tools: `twitter-*` (e.g., `twitter-get-profile`)
- Substack tools: `substack-*` (e.g., `substack-get-publication-info`)
- CoinGecko tools: `coingecko-*` (e.g., `coingecko-get-price`)

## Claude Integration

To integrate the combined server with Claude, add the following configuration to your Claude settings:

```json
{
  "mcpServers": {
    "recall-external": {
      "command": "node",
      "args": ["path/to/combined-server.js"],
      "env": {
        "TWITTER_USERNAME": "your_twitter_username",
        "TWITTER_PASSWORD": "your_twitter_password",
        "TWITTER_EMAIL": "your_twitter_email",
        "COINGECKO_API_KEY": "your_api_key_if_you_have_one",
        "PORT": "3008"
      }
    }
  }
}
```

Once configured, Claude can access all data sources through MCP tools:

```
Claude, please get the trending topics on Twitter and also check the price of Bitcoin.
```

## Error Handling

The combined server handles module initialization failures gracefully:

- If a module fails to initialize due to missing credentials or other issues, error information is added to the status resource for that module
- Other modules will continue to work normally
- The `recall-help` tool shows only active modules

## Examples

See the `examples/combined` directory for working examples.
