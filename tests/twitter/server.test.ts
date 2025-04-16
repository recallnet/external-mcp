import { describe, it } from "mocha";
import { expect } from "chai";
import {
  createTwitterServer,
  TwitterServerOptions,
} from "../../src/twitter/server.js";

describe("Twitter Server", () => {
  describe("createTwitterServer", () => {
    it("should create a server with default options", () => {
      const server = createTwitterServer();
      expect(server).to.exist;
      expect(server).to.have.property("resource");
      expect(server).to.have.property("tool");
      expect(server).to.have.property("prompt");
    });

    it("should accept custom options", () => {
      const options: TwitterServerOptions = {
        name: "custom-twitter-server",
        version: "2.0.0",
        includeAllTools: false,
        includeReadTools: true,
        includeWriteTools: false,
        includeGrokTools: false,
      };

      const server = createTwitterServer(options);
      expect(server).to.exist;
    });

    it("should register resources and tools", () => {
      const server = createTwitterServer();

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
