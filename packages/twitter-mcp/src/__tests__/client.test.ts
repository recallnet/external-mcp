// Import the TwitterIntegration directly since it's what we need to test
import { twitterTools } from "../tools/index.js";
import { TwitterIntegration } from "../twitter-integration.js";

// Basic test to verify the module structure
describe("Twitter MCP", () => {
  describe("TwitterIntegration", () => {
    it("should be a class with getInstance method", () => {
      expect(TwitterIntegration).toBeDefined();
      expect(typeof TwitterIntegration.getInstance).toBe("function");
    });
  });

  describe("Twitter Tools", () => {
    it("should export an array of tools", () => {
      expect(Array.isArray(twitterTools)).toBe(true);
      if (twitterTools.length > 0) {
        expect(twitterTools[0]).toHaveProperty("name");
        expect(twitterTools[0]).toHaveProperty("description");
        expect(twitterTools[0]).toHaveProperty("inputSchema");
      }
    });
  });
});
