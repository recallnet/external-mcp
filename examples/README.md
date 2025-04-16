# @recallnet/external-mcp Examples

This directory contains examples of how to use the `@recallnet/external-mcp` package to create MCP servers that provide access to external data feeds.

## Examples Overview

- `twitter/` - Examples for using the Twitter module
- `substack/` - Examples for using the Substack module
- `coingecko/` - Examples for using the CoinGecko module
- `combined/` - Examples for using all modules together in a combined server

## Getting Started

1. Install the package:

   ```bash
   npm install @recallnet/external-mcp
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Run an example:

   ```bash
   # Twitter example
   node twitter/basic-twitter-server.js

   # Substack example
   node substack/basic-substack-server.js

   # CoinGecko example
   node coingecko/basic-coingecko-server.js

   # Combined server example
   node combined/combined-server.js
   ```

## Twitter Module Examples

The Twitter module examples demonstrate how to:

- Create a Twitter MCP server
- Configure read-only or read-write access
- Use Twitter tools to access user profiles, tweets, and trending topics

Requires Twitter credentials in your `.env` file.

## Substack Module Examples

The Substack module examples demonstrate how to:

- Create a Substack MCP server
- Access publication information and posts
- Get post content in simplified text format

No authentication required.

## CoinGecko Module Examples

The CoinGecko module examples demonstrate how to:

- Create a CoinGecko MCP server
- Access cryptocurrency price data
- Search for tokens and get trending tokens

Free tier works out of the box, Pro API key optional.

## Combined Server Examples

The combined server examples demonstrate how to:

- Create a server with multiple modules
- Configure module-specific options
- Access tools from different modules through a unified interface

## Integration with Claude or Other AI Systems

Examples of how to integrate these MCP servers with Claude or other AI systems can be found in the main README.
