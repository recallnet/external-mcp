import { describe, it } from "mocha";
import { expect } from "chai";
import {
  createCoinGeckoServer,
  CoinGeckoServerOptions,
} from "../../src/coingecko/server.js";

describe("CoinGecko Server", () => {
  describe("createCoinGeckoServer", () => {
    it("should create a server with default options", () => {
      const server = createCoinGeckoServer();
      expect(server).to.exist;
      expect(server).to.have.property("resource");
      expect(server).to.have.property("tool");
      expect(server).to.have.property("prompt");
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
      expect(server).to.exist;
    });

    it("should register resources and tools", () => {
      const server = createCoinGeckoServer();

      // The server object should have resource and tool methods
      expect(server.resource).to.be.a("function");
      expect(server.tool).to.be.a("function");

      // Check for server property which gives access to the underlying Server instance
      expect(server).to.have.property("server");
      // Check that the server has the required methods
      expect(server.close).to.be.a("function");
      expect(server.connect).to.be.a("function");
    });
  });
});
