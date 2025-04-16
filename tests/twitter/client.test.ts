import { describe, it } from "mocha";
import { expect } from "chai";
import * as twitterClient from "../../src/twitter/client.js";

describe("Twitter Client", () => {
  describe("Exports", () => {
    it("should export core functions", () => {
      expect(typeof twitterClient.getAvailableFeatures).to.equal("function");
      expect(typeof twitterClient.createTwitterClient).to.equal("function");
      expect(typeof twitterClient.safeTwitterCall).to.equal("function");
    });

    it("should export API functions", () => {
      expect(typeof twitterClient.getTweets).to.equal("function");
      expect(typeof twitterClient.getProfile).to.equal("function");
      expect(typeof twitterClient.searchTweets).to.equal("function");
      expect(typeof twitterClient.getTrends).to.equal("function");
    });
  });

  describe("getAvailableFeatures", () => {
    it("should return feature flags object", () => {
      const features = twitterClient.getAvailableFeatures();
      expect(features).to.be.an("object");
      expect(features).to.have.property("basicAuth");
      expect(features).to.have.property("emailAuth");
      expect(features).to.have.property("apiAuth");
      expect(features).to.have.property("fullAuth");
      expect(features).to.have.property("grokAccess");
    });
  });
});
