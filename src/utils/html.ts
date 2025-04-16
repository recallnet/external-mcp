/**
 * HTML Utilities
 * Common functions for processing and manipulating HTML content
 */

/**
 * Converts HTML content to plain text while preserving basic structure
 * @param html HTML content to convert
 * @returns Plain text with preserved paragraph breaks
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";

  // Replace common block elements with newlines
  let text = html
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<\/tr>/gi, "\n");

  // Mark blockquotes for better formatting
  text = text.replace(/<blockquote[^>]*>/gi, "\n\n> ");
  text = text.replace(/<\/blockquote>/gi, "\n\n");

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text
    .replace(/\n{3,}/g, "\n\n") // Replace multiple newlines with just two
    .trim();

  return text;
}

/**
 * Extracts structured content from HTML by preserving important elements
 * @param html HTML content to process
 * @returns Simplified text with some structure preserved
 */
export function extractStructuredContent(html: string): string {
  if (!html) return "";

  // Replace headings with markdown-style formatting
  let text = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replace(/<h5[^>]*>(.*?)<\/h5>/gi, "##### $1\n\n")
    .replace(/<h6[^>]*>(.*?)<\/h6>/gi, "###### $1\n\n");

  // Handle lists
  text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, "• $1\n");

  // Convert the rest using htmlToPlainText
  return htmlToPlainText(text);
}

/**
 * Processes a post object to convert HTML content to plain text
 * @param post Post object with potential HTML content
 * @returns Post with HTML content converted to plain text
 */
export function processPostContent(post: any): any {
  if (!post) return post;

  const processedPost = { ...post };

  // Convert HTML content fields to plain text
  if (processedPost.body_html) {
    processedPost.body_text = htmlToPlainText(processedPost.body_html);
    delete processedPost.body_html;
  }

  if (processedPost.truncated_body_text) {
    processedPost.truncated_body_text = htmlToPlainText(
      processedPost.truncated_body_text,
    );
  }

  return processedPost;
}

/**
 * Processes an array of post objects to convert HTML content to plain text
 * @param posts Array of post objects with potential HTML content
 * @returns Posts with HTML content converted to plain text
 */
export function processPostsContent(posts: any[]): any[] {
  if (!posts || !Array.isArray(posts)) return posts;
  return posts.map((post) => processPostContent(post));
}

/**
 * Extracts the main textual content from a webpage
 * @param html The full HTML of the webpage
 * @returns The main content as plain text
 */
export function extractMainContent(html: string): string {
  if (!html) return "";

  // Common content container selectors
  const contentSelectors = [
    "article",
    ".content",
    ".article-content",
    ".post-content",
    ".entry-content",
    "main",
    "#content",
  ];

  // Simple regex-based approach for each potential content container
  for (const selector of contentSelectors) {
    const regex = new RegExp(`<${selector}[^>]*>(.*?)<\/${selector}>`, "is");
    const match = html.match(regex);
    if (match && match[1]) {
      return htmlToPlainText(match[1]);
    }
  }

  // Fallback: extract the body if no content container found
  const bodyMatch = html.match(/<body[^>]*>(.*?)<\/body>/is);
  if (bodyMatch && bodyMatch[1]) {
    return htmlToPlainText(bodyMatch[1]);
  }

  return htmlToPlainText(html);
}

/**
 * Removes all HTML tags and attributes from a string, keeping only text content
 * @param html HTML string to sanitize
 * @returns Text-only content with no HTML
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}
