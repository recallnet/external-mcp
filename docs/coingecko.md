# CoinGecko Module Documentation

This document provides detailed information about the CoinGecko module in the `@recallnet/external-mcp` package, including setup, configuration, and available tools.

## Overview

The CoinGecko module provides access to cryptocurrency data through the Model Context Protocol (MCP). It allows AI models like Claude to retrieve token prices, search for tokens, get contract addresses, and access trending cryptocurrency information.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Configuration

The CoinGecko module works with the free API by default. For Pro API access, you'll need to provide an API key in your `.env` file:

```bash
COINGECKO_API_KEY=your_api_key
```

## Usage

### Basic setup

```javascript
import { createCoinGeckoServer } from "@recallnet/external-mcp/coingecko";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Create server
const server = createCoinGeckoServer({
  name: "coingecko-mcp-server",
  version: "1.0.0",
  includeAllTools: true, // Include all tools
  includeBasicTools: true, // Include basic tools only (get price, search)
  includeAdvancedTools: true, // Include advanced tools (contracts, trending)
});

// Connect to transport
await server.connect();
```

### Available Features

The CoinGecko client automatically detects available features based on your configuration:

```javascript
import { getAvailableFeatures } from "@recallnet/external-mcp/coingecko";
const features = getAvailableFeatures();
console.log(features);
```

Features include:

- `apiAccess`: Whether the basic CoinGecko API is accessible
- `proAccess`: Whether the Pro API is accessible (requires API key)

## Available Tools

### Basic Tools

| Tool Name                | Description                      | Parameters                                                  |
| ------------------------ | -------------------------------- | ----------------------------------------------------------- |
| `coingecko-get-price`    | Get the current price of a token | `tokenId` (required), `currency` (optional, default: "usd") |
| `coingecko-search`       | Search for tokens                | `query` (required), `limit` (optional, default: 10)         |
| `coingecko-get-features` | Check available API features     | None                                                        |

### Advanced Tools

| Tool Name                 | Description                        | Parameters                      |
| ------------------------- | ---------------------------------- | ------------------------------- |
| `coingecko-get-contracts` | Get contract addresses for a token | `tokenId` (required)            |
| `coingecko-trending`      | Get trending tokens                | `limit` (optional, default: 10) |

## Token IDs

CoinGecko uses specific token IDs that may differ from common names:

- Bitcoin: `bitcoin`
- Ethereum: `ethereum`
- Solana: `solana`

When in doubt, use the `coingecko-search` tool to find the correct token ID.

## Claude Integration

To integrate the CoinGecko module with Claude, add the following configuration to your Claude settings:

```json
{
  "mcpServers": {
    "coingecko": {
      "command": "node",
      "args": ["path/to/coingecko-server.js"],
      "env": {
        "COINGECKO_API_KEY": "your_api_key_if_you_have_one"
      }
    }
  }
}
```

Once configured, Claude can access CoinGecko data through MCP tools:

```
Claude, what is the current price of Bitcoin?
```

## Error Handling

Common errors:

- Rate limiting: Free API has strict rate limits
- Token not found: Check the token ID
- API key issues: Verify your API key if using Pro features

## Examples

See the `examples/coingecko` directory for working examples.
