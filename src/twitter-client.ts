import { Scraper, SearchMode } from 'agent-twitter-client';
import { logger, getCredentials } from './env.js';

// Define interfaces for Twitter API responses
type GrokRole = 'user' | 'assistant';
interface GrokMessage {
  role: GrokRole;
  content: string;
}

interface GrokChatResponse {
  conversationId: string;
  message: string;
  messages: GrokMessage[];
  webResults?: any[];
  metadata?: any;
  rateLimit?: any;
}

// Check which optional features are available
export function getAvailableFeatures(): { [key: string]: boolean } {
  const features = {
    basicAuth: true, // Always true since env.ts enforces TWITTER_USERNAME, PASSWORD, EMAIL
    emailAuth: true, // Always true since email is required
  };

  try {
    JSON.parse(JSON.stringify(features)); // Ensure valid JSON
    return features;
  } catch (error) {
    logger.error(`Error formatting features as JSON: ${error instanceof Error ? error.message : String(error)}`);
    return {
      basicAuth: true,
      emailAuth: true,
      coinGeckoAccess: false,
    };
  }
}

// Create and initialize a Twitter scraper instance
export async function createTwitterClient(): Promise<Scraper | null> {
  try {
    const credentials = getCredentials(); // Fetch credentials from secretBuffer
    const scraper = new Scraper();

    logger.info('Logging in to Twitter...');
    await scraper.login(
      credentials.username,
      credentials.password,
      credentials.email
    );

    const isLoggedIn = await scraper.isLoggedIn();
    if (isLoggedIn) {
      logger.info('Successfully logged in to Twitter');
    } else {
      logger.error('Failed to log in to Twitter');
      return null;
    }

    return scraper;
  } catch (error) {
    logger.error(`Error initializing Twitter client: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// Helper function to safely execute Twitter API calls
export async function safeTwitterCall<T>(
  callback: (scraper: Scraper) => Promise<T>,
  defaultValue: T
): Promise<T> {
  try {
    const scraper = await createTwitterClient();
    if (!scraper) {
      logger.warn('Twitter scraper not available');
      return defaultValue;
    }

    const result = await callback(scraper);
    return result;
  } catch (error) {
    logger.error(`Error executing Twitter API call: ${error instanceof Error ? error.message : String(error)}`);
    return defaultValue;
  }
}

// Export Twitter functionality as individual functions
export async function getTweets(username: string, count: number = 10) {
  return safeTwitterCall(
    async (scraper) => {
      const tweets = await scraper.getTweets(username, count);
      const result = [];
      for await (const tweet of tweets) {
        result.push(tweet);
      }
      return result;
    },
    []
  );
}

export async function getProfile(username: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getProfile(username),
    null
  );
}

export async function getUserBio(username: string): Promise<string | null> {
  return safeTwitterCall(
    async (scraper) => {
      const user = await scraper.getProfile(username);
      return user.biography;
    },
    null
  );
}

export async function getTrends() {
  return safeTwitterCall(
    async (scraper) => await scraper.getTrends(),
    []
  );
}

export async function searchTweets(query: string, count: number = 20, mode: SearchMode = SearchMode.Latest) {
  return safeTwitterCall(
    async (scraper) => {
      const tweets = await scraper.searchTweets(query, count, mode);
      const result = [];
      for await (const tweet of tweets) {
        result.push(tweet);
      }
      return result;
    },
    []
  );
}

export async function sendTweet(text: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.sendTweet(text),
    null
  );
}

export async function likeTweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.likeTweet(tweetId),
    null
  );
}

export async function retweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.retweet(tweetId),
    null
  );
}

export async function grokChat(messages: { role: string, content: string }[]) {
  return safeTwitterCall(
    async (scraper) => {
      const grokMessages = messages.map(msg => ({
        role: msg.role as GrokRole,
        content: msg.content
      }));
      return await scraper.grokChat({ messages: grokMessages });
    },
    {
      conversationId: '',
      message: 'Grok access not available',
      messages: []
    } as GrokChatResponse
  );
}

export async function searchProfiles(query: string, count: number = 10) {
  return safeTwitterCall(
    async (scraper) => {
      const profiles = await scraper.searchProfiles(query, count);
      const result = [];
      for await (const profile of profiles) {
        result.push(profile);
      }
      return result;
    },
    []
  );
}

export async function getUserIdByScreenName(screenName: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getUserIdByScreenName(screenName),
    ''
  );
}

export async function getScreenNameByUserId(userId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getScreenNameByUserId(userId),
    ''
  );
}

export async function getFollowers(userId: string, count: number = 20) {
  return safeTwitterCall(
    async (scraper) => {
      const followers = await scraper.getFollowers(userId, count);
      const result = [];
      for await (const follower of followers) {
        result.push(follower);
      }
      return result;
    },
    []
  );
}

export async function getFollowing(userId: string, count: number = 20) {
  return safeTwitterCall(
    async (scraper) => {
      const following = await scraper.getFollowing(userId, count);
      const result = [];
      for await (const user of following) {
        result.push(user);
      }
      return result;
    },
    []
  );
}

export async function fetchHomeTimeline(count: number = 20, seenTweetIds: string[] = []) {
  return safeTwitterCall(
    async (scraper) => await scraper.fetchHomeTimeline(count, seenTweetIds),
    []
  );
}

export async function fetchFollowingTimeline(count: number = 20, seenTweetIds: string[] = []) {
  return safeTwitterCall(
    async (scraper) => await scraper.fetchFollowingTimeline(count, seenTweetIds),
    []
  );
}

export async function getTweetsAndReplies(username: string, count: number = 20) {
  return safeTwitterCall(
    async (scraper) => {
      const tweets = await scraper.getTweetsAndReplies(username, count);
      const result = [];
      for await (const tweet of tweets) {
        result.push(tweet);
      }
      return result;
    },
    []
  );
}

export async function getTweetsByUserId(userId: string, count: number = 20) {
  return safeTwitterCall(
    async (scraper) => {
      const tweets = await scraper.getTweetsByUserId(userId, count);
      const result = [];
      for await (const tweet of tweets) {
        result.push(tweet);
      }
      return result;
    },
    []
  );
}

export async function getLatestTweet(username: string, includeRetweets: boolean = false) {
  return safeTwitterCall(
    async (scraper) => await scraper.getLatestTweet(username, includeRetweets),
    null
  );
}

export async function getTweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getTweet(tweetId),
    null
  );
}

export async function followUser(username: string) {
  return safeTwitterCall(
    async (scraper) => {
      await scraper.followUser(username);
      return true;
    },
    false
  );
}

export async function getDirectMessageConversations(userId: string, cursor?: string): Promise<any> {
  return safeTwitterCall(
    async (scraper) => await scraper.getDirectMessageConversations(userId, cursor),
    { conversations: [], users: [], userId: '' }
  );
}

export async function sendDirectMessage(conversationId: string, text: string): Promise<any> {
  return safeTwitterCall(
    async (scraper) => await scraper.sendDirectMessage(conversationId, text),
    { entries: [], users: {} }
  );
}

export async function getArticle(articleId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getArticle(articleId),
    null
  );
}

export async function getAllQuotedTweets(tweetId: string, maxTweetsPerPage: number = 20) {
  return safeTwitterCall(
    async (scraper) => await scraper.getAllQuotedTweets(tweetId, maxTweetsPerPage),
    []
  );
}

export async function getRetweetersOfTweet(tweetId: string) {
  return safeTwitterCall(
    async (scraper) => await scraper.getRetweetersOfTweet(tweetId),
    []
  );
}

export async function getListTweets(listId: string, count: number = 50) {
  return safeTwitterCall(
    async (scraper) => {
      try {
        const tweets = await scraper.fetchListTweets(listId, count);
        if (tweets && Array.isArray(tweets)) {
          return tweets;
        } else if (tweets && tweets.tweets && Array.isArray(tweets.tweets)) {
          return tweets.tweets;
        } else {
          logger.error('Unexpected response format from fetchListTweets');
          return [];
        }
      } catch (error) {
        logger.error(`Error fetching list tweets: ${error instanceof Error ? error.message : String(error)}`);
        return [];
      }
    },
    []
  );
}