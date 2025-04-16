import { McpClient } from "@modelcontextprotocol/sdk/client/mcp.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log("Testing Substack content tools...");

  // Path to the Substack server module
  const serverPath = join(__dirname, "dist", "substack", "server.js");
  console.log(`Starting server from: ${serverPath}`);

  // Spawn the server as a child process
  const server = spawn("node", [serverPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Handle server output
  let serverStarted = false;
  server.stderr.on("data", (data) => {
    console.log(`Server: ${data.toString().trim()}`);
    if (data.toString().includes("Substack MCP server started")) {
      serverStarted = true;
    }
  });

  // Wait for the server to start
  await new Promise((resolve) => {
    const checkStarted = () => {
      if (serverStarted) {
        resolve();
      } else {
        setTimeout(checkStarted, 100);
      }
    };
    checkStarted();
  });

  console.log("Server started, connecting client...");

  // Create a client
  const transport = new StdioClientTransport(server.stdin, server.stdout);
  const client = new McpClient();

  try {
    await client.connect(transport);
    console.log("Connected to server!");

    // Test getContentBySlug tool
    console.log("\nTesting getContentBySlug tool...");
    try {
      // Use strategery.substack.com as it's a reliable publication for testing
      const result = await client.invoke("getContentBySlug", {
        substackId: "strategery",
        slug: "what-happens-when-llms-become-self-hosted",
        format: "markdown"
      });
      console.log("Success! First 200 characters of content:");
      console.log(JSON.parse(result.content[0].text).content.substring(0, 200) + "...");
    } catch (error) {
      console.error("Error testing getContentBySlug:", error);
    }

    // Test getContentLatest tool
    console.log("\nTesting getContentLatest tool...");
    try {
      const result = await client.invoke("getContentLatest", {
        substackId: "strategery",
        format: "plain"
      });
      console.log("Success! Title of latest post:");
      console.log(JSON.parse(result.content[0].text).title);
    } catch (error) {
      console.error("Error testing getContentLatest:", error);
    }

    // Test getMetadataBySlug tool
    console.log("\nTesting getMetadataBySlug tool...");
    try {
      const result = await client.invoke("getMetadataBySlug", {
        substackId: "strategery",
        slug: "what-happens-when-llms-become-self-hosted"
      });
      console.log("Success! Post metadata:");
      const metadata = JSON.parse(result.content[0].text);
      console.log(`Title: ${metadata.title}`);
      console.log(`Author: ${metadata.author}`);
    } catch (error) {
      console.error("Error testing getMetadataBySlug:", error);
    }

    // Test getPostMetadata tool
    console.log("\nTesting getPostMetadata tool...");
    try {
      const result = await client.invoke("getPostMetadata", {
        postUrl: "https://strategery.substack.com/p/what-happens-when-llms-become-self-hosted"
      });
      console.log("Success! Post metadata from URL:");
      const metadata = JSON.parse(result.content[0].text);
      console.log(`Title: ${metadata.title}`);
      console.log(`Domain: ${metadata.domain}`);
    } catch (error) {
      console.error("Error testing getPostMetadata:", error);
    }

  } catch (error) {
    console.error("Error connecting to server:", error);
  } finally {
    console.log("\nShutting down...");
    server.stdin.end();
    setTimeout(() => {
      server.kill();
      process.exit(0);
    }, 500);
  }
}

main().catch(console.error);