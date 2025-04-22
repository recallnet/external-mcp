import {
  extractStructuredContent,
  htmlToPlainText,
  PostWithHtml,
  processPostContent,
  processPostsContent,
  stripHtml,
} from "../html.js";

/**
 * Tests for HTML utilities
 */

// Set Jest global variables for ESM compatibility
// @ts-ignore
global.jest = jest;
// @ts-ignore
global.expect = expect;
// @ts-ignore
global.test = test;
// @ts-ignore
global.describe = describe;
// @ts-ignore
global.beforeEach = beforeEach;
// @ts-ignore
global.afterEach = afterEach;

interface ProcessedPost {
  title: string;
  body_text: string;
}

describe("HTML Utilities", () => {
  describe("htmlToPlainText", () => {
    it("should convert basic HTML to plain text", () => {
      const html = "<p>Hello world</p><p>This is a test</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).toBe("Hello world\n\nThis is a test");
    });

    it("should handle HTML entities", () => {
      const html = "<p>Hello &amp; world</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).toBe("Hello & world");
    });

    it("should format blockquotes", () => {
      const html =
        "<p>Text</p><blockquote>Quoted text</blockquote><p>More text</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).toContain("> Quoted text");
    });

    it("should handle line breaks", () => {
      const html = "<p>Line 1<br>Line 2</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).toBe("Line 1\nLine 2");
    });

    it("should handle empty input", () => {
      expect(htmlToPlainText("")).toBe("");
      expect(htmlToPlainText(null as any)).toBe("");
    });
  });

  describe("extractStructuredContent", () => {
    it("should convert headings to markdown format", () => {
      const html = "<h1>Heading 1</h1><h2>Heading 2</h2><p>Paragraph</p>";
      const structured = extractStructuredContent(html);

      expect(structured).toContain("# Heading 1");
      expect(structured).toContain("## Heading 2");
    });

    it("should format list items with bullets", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const structured = extractStructuredContent(html);

      expect(structured).toContain("• Item 1");
      expect(structured).toContain("• Item 2");
    });
  });

  describe("processPostContent", () => {
    it("should convert HTML content to plain text in a post object", () => {
      const post = {
        title: "Test Post",
        body_html: "<p>This is HTML content</p>",
      };

      const processed = processPostContent(post);

      expect(processed).toHaveProperty("body_text");
      expect((processed as unknown as ProcessedPost).body_text).toBe("This is HTML content");
      expect(processed).not.toHaveProperty("body_html");
    });

    it("should handle missing body_html", () => {
      const post = { title: "Test Post" };
      const processed = processPostContent(post);

      expect(processed).toEqual(post);
    });

    it("should handle null input", () => {
      expect(processPostContent(null as unknown as PostWithHtml)).toBeNull();
    });
  });

  describe("processPostsContent", () => {
    // Define interface for the expected result type


    it("should process an array of posts", () => {
      const posts = [
        { title: "Post 1", body_html: "<p>Content 1</p>" },
        { title: "Post 2", body_html: "<p>Content 2</p>" },
      ];

      const processed = processPostsContent(posts);

      expect(Array.isArray(processed)).toBe(true);
      expect(processed).toHaveLength(2);
      expect(processed[0]).toHaveProperty("body_text");
      expect((processed[0] as unknown as ProcessedPost).body_text).toBe("Content 1");
      expect((processed[1] as unknown as ProcessedPost).body_text).toBe("Content 2");
    });

    it("should handle empty arrays", () => {
      expect(processPostsContent([])).toEqual([]);
    });

    it("should handle non-array input", () => {
      const nonArray = "not an array";
      expect(processPostsContent(nonArray as any)).toBe(nonArray);
    });
  });

  describe("stripHtml", () => {
    it("should remove all HTML tags", () => {
      const html =
        '<div><h1>Title</h1><p>This is a <strong>test</strong> with <a href="#">links</a></p></div>';
      const text = stripHtml(html);

      expect(text).toBe("TitleThis is a test with links");
    });

    it("should handle empty input", () => {
      expect(stripHtml("")).toBe("");
      expect(stripHtml(null as any)).toBe("");
    });
  });
});
