# Twitter Module

This module provides tools to interact with Twitter (X), including fetching user profiles, tweets, trends, and performing actions like tweeting, following, and more.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Configuration

Create a `.env` file with your Twitter API credentials:

```
TWITTER_API_KEY=your_twitter_api_key
TWITTER_API_SECRET=your_twitter_api_secret
TWITTER_ACCESS_TOKEN=your_twitter_access_token
TWITTER_ACCESS_SECRET=your_twitter_access_secret
```

## Usage

```javascript
import { createTwitterServer } from "@recallnet/external-mcp/twitter";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Create server with options
const twitterServer = createTwitterServer({
  name: "my-twitter-server",
  version: "1.0.0",
  includeReadTools: true,
  includeWriteTools: true,
  includeGrokTools: false,
});

// Connect with stdio transport
const transport = new StdioServerTransport();
twitterServer.server.connect(transport).then(() => {
  console.log("Twitter MCP server started");
});
```

## Available Tools

### Read Tools

#### twitter-get-user

Gets detailed information about a Twitter user.

**Parameters:**

- `username` (string, required): The Twitter username without the @ symbol

**Example:**

```javascript
const result = await client.invoke("twitter-get-user", {
  username: "elonmusk",
});
```

#### twitter-get-tweet

Gets details about a specific tweet.

**Parameters:**

- `tweetId` (string, required): The ID of the tweet

**Example:**

```javascript
const result = await client.invoke("twitter-get-tweet", {
  tweetId: "1580000000000000000",
});
```

#### twitter-search-tweets

Searches for tweets containing specific terms.

**Parameters:**

- `query` (string, required): The search query
- `count` (number, optional): Number of tweets to return (default: 20)

**Example:**

```javascript
const result = await client.invoke("twitter-search-tweets", {
  query: "artificial intelligence",
  count: 10,
});
```

#### twitter-get-trends

Gets current Twitter trends.

**Parameters:**

- None

**Example:**

```javascript
const result = await client.invoke("twitter-get-trends", {});
```

#### twitter-get-followers

Gets followers for a user.

**Parameters:**

- `userId` (string, required): The numeric user ID
- `count` (number, optional): Number of followers to return (default: 20)

**Example:**

```javascript
const result = await client.invoke("twitter-get-followers", {
  userId: "44196397",
  count: 10,
});
```

#### twitter-get-following

Gets accounts a user is following.

**Parameters:**

- `userId` (string, required): The numeric user ID
- `count` (number, optional): Number of accounts to return (default: 20)

**Example:**

```javascript
const result = await client.invoke("twitter-get-following", {
  userId: "44196397",
  count: 10,
});
```

### Write Tools

#### twitter-send-tweet

Sends a tweet with the provided text.

**Parameters:**

- `text` (string, required): The text to tweet

**Example:**

```javascript
const result = await client.invoke("twitter-send-tweet", {
  text: "Hello, Twitter!",
});
```

#### twitter-like-tweet

Likes a tweet.

**Parameters:**

- `tweetId` (string, required): The ID of the tweet to like

**Example:**

```javascript
const result = await client.invoke("twitter-like-tweet", {
  tweetId: "1580000000000000000",
});
```

#### twitter-retweet

Retweets a tweet.

**Parameters:**

- `tweetId` (string, required): The ID of the tweet to retweet

**Example:**

```javascript
const result = await client.invoke("twitter-retweet", {
  tweetId: "1580000000000000000",
});
```

#### twitter-follow-user

Follows a Twitter user.

**Parameters:**

- `username` (string, required): The username to follow (without @ symbol)

**Example:**

```javascript
const result = await client.invoke("twitter-follow-user", {
  username: "elonmusk",
});
```

### Grok Tools

#### twitter-grok-chat

Sends a message to Grok AI and gets a response.

**Parameters:**

- `message` (string, required): Message to send to Grok
- `history` (array, optional): Optional conversation history

**Example:**

```javascript
const result = await client.invoke("twitter-grok-chat", {
  message: "What's the latest news in AI?",
  history: [
    { role: "user", content: "Hello Grok" },
    { role: "assistant", content: "Hello! How can I help you today?" },
  ],
});
```

## Error Handling

Errors are returned in a structured format:

```javascript
{
  content: [
    {
      type: "text",
      text: "Error message: Failed to retrieve tweet",
    },
  ];
}
```
