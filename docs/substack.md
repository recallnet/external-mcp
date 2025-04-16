# Substack Module Documentation

This document provides detailed information about the Substack module in the `@recallnet/external-mcp` package, including setup, configuration, and available tools.

## Overview

The Substack module provides access to Substack publications and content through the Model Context Protocol (MCP). It allows AI models like Claude to retrieve publication information, posts, and comments from Substack newsletters. The module can also process HTML content into simplified plain text for better consumption by AI models.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Configuration

The Substack module doesn't require authentication for accessing public content. No special configuration is needed.

## Usage

### Basic setup

```javascript
import { createSubstackServer } from "@recallnet/external-mcp/substack";
import dotenv from "dotenv";

// Load environment variables (not required for Substack, but good practice)
dotenv.config();

// Create server
const server = createSubstackServer({
  name: "substack-mcp-server",
  version: "1.0.0",
  includeAllTools: true,
});

// Connect to transport
await server.connect();
```

### Working with Substack IDs

Substack publications can be identified by:

- Subdomain: `example` (will be normalized to `example.substack.com`)
- Full domain: `example.substack.com`
- Custom domain: `newsletter.example.com` (must be used as is)

```javascript
import { normalizeSubstackId } from "@recallnet/external-mcp/substack";
const fullId = normalizeSubstackId("example"); // Returns 'example.substack.com'
```

## Available Tools

| Tool Name                             | Description                                  | Parameters                                                                        |
| ------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------- |
| `substack-get-publication-info`       | Get information about a publication          | `substackId` (required)                                                           |
| `substack-get-recent-posts`           | Get recent posts from a publication          | `substackId` (required), `limit` (optional, default: 10)                          |
| `substack-get-post-content`           | Get full content of a post by URL            | `postUrl` (required)                                                              |
| `substack-get-latest-post-simplified` | Get latest post with simplified text content | `substackId` (required), `includeMetadata` (optional, default: true)              |
| `substack-get-comments`               | Get comments for a post                      | `substackId` (required), `postId` (required)                                      |
| `substack-search-posts`               | Search for posts in a publication            | `substackId` (required), `searchTerm` (required), `limit` (optional, default: 10) |

## Content Processing

The Substack module includes utilities for processing HTML content into plain text:

```javascript
import {
  htmlToPlainText,
  processPostContent,
} from "@recallnet/external-mcp/utils";

// Convert HTML to plain text
const plainText = htmlToPlainText("<p>Hello <strong>world</strong>!</p>");

// Process a Substack post object to add plain text content
const processedPost = processPostContent(post);
```

## Claude Integration

To integrate the Substack module with Claude, add the following configuration to your Claude settings:

```json
{
  "mcpServers": {
    "substack": {
      "command": "node",
      "args": ["path/to/substack-server.js"]
    }
  }
}
```

Once configured, Claude can access Substack data through MCP tools:

```
Claude, please summarize the latest post from stratechery.substack.com.
```

## Error Handling

Common errors:

- Publication not found: Check the Substack ID format
- Post not found: Verify the post URL or ID
- Content extraction issues: Some publications may use custom HTML structures

## Examples

See the `examples/substack` directory for working examples.
