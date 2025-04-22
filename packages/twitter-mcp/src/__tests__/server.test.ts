import { twitterTools } from '../tools/index.js';
import { TwitterIntegration } from '../twitter-integration.js';

describe('Twitter MCP Server', () => {
  describe('Server Configuration', () => {
    it('should have Twitter integration available', () => {
      expect(TwitterIntegration).toBeDefined();
      expect(typeof TwitterIntegration.getInstance).toBe('function');
    });

    it('should have tools defined', () => {
      expect(Array.isArray(twitterTools)).toBe(true);
      expect(twitterTools.length).toBeGreaterThan(0);

      // Check structure of a tool
      const tool = twitterTools[0];
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('description');
      expect(tool).toHaveProperty('inputSchema');
    });
  });
});
