/**
 * Tests for HTML utilities
 */

import { expect } from "chai";
import "mocha";
import {
  htmlToPlainText,
  extractStructuredContent,
  processPostContent,
  processPostsContent,
  stripHtml,
} from "../../src/utils/html.js";

describe("HTML Utilities", () => {
  describe("htmlToPlainText", () => {
    it("should convert basic HTML to plain text", () => {
      const html = "<p>Hello world</p><p>This is a test</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).to.equal("Hello world\n\nThis is a test");
    });

    it("should handle HTML entities", () => {
      const html = "<p>Hello &amp; world</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).to.equal("Hello & world");
    });

    it("should format blockquotes", () => {
      const html =
        "<p>Text</p><blockquote>Quoted text</blockquote><p>More text</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).to.include("> Quoted text");
    });

    it("should handle line breaks", () => {
      const html = "<p>Line 1<br>Line 2</p>";
      const plainText = htmlToPlainText(html);

      expect(plainText).to.equal("Line 1\nLine 2");
    });

    it("should handle empty input", () => {
      expect(htmlToPlainText("")).to.equal("");
      expect(htmlToPlainText(null as any)).to.equal("");
    });
  });

  describe("extractStructuredContent", () => {
    it("should convert headings to markdown format", () => {
      const html = "<h1>Heading 1</h1><h2>Heading 2</h2><p>Paragraph</p>";
      const structured = extractStructuredContent(html);

      expect(structured).to.include("# Heading 1");
      expect(structured).to.include("## Heading 2");
    });

    it("should format list items with bullets", () => {
      const html = "<ul><li>Item 1</li><li>Item 2</li></ul>";
      const structured = extractStructuredContent(html);

      expect(structured).to.include("• Item 1");
      expect(structured).to.include("• Item 2");
    });
  });

  describe("processPostContent", () => {
    it("should convert HTML content to plain text in a post object", () => {
      const post = {
        title: "Test Post",
        body_html: "<p>This is HTML content</p>",
      };

      const processed = processPostContent(post);

      expect(processed).to.have.property("body_text");
      expect(processed.body_text).to.equal("This is HTML content");
      expect(processed).to.not.have.property("body_html");
    });

    it("should handle missing body_html", () => {
      const post = { title: "Test Post" };
      const processed = processPostContent(post);

      expect(processed).to.deep.equal(post);
    });

    it("should handle null input", () => {
      expect(processPostContent(null)).to.be.null;
    });
  });

  describe("processPostsContent", () => {
    it("should process an array of posts", () => {
      const posts = [
        { title: "Post 1", body_html: "<p>Content 1</p>" },
        { title: "Post 2", body_html: "<p>Content 2</p>" },
      ];

      const processed = processPostsContent(posts);

      expect(processed).to.be.an("array");
      expect(processed).to.have.length(2);
      expect(processed[0]).to.have.property("body_text");
      expect(processed[0].body_text).to.equal("Content 1");
      expect(processed[1].body_text).to.equal("Content 2");
    });

    it("should handle empty arrays", () => {
      expect(processPostsContent([])).to.deep.equal([]);
    });

    it("should handle non-array input", () => {
      const nonArray = "not an array";
      expect(processPostsContent(nonArray as any)).to.equal(nonArray);
    });
  });

  describe("stripHtml", () => {
    it("should remove all HTML tags", () => {
      const html =
        '<div><h1>Title</h1><p>This is a <strong>test</strong> with <a href="#">links</a></p></div>';
      const text = stripHtml(html);

      expect(text).to.equal("TitleThis is a test with links");
    });

    it("should handle empty input", () => {
      expect(stripHtml("")).to.equal("");
      expect(stripHtml(null as any)).to.equal("");
    });
  });
});
