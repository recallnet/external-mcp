import { Scraper, SearchMode } from "agent-twitter-client";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Augment the Scraper type to include missing methods used in this module
interface ExtendedScraper extends Scraper {
  grokChat(options: { messages: GrokMessage[] }): Promise<GrokChatResponse>;
  getArticle(articleId: string): Promise<any>;
  getAllQuotedTweets(
    tweetId: string,
    maxTweetsPerPage?: number,
  ): Promise<any[]>;
  getRetweetersOfTweet(tweetId: string): Promise<any[]>;
}

// Define the TwitterUser interface for user-related functions
export interface TwitterUser {
  id?: string;
  username: string;
  displayname?: string;
  description?: string;
  verified?: boolean;
  followersCount?: number;
  followingCount?: number;
  statusesCount?: number;
  profileImageUrl?: string;
  protected?: boolean;
  [key: string]: any; // For any additional properties returned by the API
}

// Define interfaces for Twitter API responses
// Define the GrokMessage type
export type GrokRole = "user" | "assistant";
export interface GrokMessage {
  role: GrokRole;
  content: string;
}

// Define the GrokChatResponse type
export interface GrokChatResponse {
  conversationId: string;
  message: string;
  messages: GrokMessage[];
  webResults?: any[];
  metadata?: any;
  rateLimit?: any;
}

// Define the DirectMessagesResponse type
export interface TwitterDirectMessagesResponse {
  conversations: any[];
  users: any;
  userId: string;
}

// Define the SendDirectMessageResponse type
export interface TwitterSendDirectMessageResponse {
  message_create: any;
}

/**
 * Twitter client feature flags
 */
export interface TwitterFeatures {
  /** Basic authentication available (username/password) */
  basicAuth: boolean;
  /** Email authentication available */
  emailAuth: boolean;
  /** API key authentication available */
  apiAuth: boolean;
  /** Full authentication (basic + email) available */
  fullAuth: boolean;
  /** Grok chat access available */
  grokAccess: boolean;
}

// Define the required environment variables for different Twitter functionalities
const CREDENTIALS = {
  basic: ["TWITTER_USERNAME", "TWITTER_PASSWORD"],
  email: ["TWITTER_EMAIL"],
  api: [
    "TWITTER_APP_KEY",
    "TWITTER_APP_SECRET",
    "TWITTER_ACCESS_TOKEN",
    "TWITTER_ACCESS_SECRET",
  ],
};

// Check if a set of environment variables are available
function checkEnvVars(vars: string[]): boolean {
  return vars.every(
    (variable) =>
      !!process.env[variable] && process.env[variable]!.trim() !== "",
  );
}

/**
 * Check which Twitter functionalities are available based on environment variables
 * @returns Object containing availability flags for different Twitter features
 */
export function getAvailableFeatures(): TwitterFeatures {
  const features = {
    basicAuth: checkEnvVars(CREDENTIALS.basic),
    emailAuth: checkEnvVars(CREDENTIALS.email),
    apiAuth: checkEnvVars(CREDENTIALS.api),
    fullAuth: checkEnvVars([...CREDENTIALS.basic, ...CREDENTIALS.email]),
    grokAccess: checkEnvVars([...CREDENTIALS.basic, ...CREDENTIALS.email]), // Grok requires full authentication
  };

  // Ensure valid JSON by stringifying and parsing
  try {
    // This will throw an error if the object can't be properly serialized
    JSON.parse(JSON.stringify(features));
    return features;
  } catch (error) {
    console.error("Error formatting features as JSON:", error);
    // Return a safe fallback
    return {
      basicAuth: false,
      emailAuth: false,
      apiAuth: false,
      fullAuth: false,
      grokAccess: false,
    };
  }
}

/**
 * Create and initialize a Twitter scraper instance
 * @returns Initialized Twitter scraper or null if initialization fails
 */
export async function createTwitterClient(): Promise<ExtendedScraper | null> {
  const features = getAvailableFeatures();

  if (!features.basicAuth) {
    console.warn(
      "Twitter client not initialized: Missing basic authentication credentials",
    );
    return null;
  }

  try {
    const scraper = new Scraper();

    // Initialize with credentials if available
    if (features.apiAuth) {
      console.log("Initializing Twitter client with API credentials");
      // Note: setApiCredentials might not be available in the current version
      // This is a fallback in case the API changes
      const scraperAny = scraper as any;
      if (typeof scraperAny.setApiCredentials === "function") {
        scraperAny.setApiCredentials(
          process.env.TWITTER_APP_KEY!,
          process.env.TWITTER_APP_SECRET!,
          process.env.TWITTER_ACCESS_TOKEN!,
          process.env.TWITTER_ACCESS_SECRET!,
        );
      }
    }

    // Login if credentials are available
    if (features.basicAuth) {
      console.log("Logging in to Twitter...");
      await scraper.login(
        process.env.TWITTER_USERNAME!,
        process.env.TWITTER_PASSWORD!,
        features.emailAuth ? process.env.TWITTER_EMAIL : undefined,
      );

      const isLoggedIn = await scraper.isLoggedIn();
      if (isLoggedIn) {
        console.log("Successfully logged in to Twitter");
      } else {
        console.error("Failed to log in to Twitter");
        return null;
      }
    }

    return scraper as ExtendedScraper;
  } catch (error) {
    console.error("Error initializing Twitter client:", error);
    return null;
  }
}

/**
 * Helper function to safely execute Twitter API calls
 * @param callback Function to execute with the Twitter scraper
 * @param defaultValue Default value to return if the call fails
 * @returns Result of the callback or the default value if the call fails
 */
export async function safeTwitterCall<T>(
  callback: (scraper: ExtendedScraper) => Promise<T>,
  defaultValue: T,
): Promise<T> {
  try {
    const scraper = await createTwitterClient();
    if (!scraper) {
      return defaultValue;
    }

    const result = await callback(scraper);
    return result;
  } catch (error) {
    console.error("Error executing Twitter API call:", error);
    return defaultValue;
  }
}

/**
 * Get tweets from a user
 * @param username Twitter username
 * @param count Number of tweets to retrieve
 * @returns Array of tweets
 */
export async function getTweets(username: string, count: number = 10) {
  return safeTwitterCall(async (scraper) => {
    const tweets = await scraper.getTweets(username, count);
    // Convert AsyncGenerator to array
    const result = [];
    for await (const tweet of tweets) {
      result.push(tweet);
    }
    return result;
  }, []);
}

/**
 * Get a user's profile
 * @param username Twitter username
 * @returns User profile or null if not found
 */
export async function getProfile(username: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getProfile(username),
    null,
  );
}

/**
 * Get current Twitter trends
 * @returns Array of trending topics
 */
export async function getTrends() {
  return safeTwitterCall(async (scraper) => await scraper.getTrends(), []);
}

/**
 * Search for tweets containing a specific query
 * @param query Search query
 * @param count Number of tweets to retrieve
 * @param mode Search mode (Latest, Top, Photos, Videos)
 * @returns Array of matching tweets
 */
export async function searchTweets(
  query: string,
  count: number = 20,
  mode: SearchMode = SearchMode.Latest,
) {
  return safeTwitterCall(async (scraper) => {
    const tweets = await scraper.searchTweets(query, count, mode);
    // Convert AsyncGenerator to array
    const result = [];
    for await (const tweet of tweets) {
      result.push(tweet);
    }
    return result;
  }, []);
}

/**
 * Post a new tweet
 * @param text Tweet text
 * @returns Result of the operation
 */
export async function sendTweet(text: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.sendTweet(text),
    null,
  );
}

/**
 * Like a tweet
 * @param tweetId ID of the tweet to like
 * @returns Result of the operation
 */
export async function likeTweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.likeTweet(tweetId),
    null,
  );
}

/**
 * Retweet a tweet
 * @param tweetId ID of the tweet to retweet
 * @returns Result of the operation
 */
export async function retweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.retweet(tweetId),
    null,
  );
}

/**
 * Send a message to Grok and get a response
 * @param messages Array of messages in the conversation
 * @returns Grok chat response
 */
export async function grokChat(messages: { role: string; content: string }[]) {
  return safeTwitterCall(
    async (scraper) => {
      const features = getAvailableFeatures();
      if (!features.grokAccess) {
        throw new Error("Grok access requires full Twitter authentication");
      }

      // Convert messages to the correct format
      const grokMessages = messages.map((msg) => ({
        role: msg.role as GrokRole,
        content: msg.content,
      }));

      return await scraper.grokChat({ messages: grokMessages });
    },
    {
      conversationId: "",
      message: "Grok access not available",
      messages: [],
    } as GrokChatResponse,
  );
}

/**
 * Search for Twitter profiles
 * @param query Search query
 * @param count Number of profiles to retrieve
 * @returns Array of matching profiles
 */
export async function searchProfiles(
  query: string,
  count: number = 10,
): Promise<TwitterUser[]> {
  return safeTwitterCall(async (scraper) => {
    const profiles = await scraper.searchProfiles(query, count);
    // Convert AsyncGenerator to array
    const result: TwitterUser[] = [];
    for await (const profile of profiles) {
      result.push(profile as unknown as TwitterUser);
    }
    return result;
  }, [] as TwitterUser[]);
}

/**
 * Get a user's numeric ID from their username
 * @param screenName Twitter username
 * @returns User ID or null if not found
 */
export async function getUserIdByScreenName(screenName: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getUserIdByScreenName(screenName),
    null,
  );
}

/**
 * Get a user's username from their numeric ID
 * @param userId Twitter user ID
 * @returns Username or null if not found
 */
export async function getScreenNameByUserId(userId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getScreenNameByUserId(userId),
    null,
  );
}

/**
 * Get a user's followers
 * @param userId Twitter user ID
 * @param count Number of followers to retrieve
 * @returns Array of followers
 */
export async function getFollowers(
  userId: string,
  count: number = 20,
): Promise<TwitterUser[]> {
  return safeTwitterCall(async (scraper) => {
    const followers = await scraper.getFollowers(userId, count);
    // Convert AsyncGenerator to array
    const result: TwitterUser[] = [];
    for await (const follower of followers) {
      result.push(follower as unknown as TwitterUser);
    }
    return result;
  }, [] as TwitterUser[]);
}

/**
 * Get users that a user is following
 * @param userId Twitter user ID
 * @param count Number of following to retrieve
 * @returns Array of users being followed
 */
export async function getFollowing(
  userId: string,
  count: number = 20,
): Promise<TwitterUser[]> {
  return safeTwitterCall(async (scraper) => {
    const following = await scraper.getFollowing(userId, count);
    // Convert AsyncGenerator to array
    const result: TwitterUser[] = [];
    for await (const user of following) {
      result.push(user as unknown as TwitterUser);
    }
    return result;
  }, [] as TwitterUser[]);
}

/**
 * Get the authenticated user's home timeline
 * @param count Number of tweets to retrieve
 * @param seenTweetIds IDs of tweets already seen (for pagination)
 * @returns Array of timeline tweets
 */
export async function fetchHomeTimeline(
  count: number = 20,
  seenTweetIds: string[] = [],
) {
  return safeTwitterCall(
    async (scraper) => await scraper.fetchHomeTimeline(count, seenTweetIds),
    [],
  );
}

/**
 * Get tweets from accounts the authenticated user follows
 * @param count Number of tweets to retrieve
 * @param seenTweetIds IDs of tweets already seen (for pagination)
 * @returns Array of following timeline tweets
 */
export async function fetchFollowingTimeline(
  count: number = 20,
  seenTweetIds: string[] = [],
) {
  return safeTwitterCall(
    async (scraper) =>
      await scraper.fetchFollowingTimeline(count, seenTweetIds),
    [],
  );
}

/**
 * Get a user's tweets and replies
 * @param username Twitter username
 * @param count Number of tweets to retrieve
 * @returns Array of tweets and replies
 */
export async function getTweetsAndReplies(
  username: string,
  count: number = 20,
) {
  return safeTwitterCall(async (scraper) => {
    try {
      const tweets = await scraper.getTweetsAndReplies(username, count);
      // Convert AsyncGenerator to array
      const result = [];
      for await (const tweet of tweets) {
        result.push(tweet);
      }
      return result;
    } catch (error) {
      console.error("Error getting tweets and replies:", error);
      return [];
    }
  }, []);
}

/**
 * Get tweets by user ID
 * @param userId Twitter user ID
 * @param count Number of tweets to retrieve
 * @returns Array of tweets
 */
export async function getTweetsByUserId(userId: string, count: number = 20) {
  return safeTwitterCall(async (scraper) => {
    const tweets = await scraper.getTweetsByUserId(userId, count);
    // Convert AsyncGenerator to array
    const result = [];
    for await (const tweet of tweets) {
      result.push(tweet);
    }
    return result;
  }, []);
}

/**
 * Get a user's latest tweet
 * @param username Twitter username
 * @param includeRetweets Whether to include retweets
 * @returns Latest tweet or null if not found
 */
export async function getLatestTweet(
  username: string,
  includeRetweets: boolean = false,
) {
  return safeTwitterCall(async (scraper) => {
    const tweets = await scraper.getTweets(username, 1);
    for await (const tweet of tweets) {
      return tweet; // Return the first tweet
    }
    return null;
  }, null);
}

/**
 * Get a specific tweet by ID
 * @param tweetId Tweet ID
 * @returns Tweet or null if not found
 */
export async function getTweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getTweet(tweetId),
    null,
  );
}

/**
 * Follow a user
 * @param username Twitter username
 * @returns Result of the operation
 */
export async function followUser(username: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.followUser(username),
    null,
  );
}

/**
 * Get direct message conversations
 * @param userId User ID to get conversations for
 * @param cursor Pagination cursor
 * @returns Direct message conversations
 */
export async function getDirectMessageConversations(
  userId: string,
  cursor?: string,
): Promise<TwitterDirectMessagesResponse> {
  return safeTwitterCall(
    async (scraper) =>
      await scraper.getDirectMessageConversations(userId, cursor),
    { conversations: [], users: {}, userId } as TwitterDirectMessagesResponse,
  );
}

/**
 * Send a direct message
 * @param conversationId Conversation ID
 * @param text Message text
 * @returns Result of the operation
 */
export async function sendDirectMessage(
  conversationId: string,
  text: string,
): Promise<any> {
  return safeTwitterCall(
    async (scraper) => await scraper.sendDirectMessage(conversationId, text),
    null,
  );
}

/**
 * Get a Twitter article
 * @param articleId Article ID
 * @returns Article or null if not found
 */
export async function getArticle(articleId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getArticle(articleId),
    null,
  );
}

/**
 * Get tweets that quote a specific tweet
 * @param tweetId Tweet ID
 * @param maxTweetsPerPage Maximum number of tweets per page
 * @returns Array of quoted tweets
 */
export async function getAllQuotedTweets(
  tweetId: string,
  maxTweetsPerPage: number = 20,
) {
  return safeTwitterCall(
    async (scraper) =>
      await scraper.getAllQuotedTweets(tweetId, maxTweetsPerPage),
    [],
  );
}

/**
 * Get users who retweeted a tweet
 * @param tweetId Tweet ID
 * @returns Array of retweeters
 */
export async function getRetweetersOfTweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getRetweetersOfTweet(tweetId),
    [],
  );
}

/**
 * Get tweets from a Twitter list
 * @param listId List ID
 * @param count Number of tweets to retrieve
 * @returns Array of tweets from the list
 */
export async function getListTweets(listId: string, count: number = 50) {
  return safeTwitterCall(async (scraper) => {
    const tweets = await scraper.getTweets(listId, count);
    // Convert AsyncGenerator to array
    const result = [];
    for await (const tweet of tweets) {
      result.push(tweet);
    }
    return result;
  }, []);
}
