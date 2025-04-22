import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

import type { DetailedTokenInfo } from '../client.js';
import { type CoinGeckoServerOptions, createCoinGeckoServer } from '../server.js';

// Define an interface for the content item structure
interface ContentItem {
  type: string;
  text: string;
}

describe('CoinGecko Server', () => {
  describe('createCoinGeckoServer', () => {
    it('should create a server with default options', () => {
      const server = createCoinGeckoServer();
      expect(server).toBeDefined();
      expect(server).toHaveProperty('resource');
      expect(server).toHaveProperty('tool');
      expect(server).toHaveProperty('prompt');
    });

    it('should accept custom options', () => {
      const options: CoinGeckoServerOptions = {
        name: 'custom-coingecko-server',
        version: '2.0.0',
        includeAllTools: false,
        includeBasicTools: true,
        includeAdvancedTools: false,
      };

      const server = createCoinGeckoServer(options);
      expect(server).toBeDefined();
    });

    it('should register resources and tools', () => {
      const server = createCoinGeckoServer();

      // The server object should have resource and tool methods
      expect(typeof server.resource).toBe('function');
      expect(typeof server.tool).toBe('function');

      // Check for server property which gives access to the underlying Server instance
      expect(server).toHaveProperty('server');
      // Check that the server has the required methods
      expect(typeof server.close).toBe('function');
      expect(typeof server.connect).toBe('function');
    });
  });
});

// Get the directory name of the current module for resolving server path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('CoinGecko MCP - Client-Server Interaction (Stdio)', () => {
  let client: Client | null = null;
  let transport: StdioClientTransport | null = null;
  const connectionTimeout = 15000; // 15 seconds, CoinGecko API can be slow

  beforeAll(async () => {
    // Point to the compiled server entry point
    // Assumes the server file compiles to dist/index.js and has a runServer() or similar auto-start
    const serverPath = path.resolve(__dirname, '../../dist/index.js');

    console.log(`Attempting to start server at: ${serverPath}`);

    transport = new StdioClientTransport({
      command: 'node',
      args: [serverPath],
      // Important: Ensure environment variables (like COINGECKO_API_KEY from .env)
      // are passed to the child process if needed for API calls.
      // Jest setup often handles loading .env, but passing explicitly might be needed
      // depending on your setup. For now, assume Jest setup handles it.
      // env: { ...process.env },
    });

    client = new Client({
      name: 'coingecko-test-client',
      version: '1.0.0',
    });

    console.log('Connecting client...');
    try {
      await Promise.race([
        client.connect(transport),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Client connection timed out after ${connectionTimeout}ms`)),
            connectionTimeout,
          ),
        ),
      ]);
      console.log('Client connected successfully.');
    } catch (error) {
      console.error('Client connection failed:', error);
      // No disconnect needed for StdioClientTransport; process termination handles cleanup
      transport = null;
      client = null;
      throw error; // Re-throw to fail the test setup
    }
  }, connectionTimeout + 2000); // Extend Jest timeout for beforeAll

  afterAll(async () => {
    console.log('Disconnecting client and transport...');
    // Client doesn't have disconnect, transport handles process termination
    // No disconnect needed for StdioClientTransport
    client = null;
    transport = null;
    console.log('Client and transport disconnected.');
  });

  it(
    'should get detailed token info using coingecko-get-price',
    async () => {
      expect(client).not.toBeNull();
      if (!client) throw new Error('Client not initialized');

      const tokenId = 'uniswap'; // Use a well-known token
      console.log(`Calling coingecko-get-price for ${tokenId}...`);

      const result = await client.callTool({
        name: 'coingecko-get-price',
        arguments: {
          tokenId: tokenId,
        },
      });

      console.log('Received result:', JSON.stringify(result, null, 2));

      // 1. Check for MCP-level errors
      if (result.isError === true) {
        const errorDetails =
          Array.isArray(result.content) && (result.content[0] as ContentItem)?.type === 'text'
            ? (result.content[0] as ContentItem).text
            : JSON.stringify(result.content);
        throw new Error(`coingecko-get-price MCP call failed with error: ${errorDetails}`);
      }

      // 2. Basic response structure validation
      expect(Array.isArray(result.content)).toBe(true);
      // Assert content is an array before accessing it
      const contentArray = result.content as unknown[];
      expect(contentArray.length).toBeGreaterThan(0);
      const firstContent = contentArray[0] as { type?: string; text?: string };
      expect(firstContent?.type).toBe('text');
      expect(typeof firstContent?.text).toBe('string');

      // 3. Parse the JSON content
      let tokenInfo: DetailedTokenInfo | null = null;
      try {
        tokenInfo = JSON.parse(firstContent.text || '{}');
      } catch (e) {
        throw new Error('Failed to parse coingecko-get-price response text as JSON');
      }

      // 4. Validate the DetailedTokenInfo structure
      expect(tokenInfo).not.toBeNull();
      expect(tokenInfo).toHaveProperty('id', tokenId);
      expect(tokenInfo).toHaveProperty('symbol');
      expect(tokenInfo).toHaveProperty('name');
      expect(tokenInfo).toHaveProperty('currency', 'usd'); // Default currency
      expect(tokenInfo).toHaveProperty('price');
      expect(typeof tokenInfo?.price).toBe('number');
      expect(tokenInfo).toHaveProperty('last_updated');
      expect(typeof tokenInfo?.last_updated).toBe('string');
      // Check a few market data points that should exist
      expect(tokenInfo).toHaveProperty('price_change_percentage_24h');
      expect(tokenInfo).toHaveProperty('market_cap_change_percentage_24h');
      // Platform check is optional, bitcoin doesn't have one
      // expect(tokenInfo).toHaveProperty("platform");
      // expect(tokenInfo).toHaveProperty("contractAddress");
    },
    connectionTimeout,
  ); // Extend timeout for this specific test
});
