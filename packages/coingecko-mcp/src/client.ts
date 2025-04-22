import axios from "axios";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Types
export interface CoinGeckoFeatures {
  /** Whether the CoinGecko API is available */
  apiAccess: boolean;
  /** Whether Pro API features are available */
  proAccess: boolean;
}

export interface TokenContract {
  id: string;
  symbol: string;
  name: string;
  platforms: Record<string, string>; // chain -> contract address
}

export interface SearchResult {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number;
}

export interface TrendingResult {
  coins: Array<{
    item: {
      id: string;
      name: string;
      symbol: string;
      market_cap_rank: number;
      score: number;
    };
  }>;
}

// Define DetailedTokenInfo interface here or import if separate
export interface DetailedTokenInfo {
  id: string; // CoinGecko ID (e.g., 'bitcoin')
  symbol: string; // Token symbol (e.g., 'btc')
  name: string; // Token name (e.g., 'Bitcoin')

  // Changed: Include all platforms and their addresses
  platforms?: Record<string, string>; // Map platform ID (e.g., 'ethereum') to contract address

  // Market Data (against the specified currency)
  currency: string; // The currency for market data (e.g., 'usd')
  price?: number;
  last_updated?: string; // ISO 8601 format timestamp

  price_change_percentage_24h?: number;
  price_change_percentage_7d?: number;
  price_change_percentage_14d?: number;
  price_change_percentage_30d?: number;
  price_change_percentage_60d?: number;
  price_change_percentage_200d?: number;
  price_change_percentage_1y?: number;

  market_cap_change_percentage_24h?: number;

  // Add other relevant fields from market_data as needed
  // market_cap?: number;
  // total_volume?: number;
  // market_cap_rank?: number;
}

const BASE_URL = "https://api.coingecko.com/api/v3";
const PRO_URL = "https://pro-api.coingecko.com/api/v3";

/**
 * Gets the API URL and headers based on whether an API key is provided
 * @returns Configuration object with baseURL and headers
 */
function getApiConfig() {
  const apiKey = process.env.COINGECKO_API_KEY;
  if (apiKey) {
    return {
      baseURL: PRO_URL,
      headers: {
        "x-cg-pro-api-key": apiKey,
      },
    };
  }
  return {
    baseURL: BASE_URL,
    headers: {},
  };
}

/**
 * Checks what CoinGecko API features are available based on environment variables
 * @returns Object with flags indicating available features
 */
export function getAvailableFeatures(): CoinGeckoFeatures {
  const apiKey = process.env.COINGECKO_API_KEY;
  return {
    apiAccess: true, // Free API is always available
    proAccess: !!apiKey,
  };
}

/**
 * Fetches detailed token information, including price, market data, and platform/contract details.
 * Uses the CoinGecko /coins/{id} endpoint.
 *
 * @param tokenId The CoinGecko ID of the token (e.g., 'bitcoin', 'uniswap').
 * @param currency The currency to get market data against (default: 'usd').
 * @returns Detailed token information or null if an error occurs.
 */
export async function getTokenPrice(
  tokenId: string,
  currency: string = "usd",
): Promise<DetailedTokenInfo | null> {
  try {
    const config = getApiConfig(); // Assumes this provides baseURL and headers
    const response = await axios.get(
      `${config.baseURL}/coins/${tokenId}`,
      {
        headers: config.headers,
        // Parameters to optimize the response size (optional, defaults might be okay)
        params: {
          localization: 'false', // Don't need localized descriptions
          tickers: 'false',      // Don't need full ticker list here
          market_data: 'true',   // Need market data
          community_data: 'false',// Don't need community data
          developer_data: 'false',// Don't need developer data
          sparkline: 'false',    // Don't need sparkline
        },
      }
    );

    const data = response.data;
    if (!data || !data.market_data) {
      console.error(`Incomplete data received for ${tokenId}`);
      return null;
    }

    // --- Platform Logic (Simpler) ---
    let validPlatforms: Record<string, string> | undefined = undefined;
    const platformsData = data.platforms;

    if (platformsData && typeof platformsData === 'object') {
      const collectedPlatforms: Record<string, string> = {};
      for (const platformId in platformsData) {
        // Ensure the address is a non-empty string before including it
        if (Object.prototype.hasOwnProperty.call(platformsData, platformId) &&
            typeof platformsData[platformId] === 'string' &&
            platformsData[platformId].length > 0) {
          collectedPlatforms[platformId] = platformsData[platformId];
        }
      }
      // Only assign if we collected at least one valid platform
      if (Object.keys(collectedPlatforms).length > 0) {
        validPlatforms = collectedPlatforms;
      }
    }
    // --- End Platform Logic ---

    // --- Data Extraction ---
    const marketData = data.market_data;
    const price = marketData.current_price?.[currency.toLowerCase()];
    const lastUpdated = marketData.last_updated;

    const detailedInfo: DetailedTokenInfo = {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      platforms: validPlatforms, // Assign the collected platforms object
      currency: currency,
      price: typeof price === 'number' ? price : undefined,
      last_updated: lastUpdated ? new Date(lastUpdated).toISOString() : undefined,

      // Extract other market data fields safely
      price_change_percentage_24h: marketData.price_change_percentage_24h_in_currency?.[currency.toLowerCase()],
      price_change_percentage_7d: marketData.price_change_percentage_7d_in_currency?.[currency.toLowerCase()],
      price_change_percentage_14d: marketData.price_change_percentage_14d_in_currency?.[currency.toLowerCase()],
      price_change_percentage_30d: marketData.price_change_percentage_30d_in_currency?.[currency.toLowerCase()],
      price_change_percentage_60d: marketData.price_change_percentage_60d_in_currency?.[currency.toLowerCase()],
      price_change_percentage_200d: marketData.price_change_percentage_200d_in_currency?.[currency.toLowerCase()],
      price_change_percentage_1y: marketData.price_change_percentage_1y_in_currency?.[currency.toLowerCase()],

      market_cap_change_percentage_24h: marketData.market_cap_change_percentage_24h_in_currency?.[currency.toLowerCase()],
    };
    // --- End Data Extraction ---

    return detailedInfo;

  } catch (error: any) {
    // Log more specific error if available
    const errorMessage = error.response?.data?.error || error.message || error;
    console.error(`Error fetching detailed data for ${tokenId}:`, errorMessage);
    return null;
  }
}

/**
 * Gets the contract addresses and chains for a token
 * @param tokenId The CoinGecko token ID
 * @returns Token contract information or null if not found
 */
export async function getTokenContracts(
  tokenId: string,
): Promise<TokenContract | null> {
  try {
    const config = getApiConfig();
    const response = await axios.get(`${config.baseURL}/coins/${tokenId}`, {
      headers: config.headers,
      params: {
        localization: false,
        tickers: false,
        market_data: false,
        community_data: false,
        developer_data: false,
        sparkline: false,
      },
    });

    return {
      id: response.data.id,
      symbol: response.data.symbol,
      name: response.data.name,
      platforms: response.data.platforms,
    };
  } catch (error) {
    console.error(`Error fetching contracts for ${tokenId}:`, error);
    return null;
  }
}

/**
 * Searches for tokens by query
 * @param query The search query
 * @param limit Maximum number of results (default: 10, max: 100)
 * @returns Array of search results
 */
export async function searchTokens(
  query: string,
  limit: number = 10,
): Promise<SearchResult[]> {
  try {
    const config = getApiConfig();
    const response = await axios.get(`${config.baseURL}/search`, {
      headers: config.headers,
      params: {
        query,
      },
    });

    // Ensure limit is within bounds
    const validLimit = Math.min(Math.max(1, limit), 100);

    return response.data.coins.slice(0, validLimit).map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      market_cap_rank: coin.market_cap_rank,
    }));
  } catch (error) {
    console.error(`Error searching for ${query}:`, error);
    return [];
  }
}

/**
 * Gets trending tokens
 * @param limit Maximum number of results (default: 10)
 * @returns Array of trending tokens
 */
export async function getTrendingTokens(
  limit: number = 10,
): Promise<SearchResult[]> {
  try {
    const config = getApiConfig();
    const response = await axios.get<TrendingResult>(
      `${config.baseURL}/search/trending`,
      {
        headers: config.headers,
      },
    );

    // Ensure limit is within bounds
    const validLimit = Math.min(Math.max(1, limit), 10);

    return response.data.coins.slice(0, validLimit).map(({ item }) => ({
      id: item.id,
      name: item.name,
      symbol: item.symbol.toUpperCase(),
      market_cap_rank: item.market_cap_rank,
    }));
  } catch (error) {
    console.error("Error fetching trending tokens:", error);
    return [];
  }
}
