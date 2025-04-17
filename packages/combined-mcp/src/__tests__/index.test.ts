import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { ModuleType, createCombinedServer } from "../index.js";

// Set Jest global variables for ESM compatibility
// @ts-ignore
global.jest = jest;
// @ts-ignore
global.expect = expect;
// @ts-ignore
global.test = test;
// @ts-ignore
global.describe = describe;
// @ts-ignore
global.beforeEach = beforeEach;
// @ts-ignore
global.afterEach = afterEach;

describe("Combined Server", () => {
  test("createCombinedServer creates server with default options", () => {
    const server = createCombinedServer();
    expect(server).toBeInstanceOf(McpServer);

    // Verify server instance has expected methods and properties
    expect(server).toHaveProperty("resource");
    expect(server).toHaveProperty("tool");
    expect(server).toHaveProperty("connect");
    expect(server).toHaveProperty("_cleanup");
  });

  test("createCombinedServer creates server with custom options", () => {
    const customOptions = {
      name: "custom-server",
      version: "2.0.0",
      modules: ["twitter", "coingecko"] as ModuleType[],
    };

    const server = createCombinedServer(customOptions);
    expect(server).toBeInstanceOf(McpServer);

    // Verify server instance has expected methods and properties
    expect(server).toHaveProperty("resource");
    expect(server).toHaveProperty("tool");
    expect(server).toHaveProperty("connect");
    expect(server).toHaveProperty("_cleanup");
  });

  test("createCombinedServer has the expected resources and tools", () => {
    const server = createCombinedServer();

    // Verify the server is created successfully
    expect(server).toBeInstanceOf(McpServer);

    // Check for specific properties that should exist on the server
    expect(server).toHaveProperty("resource");
    expect(server).toHaveProperty("tool");
    expect(server).toHaveProperty("_cleanup");

    // Check server has methods for handling resources and tools
    expect(typeof server.resource).toBe("function");
    expect(typeof server.tool).toBe("function");

    // We would need to mock the server's internal methods to verify
    // that specific resources and tools are registered
  });
});
