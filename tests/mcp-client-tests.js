/**
 * Test suite for MCP client connections to our servers
 * This file tests connecting to each individual server and the combined server
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import { expect } from "chai";
import path from "path";
import { fileURLToPath } from "url";
import { setTimeout } from "timers/promises";

// Get the directory name for this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the built servers
const SERVER_PATHS = {
  twitter: path.resolve(__dirname, "../dist/twitter/server.js"),
  substack: path.resolve(__dirname, "../dist/substack/server.js"),
  coingecko: path.resolve(__dirname, "../dist/coingecko/server.js"),
  combined: path.resolve(__dirname, "../dist/index.js"),
};

describe("MCP Client Tests", function () {
  // Set higher timeout for server startup
  this.timeout(10000);

  let serverProcess;
  let client;
  let transport;

  // Helper to start a server
  const startServer = async (serverType) => {
    // Kill any existing server process
    if (serverProcess) {
      serverProcess.kill();
      await setTimeout(1000); // Give it time to shut down
    }

    const serverPath = SERVER_PATHS[serverType];

    // Start a new server process
    serverProcess = spawn("node", [serverPath], {
      env: {
        ...process.env,
        NODE_ENV: "test",
      },
    });

    // Log server output for debugging
    serverProcess.stdout.on("data", (data) => {
      console.log(`Server stdout: ${data}`);
    });

    serverProcess.stderr.on("data", (data) => {
      console.error(`Server stderr: ${data}`);
    });

    // Create a new transport
    transport = new StdioClientTransport({
      command: "node",
      args: [serverPath],
      env: {
        NODE_ENV: "test",
      },
    });

    // Create a new client
    client = new Client({
      name: "test-client",
      version: "1.0.0",
    });

    // Connect to the server
    await client.connect(transport);

    // Give the server a moment to initialize
    await setTimeout(1000);

    return { client, serverProcess };
  };

  afterEach(async () => {
    // Cleanup after each test
    if (client) {
      try {
        await client.disconnect();
      } catch (e) {
        console.error("Error disconnecting client:", e);
      }
    }

    if (serverProcess) {
      serverProcess.kill();
      await setTimeout(1000); // Give it time to shut down
    }
  });

  describe("Twitter MCP Server", () => {
    before(async () => {
      ({ client, serverProcess } = await startServer("twitter"));
    });

    it("should list available tools", async () => {
      const tools = await client.listTools();
      expect(tools).to.be.an("array");

      // Check for Twitter-specific tools
      const toolNames = tools.map((t) => t.name);
      expect(toolNames.length).to.be.greaterThan(0);

      // There should be a Twitter status resource
      const resources = await client.listResources();
      const resourceUris = resources.map((r) => r.uri);
      expect(resourceUris.some((uri) => uri.startsWith("twitter://"))).to.be
        .true;
    });

    it("should be able to call the help tool", async () => {
      const result = await client.callTool({
        name: "recall-help",
        arguments: {
          module: "twitter",
        },
      });

      expect(result).to.have.property("content");
      expect(result.content[0]).to.have.property("text");
      expect(result.content[0].text).to.include("Twitter Module");
    });
  });

  describe("Substack MCP Server", () => {
    before(async () => {
      ({ client, serverProcess } = await startServer("substack"));
    });

    it("should list available tools", async () => {
      const tools = await client.listTools();
      expect(tools).to.be.an("array");

      // Check for Substack-specific tools
      const toolNames = tools.map((t) => t.name);
      expect(toolNames.length).to.be.greaterThan(0);

      // There should be a Substack resource
      const resources = await client.listResources();
      const resourceUris = resources.map((r) => r.uri);
      expect(resourceUris.some((uri) => uri.includes("substack"))).to.be.true;
    });

    it("should be able to call the help tool", async () => {
      const result = await client.callTool({
        name: "recall-help",
        arguments: {
          module: "substack",
        },
      });

      expect(result).to.have.property("content");
      expect(result.content[0]).to.have.property("text");
      expect(result.content[0].text).to.include("Substack Module");
    });
  });

  describe("CoinGecko MCP Server", () => {
    before(async () => {
      ({ client, serverProcess } = await startServer("coingecko"));
    });

    it("should list available tools", async () => {
      const tools = await client.listTools();
      expect(tools).to.be.an("array");

      // Check for CoinGecko-specific tools
      const toolNames = tools.map((t) => t.name);
      expect(toolNames.length).to.be.greaterThan(0);

      // There should be a CoinGecko resource
      const resources = await client.listResources();
      const resourceUris = resources.map((r) => r.uri);
      expect(resourceUris.some((uri) => uri.includes("coingecko"))).to.be.true;
    });

    it("should be able to call the help tool", async () => {
      const result = await client.callTool({
        name: "recall-help",
        arguments: {
          module: "coingecko",
        },
      });

      expect(result).to.have.property("content");
      expect(result.content[0]).to.have.property("text");
      expect(result.content[0].text).to.include("CoinGecko Module");
    });
  });

  describe("Combined MCP Server", () => {
    before(async () => {
      ({ client, serverProcess } = await startServer("combined"));
    });

    it("should list available tools from all modules", async () => {
      const tools = await client.listTools();
      expect(tools).to.be.an("array");
      expect(tools.length).to.be.greaterThan(0);

      // There should be status resources for modules
      const resources = await client.listResources();
      const resourceUris = resources.map((r) => r.uri);

      // Check for resources from multiple modules
      const hasMultipleTypes =
        [
          resourceUris.some((uri) => uri.includes("twitter")),
          resourceUris.some((uri) => uri.includes("substack")),
          resourceUris.some((uri) => uri.includes("coingecko")),
        ].filter(Boolean).length >= 2;

      expect(hasMultipleTypes).to.be.true;
    });

    it("should be able to get info about all modules", async () => {
      const result = await client.callTool({
        name: "recall-help",
        arguments: {
          module: "all",
        },
      });

      expect(result).to.have.property("content");
      expect(result.content[0]).to.have.property("text");

      // The response should mention all three modules
      const responseText = result.content[0].text;
      expect(responseText).to.include("twitter");
      expect(responseText).to.include("substack");
      expect(responseText).to.include("coingecko");
    });

    it("should be able to read the recall-info resource", async () => {
      const resource = await client.readResource({
        uri: "recall://info",
      });

      expect(resource).to.have.property("contents");
      expect(resource.contents[0]).to.have.property("text");

      // Parse the JSON in the response
      const info = JSON.parse(resource.contents[0].text);
      expect(info).to.have.property("modules");
      expect(info.modules).to.include("twitter");
      expect(info.modules).to.include("substack");
      expect(info.modules).to.include("coingecko");
    });
  });
});
