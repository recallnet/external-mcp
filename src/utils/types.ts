/**
 * Common type definitions for @recallnet/external-mcp
 * Contains shared interfaces and types used across multiple modules
 */

/**
 * Base options interface for creating MCP servers
 */
export interface ServerOptions {
  /** Custom name for the server */
  name?: string;
  /** Custom version for the server */
  version?: string;
  /** Custom port for the server */
  port?: number;
  /** Whether to log verbose output */
  verbose?: boolean;
}

/**
 * Base interface for all API responses
 */
export interface ApiResponse<T> {
  /** Whether the request was successful */
  success: boolean;
  /** The response data (only present if success is true) */
  data?: T;
  /** Error information (only present if success is false) */
  error?: {
    /** Error message */
    message: string;
    /** Error code */
    code?: string;
    /** HTTP status code */
    status?: number;
  };
}

/**
 * Interface for pagination parameters
 */
export interface PaginationParams {
  /** The page number (1-based) */
  page?: number;
  /** The number of items per page */
  limit?: number;
  /** Cursor-based pagination token */
  cursor?: string;
}

/**
 * Interface for pagination metadata
 */
export interface PaginationMeta {
  /** The current page number */
  currentPage: number;
  /** The total number of pages */
  totalPages?: number;
  /** The total number of items */
  totalItems?: number;
  /** Whether there is a next page */
  hasNextPage: boolean;
  /** Whether there is a previous page */
  hasPrevPage: boolean;
  /** Token for the next page (cursor-based pagination) */
  nextCursor?: string;
  /** Token for the previous page (cursor-based pagination) */
  prevCursor?: string;
}

/**
 * Interface for paginated results
 */
export interface PaginatedResult<T> {
  /** The array of items */
  items: T[];
  /** Pagination metadata */
  pagination: PaginationMeta;
}

/**
 * Interface for a generic post/article
 */
export interface Post {
  /** Unique identifier for the post */
  id: string | number;
  /** The title of the post */
  title: string;
  /** Optional subtitle or description */
  subtitle?: string;
  /** Post content in plain text */
  content?: string;
  /** Post content in HTML format */
  contentHtml?: string;
  /** Author of the post */
  author?: {
    /** Author name */
    name: string;
    /** Author ID or handle */
    id?: string;
    /** Author profile picture URL */
    profileImage?: string;
  };
  /** Publication date as ISO string */
  publishedAt?: string;
  /** URL to the post */
  url: string;
  /** Source platform (twitter, substack, etc.) */
  source: string;
  /** Additional metadata specific to the source platform */
  metadata?: Record<string, any>;
}

/**
 * Interface for a comment on a post
 */
export interface Comment {
  /** Unique identifier for the comment */
  id: string | number;
  /** The content of the comment */
  content: string;
  /** Author of the comment */
  author: {
    /** Author name */
    name: string;
    /** Author ID or handle */
    id?: string;
    /** Author profile picture URL */
    profileImage?: string;
  };
  /** Posted date as ISO string */
  postedAt: string;
  /** Parent comment ID if this is a reply */
  parentId?: string | number;
  /** Number of likes/reactions */
  likeCount?: number;
  /** Number of replies */
  replyCount?: number;
}
