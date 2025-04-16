import axios from "axios";
import * as dotenv from "dotenv";
// Load environment variables
dotenv.config();
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
export function getAvailableFeatures() {
    const apiKey = process.env.COINGECKO_API_KEY;
    return {
        apiAccess: true, // Free API is always available
        proAccess: !!apiKey,
    };
}
/**
 * Gets the current price for a token
 * @param tokenId The CoinGecko token ID (e.g., 'bitcoin')
 * @param currency The currency to get the price in (default: 'usd')
 * @returns Token price information or null if not found
 */
export async function getTokenPrice(tokenId, currency = "usd") {
    try {
        const config = getApiConfig();
        const response = await axios.get(`${config.baseURL}/simple/price`, {
            headers: config.headers,
            params: {
                ids: tokenId,
                vs_currencies: currency,
                include_last_updated_at: true,
            },
        });
        if (response.data[tokenId]) {
            return {
                id: tokenId,
                symbol: tokenId, // Basic info only from this endpoint
                name: tokenId,
                current_price: response.data[tokenId][currency],
                last_updated: new Date(response.data[tokenId].last_updated_at * 1000).toISOString(),
            };
        }
        return null;
    }
    catch (error) {
        console.error(`Error fetching price for ${tokenId}:`, error);
        return null;
    }
}
/**
 * Gets the contract addresses and chains for a token
 * @param tokenId The CoinGecko token ID
 * @returns Token contract information or null if not found
 */
export async function getTokenContracts(tokenId) {
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
    }
    catch (error) {
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
export async function searchTokens(query, limit = 10) {
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
        return response.data.coins.slice(0, validLimit).map((coin) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            market_cap_rank: coin.market_cap_rank,
        }));
    }
    catch (error) {
        console.error(`Error searching for ${query}:`, error);
        return [];
    }
}
/**
 * Gets trending tokens
 * @param limit Maximum number of results (default: 10)
 * @returns Array of trending tokens
 */
export async function getTrendingTokens(limit = 10) {
    try {
        const config = getApiConfig();
        const response = await axios.get(`${config.baseURL}/search/trending`, {
            headers: config.headers,
        });
        // Ensure limit is within bounds
        const validLimit = Math.min(Math.max(1, limit), 10);
        return response.data.coins.slice(0, validLimit).map(({ item }) => ({
            id: item.id,
            name: item.name,
            symbol: item.symbol.toUpperCase(),
            market_cap_rank: item.market_cap_rank,
        }));
    }
    catch (error) {
        console.error("Error fetching trending tokens:", error);
        return [];
    }
}
