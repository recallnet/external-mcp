# Substack Module

This module provides tools to interact with Substack publications and posts.

## Installation

```bash
npm install @recallnet/external-mcp
```

## Usage

```javascript
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createSubstackServer } from '@recallnet/external-mcp/substack';

// Create the server
const substackServer = createSubstackServer({
  name: 'my-substack-server',
  version: '1.0.0',
});

// Connect with stdio transport
const transport = new StdioServerTransport();
substackServer.server.connect(transport).then(() => {
  console.log('Substack MCP server started');
});
```

## Available Tools

### getPublicationInfo

Gets basic information about a Substack publication.

**Parameters:**

- `substackId` (string, required): The Substack publication ID (subdomain or full domain)

**Example:**

```javascript
const result = await client.invoke('getPublicationInfo', {
  substackId: 'example.substack.com',
});
```

### getPostMetadata

Gets metadata for a Substack post by URL without the content.

**Parameters:**

- `postUrl` (string, required): The full URL to the Substack post

**Example:**

```javascript
const result = await client.invoke('getPostMetadata', {
  postUrl: 'https://example.substack.com/p/post-slug',
});
```

### getMetadataBySlug

Gets metadata for a Substack post by its slug without the content.

**Parameters:**

- `substackId` (string, required): The Substack publication ID (subdomain or full domain)
- `slug` (string, required): The slug of the post to retrieve metadata for

**Example:**

```javascript
const result = await client.invoke('getMetadataBySlug', {
  substackId: 'example.substack.com',
  slug: 'post-slug',
});
```

### getContentBySlug

Gets post content in plain text or markdown format by slug.

**Parameters:**

- `substackId` (string, required): The Substack publication ID (subdomain or full domain)
- `slug` (string, required): The slug of the post to retrieve content for
- `format` (string, optional): Format of the returned content - "plain" or "markdown" (default: "plain")

**Example:**

```javascript
const result = await client.invoke('getContentBySlug', {
  substackId: 'example.substack.com',
  slug: 'post-slug',
  format: 'markdown',
});
```

### getContentLatest

Gets the latest post's content in plain text or markdown format.

**Parameters:**

- `substackId` (string, required): The Substack publication ID (subdomain or full domain)
- `format` (string, optional): Format of the returned content - "plain" or "markdown" (default: "plain")

**Example:**

```javascript
const result = await client.invoke('getContentLatest', {
  substackId: 'example.substack.com',
  format: 'markdown',
});
```

### getPostComments

Gets comments for a Substack post.

**Parameters:**

- `substackId` (string, required): The Substack publication ID
- `postId` (number, required): The ID of the post to get comments for

**Example:**

```javascript
const result = await client.invoke('getPostComments', {
  substackId: 'example.substack.com',
  postId: 12345,
});
```

### getRecentPosts

Gets recent posts from a Substack publication.

**Parameters:**

- `substackId` (string, required): The Substack publication ID
- `page` (number, optional): Page number for pagination (default: 1)

**Returns:**

- A paginated list of posts with fixed page size of 10 posts per page
- Each post contains: slug, title, description, publishDate
- Pagination info: page, total, hasMore

**Example:**

```javascript
const result = await client.invoke('getRecentPosts', {
  substackId: 'example.substack.com',
  page: 1,
});
```

### searchPosts

Searches for posts in a Substack publication containing a specific term.

**Parameters:**

- `substackId` (string, required): The Substack publication ID
- `searchTerm` (string, required): The term to search for in post titles and content
- `page` (number, optional): Page number for pagination (default: 1)

**Returns:**

- A paginated list of matching posts with fixed page size of 10 posts per page
- Each post contains: slug, title, description, publishDate
- Pagination info: page, total, hasMore, searchTerm

**Example:**

```javascript
const result = await client.invoke('searchPosts', {
  substackId: 'example.substack.com',
  searchTerm: 'climate',
  page: 1,
});
```

### getPostBySlug

Gets a specific post by its slug.

**Parameters:**

- `substackId` (string, required): The Substack publication ID
- `slug` (string, required): The slug of the post to retrieve

**Example:**

```javascript
const result = await client.invoke('getPostBySlug', {
  substackId: 'example.substack.com',
  slug: 'post-slug',
});
```

## Deprecated Tools

The following tools are deprecated and will be removed in a future version:

- `getPostContentByUrl`: Use `getContentBySlug` or `getContentLatest` for content, or `getPostMetadata` for metadata only.
- `getPosts`: Use `getRecentPosts` instead.
- `getNewsletterRecommendations`: No direct replacement, use publication-specific endpoints.
- `getCategoryNewsletters`: No direct replacement, use publication-specific endpoints.
- `listCategories`: No direct replacement, use publication-specific endpoints.

## Migration Guide

### From `getPostContentByUrl` to new endpoints

```javascript
// Old approach
const result = await client.invoke('getPostContentByUrl', {
  postUrl: 'https://example.substack.com/p/post-slug',
});

// New approach for content
const substackId = 'example.substack.com';
const slug = 'post-slug';
const contentResult = await client.invoke('getContentBySlug', {
  substackId,
  slug,
  format: 'plain', // or "markdown"
});

// New approach for metadata
const metadataResult = await client.invoke('getMetadataBySlug', {
  substackId,
  slug,
});
```

### From limit-based to page-based pagination

```javascript
// Old approach
const result = await client.invoke('getRecentPosts', {
  substackId: 'example.substack.com',
  limit: 20, // get 20 posts
});

// New approach
const page1Result = await client.invoke('getRecentPosts', {
  substackId: 'example.substack.com',
  page: 1, // get first 10 posts
});

const page2Result = await client.invoke('getRecentPosts', {
  substackId: 'example.substack.com',
  page: 2, // get next 10 posts
});
```

## Error Handling

All tools return formatted error objects when something goes wrong:

```javascript
{
  error: 'Error message (code: 404)'; // If applicable
}
```
