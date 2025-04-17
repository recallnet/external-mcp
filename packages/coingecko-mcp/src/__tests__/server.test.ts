import { CoinGeckoServerOptions, createCoinGeckoServer } from "../server.js";

describe("CoinGecko Server", () => {
  describe("createCoinGeckoServer", () => {
    it("should create a server with default options", () => {
      const server = createCoinGeckoServer();
      expect(server).toBeDefined();
      expect(server).toHaveProperty("resource");
      expect(server).toHaveProperty("tool");
      expect(server).toHaveProperty("prompt");
    });

    it("should accept custom options", () => {
      const options: CoinGeckoServerOptions = {
        name: "custom-coingecko-server",
        version: "2.0.0",
        includeAllTools: false,
        includeBasicTools: true,
        includeAdvancedTools: false,
      };

      const server = createCoinGeckoServer(options);
      expect(server).toBeDefined();
    });

    it("should register resources and tools", () => {
      const server = createCoinGeckoServer();

      // The server object should have resource and tool methods
      expect(typeof server.resource).toBe("function");
      expect(typeof server.tool).toBe("function");

      // Check for server property which gives access to the underlying Server instance
      expect(server).toHaveProperty("server");
      // Check that the server has the required methods
      expect(typeof server.close).toBe("function");
      expect(typeof server.connect).toBe("function");
    });
  });
});
