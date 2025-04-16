# @recallnet/external-mcp

A modular Model Context Protocol (MCP) library that provides access to various external data feeds. The package is structured as modules that can be used independently or together, enabling AI models to interact with and analyze data from multiple sources through a unified interface.

## Modules

This package includes three primary modules:

- **Twitter** (`@recallnet/external-mcp/twitter`): Access Twitter/X data and functionality
- **Substack** (`@recallnet/external-mcp/substack`): Access Substack publications and content
- **CoinGecko** (`@recallnet/external-mcp/coingecko`): Access cryptocurrency data from CoinGecko

## Features

### Twitter Module
  - Get user profiles and tweets
  - Search tweets and profiles
  - Access trending topics
  - Full write access (tweet, like, retweet, follow)
  - Direct messaging support
  - Grok chat integration

### Substack Module
  - Get publication information
  - Retrieve recent posts
  - Access post comments
  - Search posts
  - Get simplified text content without heavy HTML markup
  - Support for both custom domains and subdomains

### CoinGecko Module
  - Get current token prices
  - Retrieve contract addresses and chains
  - Search for tokens
  - Get trending tokens
  - Support for both free and Pro API access

## Installation

```bash
npm install @recallnet/external-mcp
```

To use only specific modules:

```bash
# Import only what you need
import { twitter } from '@recallnet/external-mcp/twitter';
import { substack } from '@recallnet/external-mcp/substack';
import { coingecko } from '@recallnet/external-mcp/coingecko';
```

## Integrate with Claude

Each module can be integrated separately with Claude or used together.

1. Install and build the package:
   ```bash
   npm install @recallnet/external-mcp
   ```

2. In Claude, go to Settings -> Developer -> Add MCP endpoint

3. For using individual modules, add configuration like:
   ```json
   {
     "mcpServers": {
       "recall-twitter": {
         "command": "node",
         "args": ["path/to/twitter-server.js"],
         "env": {
           "PORT": "3008",
           "TWITTER_USERNAME": "xx",
           "TWITTER_PASSWORD": "xxx",
           "TWITTER_EMAIL": "xxx"
         }
       }
     }
   }
   ```

   Or for using all modules together:
   ```json
   {
     "mcpServers": {
       "recall-external": {
         "command": "node",
         "args": ["path/to/combined-server.js"],
         "env": {
           "PORT": "3008",
           "TWITTER_USERNAME": "xx",
           "TWITTER_PASSWORD": "xxx",
           "TWITTER_EMAIL": "xxx",
           "COINGECKO_API_KEY": "xxx" (optional)
         }
       }
     }
   }
   ```

4. Restart Claude

5. Verify the integration

## Environment Setup

Create a `.env` file with your API credentials depending on which modules you're using:

```
# Twitter credentials (required for Twitter module)
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TWITTER_EMAIL=your_twitter_email

# CoinGecko credentials (optional for CoinGecko module)
COINGECKO_API_KEY=your_api_key  # Optional: enables Pro API features
```

## Usage

### Using Modules Independently

Each module can be used as a standalone MCP server:

```javascript
// Twitter module
import { createTwitterServer } from '@recallnet/external-mcp/twitter';

const twitterServer = createTwitterServer();
await twitterServer.start();

// Substack module
import { createSubstackServer } from '@recallnet/external-mcp/substack';

const substackServer = createSubstackServer();
await substackServer.start();

// CoinGecko module
import { createCoinGeckoServer } from '@recallnet/external-mcp/coingecko';

const coinGeckoServer = createCoinGeckoServer();
await coinGeckoServer.start();
```

### Using Combined Server

```javascript
import { createCombinedServer } from '@recallnet/external-mcp';

const server = createCombinedServer({
  modules: ['twitter', 'substack', 'coingecko']
});
await server.start();
```

### Example API Usage

#### Twitter Examples

```javascript
// Get a user's profile
const result = await twitterServer.invoke("twitter-get-profile", {
  username: "example_user"
});

// Get recent tweets
const result = await twitterServer.invoke("twitter-get-tweets", {
  username: "example_user",
  count: 10
});
```

#### Substack Examples

```javascript
// Get publication info
const result = await substackServer.invoke("substack-get-publication-info", {
  substackId: "example.substack.com"
});

// Get latest post with simplified text content (no HTML)
const result = await substackServer.invoke("substack-get-latest-post-simplified", {
  substackId: "example.substack.com",
  includeMetadata: true // set to false to get only the text content
});
```

#### CoinGecko Examples

```javascript
// Get token price
const result = await coinGeckoServer.invoke("coingecko-get-price", {
  tokenId: "bitcoin",
  currency: "usd"
});

// Get trending tokens
const result = await coinGeckoServer.invoke("coingecko-trending", {
  limit: 5
});
```

## API Reference

### Twitter Module

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `twitter-get-profile` | Get a user's profile information | `username` (required) |
| `twitter-get-tweets` | Get recent tweets from a user | `username` (required), `count` (optional, default: 10) |
| `twitter-search-tweets` | Search for tweets | `query` (required), `count` (optional, default: 20) |
| `twitter-get-trends` | Get trending topics | None |
| `twitter-send-tweet` | Send a tweet | `text` (required) |
| `twitter-like-tweet` | Like a tweet | `tweetId` (required) |
| `twitter-retweet` | Retweet a tweet | `tweetId` (required) |
| `twitter-follow-user` | Follow a user | `username` (required) |

### Substack Module

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `substack-get-publication-info` | Get publication information | `substackId` (required) |
| `substack-get-recent-posts` | Get recent posts | `substackId` (required), `limit` (optional, default: 10) |
| `substack-get-latest-post-simplified` | Get latest post with simplified text content | `substackId` (required), `includeMetadata` (optional, default: true) |
| `substack-get-latest-post-content` | Get latest post with full content | `substackId` (required), `fullData` (optional, default: false), `simplifiedText` (optional, default: false) |
| `substack-search-posts` | Search posts | `substackId` (required), `searchTerm` (required), `limit` (optional, default: 10) |
| `substack-get-comments` | Get comments for a post | `substackId` (required), `postId` (required) |

### CoinGecko Module

| Tool Name | Description | Parameters |
|-----------|-------------|------------|
| `coingecko-get-features` | Get available CoinGecko API features | None |
| `coingecko-get-price` | Get the current price of a token | `tokenId` (required), `currency` (optional, default: "usd") |
| `coingecko-get-contracts` | Get contract addresses and chains for a token | `tokenId` (required) |
| `coingecko-search` | Search for tokens by query | `query` (required), `limit` (optional, default: 10) |
| `coingecko-trending` | Get trending tokens | `limit` (optional, default: 10) |

## Project Structure

```
@recallnet/external-mcp/
├── src/
│   ├── index.ts              # Main entry point for combined server
│   ├── twitter/              # Twitter module
│   │   ├── index.ts          # Twitter module entry point
│   │   ├── client.ts         # Twitter API client
│   │   └── server.ts         # Twitter MCP server implementation
│   ├── substack/             # Substack module
│   │   ├── index.ts          # Substack module entry point
│   │   ├── client.ts         # Substack API client
│   │   └── server.ts         # Substack MCP server implementation
│   └── coingecko/            # CoinGecko module
│       ├── index.ts          # CoinGecko module entry point
│       ├── client.ts         # CoinGecko API client
│       └── server.ts         # CoinGecko MCP server implementation
├── dist/                     # Compiled JavaScript files
├── package.json              # Project configuration
└── tsconfig.json             # TypeScript configuration
```

## Development

### Building the Package

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## License

ISC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request