# @recallnet/external-mcp

A modular Model Context Protocol (MCP) library providing access to various external data feeds.

## Overview

This library serves as a collection of MCP servers and clients for accessing external data sources:

- **Twitter**: Access tweets, user profiles, trends, and more
- **Substack**: Retrieve posts, publications, comments, and content
- **CoinGecko**: Get cryptocurrency prices, trends, and market data

The library is designed with a modular approach, allowing you to use each module independently or combine them into a single MCP server.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Usage

## Individual Modules

Each module can be used independently:

```javascript
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { createCoinGeckoServer } from "@recallnet/external-mcp/coingecko";
import { createSubstackServer } from "@recallnet/external-mcp/substack";
import { createTwitterServer } from "@recallnet/external-mcp/twitter";

// Create individual servers
const twitterServer = createTwitterServer();
const substackServer = createSubstackServer();
const coingeckoServer = createCoinGeckoServer();

// Connect and start listening
const transport = new StdioServerTransport();
twitterServer.server.connect(transport).then(() => {
  console.log("Twitter MCP server started");
});
```

## Configuration

Each module accepts configuration options:

### Twitter Server Options

```javascript
const twitterServer = createTwitterServer({
  name: "custom-twitter-server",
  version: "1.0.0",
  includeAllTools: true,
  includeReadTools: true,
  includeWriteTools: false,
  includeGrokTools: false,
});
```

### Substack Server Options

```javascript
const substackServer = createSubstackServer({
  name: "custom-substack-server",
  version: "1.0.0",
  includeAllTools: true,
});
```

### CoinGecko Server Options

```javascript
const coingeckoServer = createCoinGeckoServer({
  name: "custom-coingecko-server",
  version: "1.0.0",
  includeAllTools: true,
  includeBasicTools: true,
  includeAdvancedTools: false,
});
```
## Available Tools

### Twitter Tools

- `twitter-get-user`: Get detailed information about a Twitter user
- `twitter-get-tweet`: Get details about a specific tweet
- `twitter-search-tweets`: Search for tweets containing specific terms
- `twitter-get-trends`: Get current Twitter trends
- `twitter-send-tweet`: Send a tweet (requires authentication)
- `twitter-get-followers`: Get followers for a user
- `twitter-get-following`: Get accounts a user is following
- `twitter-get-dm-conversations`: Get direct messages
- And more...

### Substack Tools

- `getRecentPosts`: Get recent posts from a Substack publication
- `getPostBySlug`: Get a specific post by its slug
- `getPostContentByUrl`: Get the full content of a post by URL
- `getComments`: Get comments for a specific post
- `getPublicationInfo`: Get information about a Substack publication
- `searchPosts`: Search for posts in a publication
- And more...

### CoinGecko Tools

- `coingecko-get-price`: Get current price of a cryptocurrency
- `coingecko-search`: Search for cryptocurrencies by name
- `coingecko-get-contracts`: Get contract addresses for tokens
- `coingecko-trending`: Get currently trending tokens
- `coingecko-get-features`: Get available API features
- And more...

## Command Line Usage

You can start the servers directly from the command line:

```bash
# Start individual modules
npm run start:twitter
npm run start:substack
npm run start:coingecko

# Debug servers
npm run debug:twitter
```

## Development

```bash
# Install dependencies
npm install

# Build all modules
npm run build

# Build specific modules
npm run build:twitter
npm run build:substack
npm run build:coingecko

# Run tests
npm test
npm run test:twitter
npm run test:substack
npm run test:coingecko

# Linting and formatting
npm run lint
npm run format
```

## Environment Variables

Create a `.env` file with the following variables:

```
# Twitter API credentials
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret

# CoinGecko API key (optional)
COINGECKO_API_KEY=your_coingecko_api_key
```

## License

ISC
