import * as coingeckoClient from '../client.js';

describe('CoinGecko Client', () => {
  describe('Exports', () => {
    it('should export core functions', () => {
      expect(typeof coingeckoClient.getAvailableFeatures).toBe('function');
      expect(typeof coingeckoClient.getTokenPrice).toBe('function');
      expect(typeof coingeckoClient.getTokenContracts).toBe('function');
      expect(typeof coingeckoClient.searchTokens).toBe('function');
      expect(typeof coingeckoClient.getTrendingTokens).toBe('function');
    });
  });

  describe('getAvailableFeatures', () => {
    it('should return feature flags object', () => {
      const features = coingeckoClient.getAvailableFeatures();
      expect(features).toBeInstanceOf(Object);
      expect(features).toHaveProperty('apiAccess');
      expect(features).toHaveProperty('proAccess');
      expect(typeof features.apiAccess).toBe('boolean');
      expect(typeof features.proAccess).toBe('boolean');
    });
  });

  describe('Type Definitions', () => {
    it('should have properly defined interfaces', () => {
      // This is a type-level test that ensures interfaces are exported
      // No runtime assertions needed, this will fail at compile-time if interfaces are missing
      const dummyFeatures: coingeckoClient.CoinGeckoFeatures = {
        apiAccess: true,
        proAccess: false,
      };
      expect(dummyFeatures).toBeInstanceOf(Object);
    });
  });
});
