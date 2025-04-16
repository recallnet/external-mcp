import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as client from "./client.js";
import { ApiError } from "../utils/errors.js";
import {
  htmlToPlainText,
  processPostContent,
  processPostsContent,
  extractStructuredContent,
} from "../utils/html.js";
import { ServerOptions } from "../utils/types.js";
import { fileURLToPath } from "url";
import { normalizeSubstackId } from "./client.js";

// Define ToolDefinition since @mastra/core isn't available
interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  handler: (args: any) => Promise<any>;
}

/**
 * Options for creating a Substack MCP server
 */
export interface SubstackServerOptions extends ServerOptions {
  /** Additional Substack-specific options could be added here */
}

/**
 * Creates a Substack MCP server
 * @param options Configuration options for the server
 * @returns An MCP server with Substack functionality
 */
export function createSubstackServer(options: SubstackServerOptions = {}) {
  const server = new McpServer({
    name: options.name || "substack-mcp-server",
    version: options.version || "1.0.0",
  });

  // Add server documentation
  server.resource("documentation", "docs://substack/overview", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: "# Substack MCP Server\n\nThis server provides access to Substack publications, posts, and related data through the Model Context Protocol.",
      },
    ],
  }));

  // Get recent posts from a publication
  server.tool(
    "getRecentPosts",
    "Get recent posts from Substack",
    {
      substackId: z.string().describe("The id of the Substack publication"),
      page: z.number().optional().describe("Page number for pagination (default: 1)"),
    },
    async ({ substackId, page = 1 }, extra) => {
      try {
        // Ensure page is at least 1
        const validPage = Math.max(1, page);

        // Calculate offset based on page (10 items per page)
        const postsPerPage = 10;
        const offset = (validPage - 1) * postsPerPage;

        // Get posts with pagination
        const posts = await client.getRecentPosts(substackId, postsPerPage, offset);

        // Get the total number of posts (for pagination info)
        // We reuse the call but with a larger limit to estimate total
        const allPosts = await client.getRecentPosts(substackId, 100, 0);
        const total = allPosts.length;

        const result = {
          posts: posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            description: post.subtitle || "",
            publishDate: post.post_date,
          })),
          page: validPage,
          total,
          hasMore: offset + posts.length < total,
        };

        return {
          content: [
            {
              type: "text",
              text: `Retrieved ${posts.length} recent posts from ${substackId} (page ${validPage} of ${Math.ceil(total/postsPerPage)})`,
            },
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error, "Failed to get recent posts");
      }
    },
  );

  // Get a specific post by slug
  server.tool(
    "getPostBySlug",
    "Get a post by slug from Substack",
    {
      substackId: z.string().describe("The id of the Substack publication"),
      slug: z.string().describe("The slug of the post"),
    },
    async ({ substackId, slug }, extra) => {
      const post = await client.getPostBySlug(substackId, slug);

      if (!post) {
        return {
          content: [
            {
              type: "text",
              text: `Post not found: ${slug} in ${substackId}`,
            },
          ],
        };
      }

      const processedPost = processPostContent(post);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(processedPost, null, 2),
          },
        ],
      };
    },
  );

  // Get comments for a post
  server.tool(
    "getComments",
    "Get comments for a post from Substack",
    {
      substackId: z
        .string()
        .describe("The Substack publication ID (subdomain or custom domain)"),
      postId: z.number().describe("The id of the post"),
    },
    async ({ substackId, postId }, extra) => {
      const comments = await client.getComments(substackId, postId);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(comments, null, 2),
          },
        ],
      };
    },
  );

  // Get publication information
  server.tool(
    "substack-get-publication-info",
    "Get information about a Substack publication",
    {
      substackId: z
        .string()
        .describe("The Substack publication ID (subdomain or custom domain)"),
    },
    async ({ substackId }, extra) => {
      const info = await client.getPublicationInfo(substackId);

      if (!info) {
        return {
          content: [
            {
              type: "text",
              text: `Publication not found: ${substackId}`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: `Retrieved information for publication: ${info.name}\n\n${JSON.stringify(info, null, 2)}`,
          },
        ],
      };
    },
  );

  // Search for posts
  server.tool(
    "substack-search-posts",
    "Search for posts in a Substack publication",
    {
      substackId: z
        .string()
        .describe("The Substack publication ID (subdomain or custom domain)"),
      searchTerm: z.string().describe("The term to search for"),
      page: z.number().min(1).describe("Page number for pagination"),
    },
    async ({ substackId, searchTerm, page }, extra) => {
      try {
        // Ensure page is at least 1
        const validPage = Math.max(1, page);

        // Calculate offset based on page (10 items per page)
        const postsPerPage = 10;
        const offset = (validPage - 1) * postsPerPage;

        // Search posts with pagination
        const posts = await client.searchPosts(
          substackId,
          searchTerm,
          postsPerPage,
          offset,
        );

        // Get the total number of matching posts (for pagination info)
        // We reuse the search but with a larger limit to estimate total
        const allMatches = await client.searchPosts(
          substackId,
          searchTerm,
          100,
          0,
        );
        const total = allMatches.length;

        const result = {
          posts: posts.map((post) => ({
            slug: post.slug,
            title: post.title,
            description: post.subtitle || "",
            publishDate: post.post_date,
          })),
          page: validPage,
          total,
          hasMore: offset + posts.length < total,
          searchTerm,
        };

        return {
          content: [
            {
              type: "text",
              text: `Found ${total} posts matching "${searchTerm}" in ${substackId}`,
            },
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error, "Failed to search posts");
      }
    },
  );

  // Get user profile
  server.tool(
    "substack-get-user-profile",
    "Get a user profile from Substack",
    {
      username: z.string().describe("The Substack username"),
    },
    async ({ username }, extra) => {
      const profile = await client.getUserProfile(username);

      return {
        content: [
          {
            type: "text",
            text: `Retrieved profile for user: ${profile.name}\n\n${JSON.stringify(profile, null, 2)}`,
          },
        ],
      };
    },
  );

  // Get newsletter authors
  server.tool(
    "substack-get-newsletter-authors",
    "Get authors of a Substack newsletter",
    {
      substackId: z
        .string()
        .describe("The Substack publication ID (subdomain or custom domain)"),
    },
    async ({ substackId }, extra) => {
      const authors = await client.getNewsletterAuthors(substackId);

      return {
        content: [
          {
            type: "text",
            text: `Retrieved ${authors.length} authors for ${substackId}\n\n${JSON.stringify(authors, null, 2)}`,
          },
        ],
      };
    },
  );

  // Create a resource for accessing publication feeds
  server.resource(
    "substack-publication",
    new ResourceTemplate("substack://{substackId}", { list: undefined }),
    async (uri, { substackId }) => {
      try {
        // Ensure substackId is treated as a string
        const id = String(substackId);
        const info = await client.getPublicationInfo(id);

        if (!info) {
          return {
            contents: [
              {
                uri: uri.href,
                text: `# Publication Not Found\n\nNo publication found with ID: ${id}`,
              },
            ],
          };
        }

        const posts = await client.getRecentPosts(id, 5);
        const processedPosts = processPostsContent(posts);

        let postsMarkdown = "";
        if (processedPosts.length > 0) {
          postsMarkdown = "\n\n## Recent Posts\n\n";
          processedPosts.forEach((post) => {
            postsMarkdown += `- [${post.title}](${post.canonical_url}) - ${new Date(post.post_date).toLocaleDateString()}\n`;
          });
        }

        return {
          contents: [
            {
              uri: uri.href,
              text: `# ${info.name}\n\n${info.description || ""}\n${postsMarkdown}`,
            },
          ],
        };
      } catch (error) {
        console.error(`Error fetching publication: ${substackId}`, error);
        return {
          contents: [
            {
              uri: uri.href,
              text: `# Error\n\nFailed to fetch publication: ${substackId}`,
            },
          ],
        };
      }
    },
  );

  // Register the new specialized content tools

  // Tool for getting post content in plain text/markdown by slug
  server.tool(
    "getContentBySlug",
    "Get post content in plain text/markdown format by slug",
    {
      substackId: z.string().describe("The Substack publication ID (subdomain or full domain)"),
      slug: z.string().describe("The slug of the post to retrieve content for"),
      format: z.enum(["plain", "markdown"]).optional().describe("Format of the returned content (default: plain)"),
    },
    async ({ substackId, slug, format = "plain" }, extra) => {
      try {
        const result = await getContentBySlug.handler({ substackId, slug, format });

        if (result.error) {
          return {
            content: [
              {
                type: "text",
                text: result.error,
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error, "Failed to get content by slug");
      }
    }
  );

  // Tool for getting the latest post's content
  server.tool(
    "getContentLatest",
    "Get the latest post's content in plain text/markdown format",
    {
      substackId: z.string().describe("The Substack publication ID (subdomain or full domain)"),
      format: z.enum(["plain", "markdown"]).optional().describe("Format of the returned content (default: plain)"),
    },
    async ({ substackId, format = "plain" }, extra) => {
      try {
        const result = await getContentLatest.handler({ substackId, format });

        if (result.error) {
          return {
            content: [
              {
                type: "text",
                text: result.error,
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error, "Failed to get latest content");
      }
    }
  );

  // Tool for getting metadata for a post by slug
  server.tool(
    "getMetadataBySlug",
    "Get metadata for a Substack post by its slug without the content",
    {
      substackId: z.string().describe("The Substack publication ID (subdomain or full domain)"),
      slug: z.string().describe("The slug of the post to retrieve metadata for"),
    },
    async ({ substackId, slug }, extra) => {
      try {
        const result = await getMetadataBySlug.handler({ substackId, slug });

        if (result.error) {
          return {
            content: [
              {
                type: "text",
                text: result.error,
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error, "Failed to get post metadata by slug");
      }
    }
  );

  // Tool for getting metadata for a post by URL
  server.tool(
    "getPostMetadata",
    "Get metadata for a Substack post by URL without the content",
    {
      postUrl: z.string().describe("The full URL to the Substack post (e.g., https://example.substack.com/p/post-slug)"),
    },
    async ({ postUrl }, extra) => {
      try {
        const result = await getPostMetadata.handler({ postUrl });

        if (result.error) {
          return {
            content: [
              {
                type: "text",
                text: result.error,
              }
            ]
          };
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error, "Failed to get post metadata");
      }
    }
  );

  return server;
}

/**
 * Format API errors for tool response
 */
function formatError(
  error: unknown,
  message: string,
): { content: { type: "text"; text: string }[] } {
  let errorMessage: string;

  if (error instanceof ApiError) {
    errorMessage = `${message}: ${error.message}${error.code ? ` (code: ${error.code})` : ""}`;
  } else if (error instanceof Error) {
    errorMessage = `${message}: ${error.message}`;
  } else {
    errorMessage = `${message}: Unknown error`;
  }

  return {
    content: [
      {
        type: "text",
        text: errorMessage,
      },
    ],
  };
}

/**
 * Tool to get publication information
 */
export const getPublicationInfo: ToolDefinition = {
  name: "getPublicationInfo",
  description: "Get basic information about a Substack publication",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
    },
    required: ["substackId"],
  },
  handler: async ({ substackId }: { substackId: string }) => {
    try {
      // Get information about the publication
      const info = await client.getPublicationInfo(substackId);

      if (!info) {
        return {
          error: "Could not retrieve publication information.",
        };
      }

      return {
        name: info.name,
        domain: info.domain,
        description: info.description,
        logoUrl: info.logoUrl,
        stats: info.stats,
      };
    } catch (error) {
      return formatError(error, "Failed to get publication information");
    }
  },
};

/**
 * Tool to get metadata for a Substack post by URL without the content
 */
export const getPostMetadata: ToolDefinition = {
  name: "getPostMetadata",
  description: "Get metadata for a Substack post by URL without the content",
  parameters: {
    type: "object",
    properties: {
      postUrl: {
        type: "string",
        description:
          "The full URL to the Substack post (e.g., https://example.substack.com/p/post-slug)",
      },
    },
    required: ["postUrl"],
  },
  handler: async ({ postUrl }: { postUrl: string }) => {
    try {
      const postDetails = await client.getPostContent(postUrl);

      return {
        title: postDetails.title,
        subtitle: postDetails.subtitle,
        author: postDetails.author,
        publishDate: postDetails.publish_date,
        wordCount: postDetails.wordcount,
        postId: postDetails.post_id,
        url: postDetails.url,
        domain: postDetails.domain,
        slug: postDetails.slug,
        imageUrl: postDetails.image_url,
      };
    } catch (error) {
      return formatError(error, "Failed to get post metadata");
    }
  },
};

/**
 * Tool to get post comments
 */
export const getPostComments: ToolDefinition = {
  name: "getPostComments",
  description: "Get comments for a Substack post",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
      postId: {
        type: "number",
        description: "The ID of the post to get comments for",
      },
    },
    required: ["substackId", "postId"],
  },
  handler: async ({
    substackId,
    postId,
  }: {
    substackId: string;
    postId: number;
  }) => {
    try {
      const comments = await client.getComments(substackId, postId);

      return {
        comments: comments.map((comment) => ({
          id: comment.id,
          author: comment.author.name,
          date: comment.created_at,
          content: comment.body,
        })),
        count: comments.length,
      };
    } catch (error) {
      return formatError(error, "Failed to get post comments");
    }
  },
};

/**
 * Tool to get recent posts from a publication
 */
export const getRecentPosts: ToolDefinition = {
  name: "getRecentPosts",
  description: "Get recent posts from a Substack publication",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
      page: {
        type: "number",
        description: "Page number for pagination (default: 1)",
      },
    },
    required: ["substackId"],
  },
  handler: async ({
    substackId,
    page = 1,
  }: {
    substackId: string;
    page?: number;
  }) => {
    try {
      // Calculate offset based on page (each page has 10 items)
      const postsPerPage = 10;
      const offset = (Math.max(1, page) - 1) * postsPerPage;

      // Get posts with pagination
      const posts = await client.getRecentPosts(substackId, postsPerPage, offset);

      // Get the total number of posts (for pagination info)
      // We reuse the call but with a larger limit to estimate total
      const allPosts = await client.getRecentPosts(substackId, 100, 0);
      const total = allPosts.length;

      return {
        posts: posts.map((post) => ({
          slug: post.slug,
          title: post.title,
          description: post.subtitle || "",
          publishDate: post.post_date,
        })),
        page,
        total,
        hasMore: offset + posts.length < total,
      };
    } catch (error) {
      return formatError(error, "Failed to get recent posts");
    }
  },
};

/**
 * Tool to search posts in a publication
 */
export const searchPosts: ToolDefinition = {
  name: "searchPosts",
  description:
    "Search for posts in a Substack publication containing a specific term",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
      searchTerm: {
        type: "string",
        description: "The term to search for in post titles and content",
      },
      page: {
        type: "number",
        description: "Page number for pagination (default: 1)",
      },
    },
    required: ["substackId", "searchTerm"],
  },
  handler: async ({
    substackId,
    searchTerm,
    page = 1,
  }: {
    substackId: string;
    searchTerm: string;
    page?: number;
  }) => {
    try {
      // Calculate offset based on page (each page has 10 items)
      const offset = (Math.max(1, page) - 1) * 10;
      // Always limit to 10 posts per page
      const limit = 10;

      // Search for posts
      const matchingPosts = await client.searchPosts(
        substackId,
        searchTerm,
        limit,
        offset,
      );

      return {
        posts: matchingPosts.map((post) => ({
          slug: post.slug,
          title: post.title,
          description: post.subtitle || "",
          publishDate: post.post_date,
        })),
        page,
        total: matchingPosts.length,
        hasMore: matchingPosts.length === limit,
        searchTerm,
      };
    } catch (error) {
      return formatError(error, "Failed to search posts");
    }
  },
};

/**
 * Tool to get a post by its slug
 */
export const getPostBySlug: ToolDefinition = {
  name: "getPostBySlug",
  description: "Get a specific post by its slug",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
      slug: {
        type: "string",
        description: "The slug of the post to retrieve",
      },
    },
    required: ["substackId", "slug"],
  },
  handler: async ({
    substackId,
    slug,
  }: {
    substackId: string;
    slug: string;
  }) => {
    try {
      const post = await client.getPostBySlug(substackId, slug);

      if (!post) {
        return {
          error: `Post with slug "${slug}" not found in publication "${substackId}"`,
        };
      }

      return {
        title: post.title,
        subtitle: post.subtitle,
        url: post.url,
        publishDate: post.post_date,
        author: post.author,
      };
    } catch (error) {
      return formatError(error, "Failed to get post by slug");
    }
  },
};

/**
 * Tool to get post content by slug in plain text/markdown format
 */
export const getContentBySlug: ToolDefinition = {
  name: "getContentBySlug",
  description: "Get post content in plain text/markdown format by slug",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
      slug: {
        type: "string",
        description: "The slug of the post to retrieve content for",
      },
      format: {
        type: "string",
        enum: ["plain", "markdown"],
        description: "Format of the returned content (default: plain)",
      },
    },
    required: ["substackId", "slug"],
  },
  handler: async ({
    substackId,
    slug,
    format = "plain",
  }: {
    substackId: string;
    slug: string;
    format?: "plain" | "markdown";
  }) => {
    try {
      // Get the post by slug to verify it exists and get the URL
      const post = await client.getPostBySlug(substackId, slug);

      if (!post) {
        return {
          error: `Post with slug "${slug}" not found in publication "${substackId}"`,
        };
      }

      // Now get the full content using the URL
      const fullPost = await client.getPostContent(
        `https://${normalizeSubstackId(substackId)}/p/${slug}`,
      );

      if (!fullPost || !fullPost.content) {
        return {
          error: "Could not retrieve post content",
        };
      }

      // Process the content based on the requested format
      let processedContent = "";
      if (format === "markdown") {
        processedContent = extractStructuredContent(fullPost.content);
      } else {
        processedContent = htmlToPlainText(fullPost.content);
      }

      return {
        title: fullPost.title,
        publishDate: fullPost.publish_date,
        content: processedContent,
      };
    } catch (error) {
      return formatError(error, "Failed to get content by slug");
    }
  },
};

/**
 * Tool to get the latest post's content in plain text/markdown format
 */
export const getContentLatest: ToolDefinition = {
  name: "getContentLatest",
  description: "Get the latest post's content in plain text/markdown format",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
      format: {
        type: "string",
        enum: ["plain", "markdown"],
        description: "Format of the returned content (default: plain)",
      },
    },
    required: ["substackId"],
  },
  handler: async ({
    substackId,
    format = "plain",
  }: {
    substackId: string;
    format?: "plain" | "markdown";
  }) => {
    try {
      // Get the most recent post
      const recentPosts = await client.getRecentPosts(substackId, 1);

      if (!recentPosts || recentPosts.length === 0) {
        return {
          error: `No posts found for publication "${substackId}"`,
        };
      }

      const latestPost = recentPosts[0];

      // Now get the full content using the slug
      const fullPost = await client.getPostContent(
        `https://${normalizeSubstackId(substackId)}/p/${latestPost.slug}`,
      );

      if (!fullPost || !fullPost.content) {
        return {
          error: "Could not retrieve post content",
        };
      }

      // Process the content based on the requested format
      let processedContent = "";
      if (format === "markdown") {
        processedContent = extractStructuredContent(fullPost.content);
      } else {
        processedContent = htmlToPlainText(fullPost.content);
      }

      return {
        title: fullPost.title,
        publishDate: fullPost.publish_date,
        slug: latestPost.slug,
        content: processedContent,
      };
    } catch (error) {
      return formatError(error, "Failed to get latest content");
    }
  },
};

/**
 * Tool to get metadata for a Substack post by its slug without the content
 */
export const getMetadataBySlug: ToolDefinition = {
  name: "getMetadataBySlug",
  description: "Get metadata for a Substack post by its slug without the content",
  parameters: {
    type: "object",
    properties: {
      substackId: {
        type: "string",
        description: "The Substack publication ID (subdomain or full domain)",
      },
      slug: {
        type: "string",
        description: "The slug of the post to retrieve metadata for",
      },
    },
    required: ["substackId", "slug"],
  },
  handler: async ({
    substackId,
    slug,
  }: {
    substackId: string;
    slug: string;
  }) => {
    try {
      // Get the post by slug to verify it exists and get basic info
      const post = await client.getPostBySlug(substackId, slug);

      if (!post) {
        return {
          error: `Post with slug "${slug}" not found in publication "${substackId}"`,
        };
      }

      // Now get the full metadata using the URL
      const fullPost = await client.getPostContent(`https://${normalizeSubstackId(substackId)}/p/${slug}`);

      if (!fullPost) {
        return {
          error: "Could not retrieve post metadata",
        };
      }

      return {
        title: fullPost.title,
        subtitle: fullPost.subtitle,
        author: fullPost.author,
        publishDate: fullPost.publish_date,
        wordCount: fullPost.wordcount,
        postId: fullPost.post_id,
        url: fullPost.url,
        domain: fullPost.domain,
        slug: fullPost.slug,
        imageUrl: fullPost.image_url,
      };
    } catch (error) {
      return formatError(error, "Failed to get post metadata by slug");
    }
  },
};

/**
 * List of all Substack tools
 */
export const substackTools = [
  getPostMetadata,
  getMetadataBySlug,
  getPostComments,
  getPublicationInfo,
  getRecentPosts,
  searchPosts,
  getPostBySlug,
  getContentBySlug,
  getContentLatest,
];

/**
 * Run the Substack MCP server directly with stdio transport
 */
// This check determines if the file is being run directly
if (
  process.argv[1].endsWith("substack/server.js") ||
  process.argv[1].endsWith("substack/server.ts")
) {
  // Need to use dynamic import to avoid TypeScript errors
  import("@modelcontextprotocol/sdk/server/stdio.js").then(
    ({ StdioServerTransport }) => {
      try {
        console.error("Starting Substack MCP server...");
        const substackServer = createSubstackServer();
        const transport = new StdioServerTransport();

        // Handle stdin end for clean shutdown
        process.stdin.on("end", () => {
          process.exit(0);
        });

        substackServer.server.connect(transport).then(() => {
          console.error("Substack MCP server started and listening");
        });
      } catch (error) {
        console.error("Failed to start Substack MCP server:", error);
        process.exit(1);
      }
    },
  );
}
