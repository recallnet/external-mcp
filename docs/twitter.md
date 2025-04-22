# Twitter Module Documentation

This document provides detailed information about the Twitter module in the `@recallnet/external-mcp` package, including setup, configuration, and available tools.

## Overview

The Twitter module provides access to Twitter/X data and functionality through the Model Context Protocol (MCP). It allows AI models like Claude to interact with Twitter to retrieve user profiles, tweets, trends, and perform actions like tweeting, liking, and following.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Configuration

The Twitter module requires authentication credentials to interact with Twitter. Create a `.env` file with the following variables:

```bash
TWITTER_USERNAME=your_twitter_username
TWITTER_PASSWORD=your_twitter_password
TWITTER_EMAIL=your_twitter_email
```

## Usage

### Basic setup

```javascript
import dotenv from 'dotenv';

import { createTwitterServer } from '@recallnet/external-mcp/twitter';

// Load environment variables
dotenv.config();

// Create server
const server = createTwitterServer({
  name: 'twitter-mcp-server',
  version: '1.0.0',
  includeReadTools: true, // Include read-only tools
  includeWriteTools: true, // Include write tools (tweet, like, follow)
});

// Connect to transport
await server.connect();
```

### Available Features

The Twitter client automatically detects available features based on your credentials:

- `basicAuth`: Basic authentication is available
- `tweeting`: Ability to send tweets
- `liking`: Ability to like tweets
- `retweeting`: Ability to retweet
- `following`: Ability to follow users
- `directMessages`: Ability to send and receive DMs
- `grokChat`: Access to Grok chat API

Check available features:

```javascript
import { getAvailableFeatures } from '@recallnet/external-mcp/twitter';

const features = getAvailableFeatures();
console.log(features);
```

## Available Tools

### Read-Only Tools

| Tool Name               | Description                      | Parameters                                             |
| ----------------------- | -------------------------------- | ------------------------------------------------------ |
| `twitter-get-profile`   | Get a user's profile information | `username` (required)                                  |
| `twitter-get-tweets`    | Get recent tweets from a user    | `username` (required), `count` (optional, default: 10) |
| `twitter-search-tweets` | Search for tweets                | `query` (required), `count` (optional, default: 20)    |
| `twitter-get-trends`    | Get trending topics              | None                                                   |

### Write Tools

| Tool Name             | Description     | Parameters            |
| --------------------- | --------------- | --------------------- |
| `twitter-send-tweet`  | Send a tweet    | `text` (required)     |
| `twitter-like-tweet`  | Like a tweet    | `tweetId` (required)  |
| `twitter-retweet`     | Retweet a tweet | `tweetId` (required)  |
| `twitter-follow-user` | Follow a user   | `username` (required) |

## Claude Integration

To integrate the Twitter module with Claude, add the following configuration to your Claude settings:

```json
{
  "mcpServers": {
    "twitter": {
      "command": "node",
      "args": ["path/to/twitter-server.js"],
      "env": {
        "TWITTER_USERNAME": "your_twitter_username",
        "TWITTER_PASSWORD": "your_twitter_password",
        "TWITTER_EMAIL": "your_twitter_email"
      }
    }
  }
}
```

Once configured, Claude can access Twitter data through MCP tools:

```
Claude, please get the latest tweets from @OpenAI.
```

## Error Handling

Common errors:

- Authentication failures: Check your credentials
- Rate limiting: Twitter has strict rate limits
- Permission issues: Some operations require full authentication

## Examples

See the `examples/twitter` directory for working examples.
