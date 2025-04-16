/**
 * Tests for the Substack client functionality
 */

import { expect } from "chai";
import * as client from "../../src/substack/client.js";
import {
  SubstackPost,
  SubstackPostDetails,
} from "../../src/substack/client.js";
import "mocha";

describe("Substack Client", () => {
  describe("normalizeSubstackId", () => {
    it("should append .substack.com if not already a full domain", () => {
      expect(client.normalizeSubstackId("test")).to.equal("test.substack.com");
    });

    it("should not modify an ID that already contains a dot", () => {
      expect(client.normalizeSubstackId("test.substack.com")).to.equal(
        "test.substack.com",
      );
      expect(client.normalizeSubstackId("custom.domain.com")).to.equal(
        "custom.domain.com",
      );
    });
  });

  describe("getAvailableFeatures", () => {
    it("should return an object with feature availability", () => {
      const features = client.getAvailableFeatures();
      expect(features).to.be.an("object");
      expect(features).to.have.property("basicAccess");
      expect(features.basicAccess).to.be.a("boolean");
    });
  });

  // Test functionality that doesn't make actual network requests
  describe("Type Definitions", () => {
    it("should have properly defined SubstackPost interface", () => {
      // Create a valid post object based on the interface
      const post: SubstackPost = {
        slug: "test-post",
        title: "Test Post Title",
        subtitle: "A test subtitle",
        post_date: "2023-01-01",
        url: "https://test.substack.com/p/test-post",
        author: "Test Author",
        post_id: 12345,
      };

      // Verify properties
      expect(post).to.have.property("slug");
      expect(post).to.have.property("title");
      expect(post).to.have.property("url");
    });

    it("should have properly defined SubstackPostDetails interface", () => {
      // Create a valid post details object based on the interface
      const postDetails: SubstackPostDetails = {
        title: "Test Post Title",
        subtitle: "A test subtitle",
        author: "Test Author",
        publish_date: "2023-01-01",
        content: "<p>Test content</p>",
        url: "https://test.substack.com/p/test-post",
        domain: "test.substack.com",
        slug: "test-post",
        post_id: 12345,
      };

      // Verify properties
      expect(postDetails).to.have.property("title");
      expect(postDetails).to.have.property("content");
      expect(postDetails).to.have.property("domain");
    });
  });

  // NOTE: The following tests are commented out because they make actual network requests
  // Uncomment and modify them for integration testing with a real Substack publication
  /*
  describe('getRecentPosts', () => {
    it('should fetch recent posts from a Substack publication', async () => {
      const posts = await client.getRecentPosts('some-publication', 3);
      expect(posts).to.be.an('array');
      expect(posts.length).to.be.at.most(3);
      if (posts.length > 0) {
        expect(posts[0]).to.have.property('title');
      }
    });
  });

  describe('getPostBySlug', () => {
    it('should fetch a post by its slug', async () => {
      const post = await client.getPostBySlug('some-publication', 'some-post-slug');
      expect(post).to.be.an('object');
      expect(post).to.have.property('title');
    });
  });
  */
});
