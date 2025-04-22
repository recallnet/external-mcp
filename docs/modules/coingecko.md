# CoinGecko Module

This module provides tools to interact with CoinGecko API, allowing access to cryptocurrency data including prices, contract information, and market trends.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Configuration

For the free API, no configuration is required. For the Pro API, create a `.env` file with your API key:

```
COINGECKO_API_KEY=your_coingecko_api_key
```

## Usage

```javascript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createCoinGeckoServer } from '@recallnet/external-mcp/coingecko';

// Create server with options
const coingeckoServer = createCoinGeckoServer({
  name: 'my-coingecko-server',
  version: '1.0.0',
  includeAllTools: true,
  includeBasicTools: true,
  includeAdvancedTools: true,
});

// Connect with stdio transport
const transport = new StdioServerTransport();
coingeckoServer.server.connect(transport).then(() => {
  console.log('CoinGecko MCP server started');
});
```

## Available Tools

### Basic Tools

#### coingecko-get-price

Gets the current price of a cryptocurrency token.

**Parameters:**

- `tokenId` (string, required): The CoinGecko ID of the token (e.g., "bitcoin", "ethereum")
- `currency` (string, optional): The currency to return the price in (default: "usd")

**Example:**

```javascript
const result = await client.invoke('coingecko-get-price', {
  tokenId: 'bitcoin',
  currency: 'usd',
});
```

#### coingecko-search

Searches for cryptocurrency tokens by name or symbol.

**Parameters:**

- `query` (string, required): The search query
- `limit` (number, optional): Maximum number of results to return (default: 10)

**Example:**

```javascript
const result = await client.invoke('coingecko-search', {
  query: 'sol',
  limit: 5,
});
```

### Advanced Tools

#### coingecko-get-contracts

Gets contract addresses for a cryptocurrency token across different blockchains.

**Parameters:**

- `tokenId` (string, required): The CoinGecko ID of the token

**Example:**

```javascript
const result = await client.invoke('coingecko-get-contracts', {
  tokenId: 'uniswap',
});
```

#### coingecko-trending

Gets the currently trending cryptocurrencies on CoinGecko.

**Parameters:**

- `limit` (number, optional): Maximum number of results to return (default: 7)

**Example:**

```javascript
const result = await client.invoke('coingecko-trending', {
  limit: 5,
});
```

### Utility Tools

#### coingecko-get-features

Gets information about available CoinGecko API features based on your configuration.

**Parameters:**

- None

**Example:**

```javascript
const result = await client.invoke('coingecko-get-features', {});
```

## Response Format

All tools return responses in a structured format:

```javascript
{
  content: [
    {
      type: 'text',
      text: JSON.stringify(data, null, 2),
    },
  ];
}
```

## Pro API Features

When using the CoinGecko Pro API with your API key, you'll have access to:

- Higher rate limits
- More data points
- Reduced throttling
- Priority access during high traffic

## Error Handling

Errors are returned in a consistent format:

```javascript
{
  content: [
    {
      type: 'text',
      text: 'Error: API request failed with status 429 (Too Many Requests)',
    },
  ];
}
```
