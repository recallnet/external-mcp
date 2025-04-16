import { describe, it } from "mocha";
import { expect } from "chai";
import * as coingeckoClient from "../../src/coingecko/client.js";

describe("CoinGecko Client", () => {
  describe("Exports", () => {
    it("should export core functions", () => {
      expect(coingeckoClient.getAvailableFeatures).to.be.a("function");
      expect(coingeckoClient.getTokenPrice).to.be.a("function");
      expect(coingeckoClient.getTokenContracts).to.be.a("function");
      expect(coingeckoClient.searchTokens).to.be.a("function");
      expect(coingeckoClient.getTrendingTokens).to.be.a("function");
    });
  });

  describe("getAvailableFeatures", () => {
    it("should return feature flags object", () => {
      const features = coingeckoClient.getAvailableFeatures();
      expect(features).to.be.an("object");
      expect(features).to.have.property("apiAccess");
      expect(features).to.have.property("proAccess");
      expect(features.apiAccess).to.be.a("boolean");
      expect(features.proAccess).to.be.a("boolean");
    });
  });

  describe("Type Definitions", () => {
    it("should have properly defined interfaces", () => {
      // This is a type-level test that ensures interfaces are exported
      // No runtime assertions needed, this will fail at compile-time if interfaces are missing
      const dummyFeatures: coingeckoClient.CoinGeckoFeatures = {
        apiAccess: true,
        proAccess: false,
      };
      expect(dummyFeatures).to.be.an("object");

      const dummyPrice: coingeckoClient.TokenPrice = {
        id: "bitcoin",
        symbol: "btc",
        name: "Bitcoin",
        current_price: 50000,
        last_updated: new Date().toISOString(),
      };
      expect(dummyPrice).to.be.an("object");
    });
  });
});