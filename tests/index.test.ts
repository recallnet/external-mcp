import { expect, test, describe, jest } from "@jest/globals";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createCombinedServer, ModuleType } from "../src/index.js";

describe("Combined Server", () => {
  test("createCombinedServer creates server with default options", () => {
    const server = createCombinedServer();
    expect(server).toBeInstanceOf(McpServer);

    // Should have default name and version
    expect((server as any).serverName).toBe("recall-mcp-server");
    expect((server as any).serverVersion).toBe("1.0.0");
  });

  test("createCombinedServer creates server with custom options", () => {
    const customOptions = {
      name: "custom-server",
      version: "2.0.0",
      modules: ["twitter", "coingecko"] as ModuleType[],
    };

    const server = createCombinedServer(customOptions);
    expect(server).toBeInstanceOf(McpServer);

    // Should have custom name and version
    expect((server as any).serverName).toBe("custom-server");
    expect((server as any).serverVersion).toBe("2.0.0");
  });

  test("createCombinedServer registers resources and tools", () => {
    const server = createCombinedServer();

    // Server should have recall-help tool registered
    const registeredTools = (server as any)._registered.tools;
    expect(registeredTools).toHaveProperty("recall-help");

    // Server should have status resources registered
    const registeredResources = (server as any)._registered.resources;
    expect(registeredResources).toHaveProperty("recall-info");

    // When all modules are included, should have status resources for each
    expect(registeredResources).toHaveProperty("twitter-status");
    expect(registeredResources).toHaveProperty("substack-status");
    expect(registeredResources).toHaveProperty("coingecko-status");
  });
});
