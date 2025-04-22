import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
// Import the TwitterIntegration directly since it's what we need to test
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

import { twitterTools } from '../tools/index.js';
import { TwitterIntegration } from '../twitter-integration.js';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic test to verify the module structure
describe('Twitter MCP - Basic Structure', () => {
  describe('TwitterIntegration', () => {
    it('should be a class with getInstance method', () => {
      expect(TwitterIntegration).toBeDefined();
      expect(typeof TwitterIntegration.getInstance).toBe('function');
    });
  });

  describe('Twitter Tools Definitions', () => {
    it('should export an array of tools with correct structure', () => {
      expect(Array.isArray(twitterTools)).toBe(true);
      expect(twitterTools.length).toBeGreaterThan(0); // Ensure there are tools
      if (twitterTools.length > 0) {
        const firstTool = twitterTools[0] as Tool;
        expect(firstTool).toHaveProperty('name');
        expect(firstTool).toHaveProperty('description');
        expect(firstTool).toHaveProperty('inputSchema');
        expect(typeof firstTool.name).toBe('string');
        expect(typeof firstTool.description).toBe('string');
        expect(typeof firstTool.inputSchema).toBe('object');
      }
    });
  });
});

describe('Twitter MCP - Client-Server Interaction (Stdio)', () => {
  let client: Client | null = null;
  let transport: StdioClientTransport | null = null;

  beforeAll(async () => {
    // Point to the compiled server entry point
    const serverPath = path.resolve(__dirname, '../../dist/index.js');

    transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      // Optional: Add environment variables if needed for testing
      // env: { ...process.env, YOUR_TEST_VAR: 'value' }
    });

    client = new Client({
      name: 'test-client',
      version: '1.0.0',
    });

    // Connect the client
    // Add a timeout to handle potential connection issues
    await Promise.race([
      client.connect(transport),
      new Promise(
        (_, reject) => setTimeout(() => reject(new Error('Client connection timed out')), 10000), // 10 second timeout
      ),
    ]);
  });

  afterAll(async () => {
    // Disconnect the client and transport - Transport handles process termination
    // await client?.disconnect(); // No disconnect method on client
    // await transport?.disconnect(); // Transport handles process termination
    client = null;
    transport = null; // Allow garbage collection
  });

  it('should list the correct tools from the running server', async () => {
    expect(client).not.toBeNull();
    if (!client) throw new Error('Client not initialized'); // Type guard

    const listedTools = await client.listTools();

    // Check if the number of tools matches
    expect(listedTools.tools).toHaveLength(twitterTools.length);

    // Check if the names of the listed tools match the expected tools
    // We compare names as a basic check. For a stricter check, compare the whole objects.
    const listedToolNames = listedTools.tools.map((t) => t.name).sort();
    const expectedToolNames = twitterTools.map((t) => t.name).sort();

    expect(listedToolNames).toEqual(expectedToolNames);

    // Optional: Deeper check - ensure structure matches for a sample tool
    if (listedTools.tools.length > 0 && twitterTools.length > 0) {
      const firstListedTool = listedTools.tools.find((t) => t.name === twitterTools[0].name);
      const firstExpectedTool = twitterTools[0];
      expect(firstListedTool).toBeDefined();
      expect(firstListedTool?.name).toEqual(firstExpectedTool.name);
      expect(firstListedTool?.description).toEqual(firstExpectedTool.description);
      // Note: Comparing inputSchema directly might be fragile if object order differs
      expect(firstListedTool?.inputSchema).toMatchObject(firstExpectedTool.inputSchema);
    }
  });

  it('should get tweets from a specific list using getListTweets', async () => {
    expect(client).not.toBeNull();
    if (!client) throw new Error('Client not initialized'); // Type guard

    const listId = '1913430764987048287';
    const count = 10;

    const result = await client.callTool({
      name: 'getListTweets',
      arguments: {
        listId: listId,
        count: count,
      },
    });

    // Check if the MCP call itself resulted in an error
    if (result.isError === true) {
      // Extract error details if possible
      const errorDetails =
        Array.isArray(result.content) &&
        (result.content[0] as { type: string; text: string })?.type === 'text'
          ? (result.content[0] as { type: string; text: string }).text
          : JSON.stringify(result.content);
      throw new Error(`getListTweets MCP call failed with error: ${errorDetails}`);
    }

    // If isError is not explicitly true, proceed assuming success or empty result
    // Runtime checks for the expected content structure
    expect(Array.isArray(result.content)).toBe(true);
    const contentArray = result.content as unknown[];

    // It's possible for the list to be empty, so we don't require length > 0
    // We proceed only if there is content to parse
    if (contentArray.length > 0) {
      const firstContent = contentArray[0] as { type?: string; text?: string };
      expect(firstContent?.type).toBe('text');
      expect(typeof firstContent?.text).toBe('string');

      let tweets: Array<{ id: string; text: string; [key: string]: unknown }> = [];
      try {
        tweets = JSON.parse(firstContent.text || '[]');
      } catch (e) {
        throw new Error('Failed to parse getListTweets response text as JSON');
      }

      expect(Array.isArray(tweets)).toBe(true);
      // Check if the number of tweets is less than or equal to the requested count
      expect(tweets.length).toBeLessThanOrEqual(count);
      // Also check if we received a reasonable number of tweets (more than 5)
      expect(tweets.length).toBeGreaterThan(5);

      // Optional: Basic check on tweet structure if tweets are returned
      if (tweets.length > 0) {
        expect(tweets[0]).toHaveProperty('id');
        expect(tweets[0]).toHaveProperty('text');
      }
    } else {
      // Log if the array was empty, but don't fail the test for this reason
      console.log(
        `getListTweets returned an empty content array for list ${listId}, potentially an empty list.`,
      );
    }
  });

  // Add more tests here for other client methods (callTool, listResources, etc.)
  // Example: test calling 'myProfile' tool (requires auth setup)
  /*
  it('should be able to call the myProfile tool', async () => {
    expect(client).not.toBeNull();
    if (!client) throw new Error('Client not initialized');

    // Note: This test assumes the server is authenticated during the test run
    // You might need to mock authentication or provide test credentials via env vars
    const result = await client.callTool({
      name: 'myProfile',
      arguments: { check: true }
    });

    expect(result.isError).toBe(false);
    expect(result.content[0].type).toBe('text');
    const profileData = JSON.parse(result.content[0].text);
    expect(profileData).toHaveProperty('userId');
    expect(profileData).toHaveProperty('username');
  });
  */
});
