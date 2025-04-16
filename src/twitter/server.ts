import {
  McpServer,
  ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as twitterClient from "./client.js";
import { fileURLToPath } from "url";

/**
 * Configuration options for the Twitter server
 */
export interface TwitterServerOptions {
  /**
   * Server name (default: "twitter-mcp-server")
   */
  name?: string;

  /**
   * Server version (default: "1.0.0")
   */
  version?: string;

  /**
   * Whether to include all available tools
   * (default: true, set to false to selectively enable tools)
   */
  includeAllTools?: boolean;

  /**
   * Whether to include read-only tools (get profile, tweets, search)
   * Only relevant if includeAllTools is false
   */
  includeReadTools?: boolean;

  /**
   * Whether to include write tools (send tweet, like, follow)
   * Only relevant if includeAllTools is false
   */
  includeWriteTools?: boolean;

  /**
   * Whether to include Grok tools
   * Only relevant if includeAllTools is false
   */
  includeGrokTools?: boolean;
}

/**
 * Creates a Twitter MCP server with the specified options
 * @param options Server configuration options
 * @returns Configured MCP server instance
 */
export function createTwitterServer(
  options: TwitterServerOptions = {},
): McpServer {
  // Set default options
  const serverOptions = {
    name: options.name || "twitter-mcp-server",
    version: options.version || "1.0.0",
    includeAllTools: options.includeAllTools !== false, // Default to true
    includeReadTools: options.includeReadTools !== false, // Default to true
    includeWriteTools: options.includeWriteTools !== false, // Default to true if full auth available
    includeGrokTools: options.includeGrokTools !== false, // Default to true if Grok access available
  };

  // Get available Twitter features
  const twitterFeatures = twitterClient.getAvailableFeatures();

  // Create a new MCP server
  const server = new McpServer({
    name: serverOptions.name,
    version: serverOptions.version,
  });

  // Add Twitter resource for available features
  server.resource("twitter-features", "twitter://features", async (uri) => ({
    contents: [
      {
        uri: uri.href,
        text: JSON.stringify(twitterFeatures, null, 2),
      },
    ],
  }));

  // Add Twitter read-only tools if basic authentication is available
  if (
    twitterFeatures.basicAuth &&
    (serverOptions.includeAllTools || serverOptions.includeReadTools)
  ) {
    // Get user profile
    server.tool(
      "twitter-get-profile",
      "Gets public profile information for a Twitter user.",
      {
        username: z
          .string()
          .describe("Twitter username to get profile information for"),
      },
      async ({ username }) => {
        const profile = await twitterClient.getProfile(username);

        return {
          content: [
            {
              type: "text",
              text: profile
                ? JSON.stringify(profile, null, 2)
                : "Profile not found",
            },
          ],
        };
      },
    );

    // Get tweets
    server.tool(
      "twitter-get-tweets",
      "Gets recent tweets from a specific user (doesn't include replies).",
      {
        username: z.string().describe("Twitter username to get tweets from"),
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of tweets to retrieve (max 100)"),
      },
      async ({ username, count }) => {
        const tweets = await twitterClient.getTweets(username, count);

        return {
          content: [
            {
              type: "text",
              text:
                tweets.length > 0
                  ? JSON.stringify(tweets, null, 2)
                  : "No tweets found",
            },
          ],
        };
      },
    );

    // Get tweets and replies
    server.tool(
      "twitter-get-tweets-and-replies",
      "Gets recent tweets and replies from a specific user (includes conversations).",
      {
        username: z
          .string()
          .describe("Twitter username to get tweets and replies from"),
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of tweets to retrieve (max 100)"),
      },
      async ({ username, count }) => {
        const tweets = await twitterClient.getTweetsAndReplies(username, count);

        return {
          content: [
            {
              type: "text",
              text:
                tweets.length > 0
                  ? JSON.stringify(tweets, null, 2)
                  : "No tweets found",
            },
          ],
        };
      },
    );

    // Get latest tweet
    server.tool(
      "twitter-get-latest-tweet",
      "Gets only the most recent tweet from a user (optionally include retweets).",
      {
        username: z
          .string()
          .describe("Twitter username to get the latest tweet from"),
        includeRetweets: z
          .boolean()
          .default(false)
          .describe("Whether to include retweets"),
      },
      async ({ username, includeRetweets }) => {
        const tweet = await twitterClient.getLatestTweet(
          username,
          includeRetweets,
        );

        return {
          content: [
            {
              type: "text",
              text: tweet ? JSON.stringify(tweet, null, 2) : "No tweet found",
            },
          ],
        };
      },
    );

    // Get specific tweet
    server.tool(
      "twitter-get-tweet",
      "Gets a single tweet by its ID.",
      {
        tweetId: z.string().describe("ID of the tweet to retrieve"),
      },
      async ({ tweetId }) => {
        const tweet = await twitterClient.getTweet(tweetId);

        return {
          content: [
            {
              type: "text",
              text: tweet ? JSON.stringify(tweet, null, 2) : "Tweet not found",
            },
          ],
        };
      },
    );

    // Get trends
    server.tool(
      "twitter-get-trends",
      "Gets current trending topics on Twitter.",
      {},
      async () => {
        const trends = await twitterClient.getTrends();

        return {
          content: [
            {
              type: "text",
              text:
                trends.length > 0
                  ? JSON.stringify(trends, null, 2)
                  : "No trends found",
            },
          ],
        };
      },
    );

    // Search tweets
    server.tool(
      "twitter-search-tweets",
      "Searches for tweets containing specific keywords or matching search criteria.",
      {
        query: z.string().describe("Search query"),
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of tweets to retrieve (max 100)"),
      },
      async ({ query, count }) => {
        const tweets = await twitterClient.searchTweets(query, count);

        return {
          content: [
            {
              type: "text",
              text:
                tweets.length > 0
                  ? JSON.stringify(tweets, null, 2)
                  : "No tweets found",
            },
          ],
        };
      },
    );

    // Search profiles
    server.tool(
      "twitter-search-profiles",
      "Searches for Twitter user profiles matching the search query.",
      {
        query: z.string().describe("Search query"),
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of profiles to retrieve (max 100)"),
      },
      async ({ query, count }) => {
        const profiles = await twitterClient.searchProfiles(query, count);

        return {
          content: [
            {
              type: "text",
              text:
                profiles.length > 0
                  ? JSON.stringify(profiles, null, 2)
                  : "No profiles found",
            },
          ],
        };
      },
    );

    // Get user ID by screen name
    server.tool(
      "twitter-get-user-id",
      "Converts a Twitter username to its numeric user ID.",
      {
        username: z.string().describe("Twitter username to get ID for"),
      },
      async ({ username }) => {
        const userId = await twitterClient.getUserIdByScreenName(username);

        return {
          content: [
            {
              type: "text",
              text: userId ? userId : "User ID not found",
            },
          ],
        };
      },
    );

    // Get screen name by user ID
    server.tool(
      "twitter-get-username",
      "Converts a Twitter user ID to its username (screen name).",
      {
        userId: z.string().describe("Twitter user ID to get username for"),
      },
      async ({ userId }) => {
        const username = await twitterClient.getScreenNameByUserId(userId);

        return {
          content: [
            {
              type: "text",
              text: username ? username : "Username not found",
            },
          ],
        };
      },
    );

    // Get followers
    server.tool(
      "twitter-get-followers",
      "Gets users who follow a specific Twitter user.",
      {
        userId: z.string().describe("Twitter user ID to get followers for"),
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of followers to retrieve (max 100)"),
      },
      async ({ userId, count }) => {
        const followers = await twitterClient.getFollowers(userId, count);

        return {
          content: [
            {
              type: "text",
              text:
                followers.length > 0
                  ? JSON.stringify(followers, null, 2)
                  : "No followers found",
            },
          ],
        };
      },
    );

    // Get following
    server.tool(
      "twitter-get-following",
      "Gets users that a specific Twitter user follows.",
      {
        userId: z.string().describe("Twitter user ID to get following for"),
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of following to retrieve (max 100)"),
      },
      async ({ userId, count }) => {
        const following = await twitterClient.getFollowing(userId, count);

        return {
          content: [
            {
              type: "text",
              text:
                following.length > 0
                  ? JSON.stringify(following, null, 2)
                  : "No following found",
            },
          ],
        };
      },
    );

    // Get article
    server.tool(
      "twitter-get-article",
      "Gets an article published via Twitter.",
      {
        articleId: z.string().describe("ID of the article to retrieve"),
      },
      async ({ articleId }) => {
        const article = await twitterClient.getArticle(articleId);

        return {
          content: [
            {
              type: "text",
              text: article
                ? JSON.stringify(article, null, 2)
                : "Article not found",
            },
          ],
        };
      },
    );
  }

  // Add Twitter write tools if full authentication is available
  if (
    twitterFeatures.fullAuth &&
    (serverOptions.includeAllTools || serverOptions.includeWriteTools)
  ) {
    // Send tweet
    server.tool(
      "twitter-send-tweet",
      "Posts a new tweet to the authenticated user's account.",
      {
        text: z.string().max(280).describe("Tweet text (max 280 characters)"),
      },
      async ({ text }) => {
        const result = await twitterClient.sendTweet(text);

        return {
          content: [
            {
              type: "text",
              text: result ? "Tweet sent successfully" : "Failed to send tweet",
            },
          ],
        };
      },
    );

    // Like tweet
    server.tool(
      "twitter-like-tweet",
      "Likes a tweet as the authenticated user.",
      {
        tweetId: z.string().describe("ID of the tweet to like"),
      },
      async ({ tweetId }) => {
        const result = await twitterClient.likeTweet(tweetId);

        return {
          content: [
            {
              type: "text",
              text: result
                ? "Tweet liked successfully"
                : "Failed to like tweet",
            },
          ],
        };
      },
    );

    // Retweet
    server.tool(
      "twitter-retweet",
      "Retweets a tweet as the authenticated user.",
      {
        tweetId: z.string().describe("ID of the tweet to retweet"),
      },
      async ({ tweetId }) => {
        const result = await twitterClient.retweet(tweetId);

        return {
          content: [
            {
              type: "text",
              text: result ? "Retweeted successfully" : "Failed to retweet",
            },
          ],
        };
      },
    );

    // Follow user
    server.tool(
      "twitter-follow-user",
      "Follows a user as the authenticated user.",
      {
        username: z.string().describe("Username of the user to follow"),
      },
      async ({ username }) => {
        const result = await twitterClient.followUser(username);

        return {
          content: [
            {
              type: "text",
              text: result
                ? "User followed successfully"
                : "Failed to follow user",
            },
          ],
        };
      },
    );

    // Get home timeline
    server.tool(
      "twitter-get-home-timeline",
      "Gets the home timeline for the authenticated user.",
      {
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of tweets to retrieve (max 100)"),
        seenTweetIds: z
          .array(z.string())
          .optional()
          .describe("IDs of tweets already seen"),
      },
      async ({ count, seenTweetIds = [] }) => {
        const timeline = await twitterClient.fetchHomeTimeline(
          count,
          seenTweetIds,
        );

        return {
          content: [
            {
              type: "text",
              text:
                timeline.length > 0
                  ? JSON.stringify(timeline, null, 2)
                  : "No tweets found",
            },
          ],
        };
      },
    );

    // Get following timeline
    server.tool(
      "twitter-get-following-timeline",
      "Gets tweets from accounts the authenticated user follows.",
      {
        count: z
          .number()
          .min(1)
          .max(100)
          .default(3)
          .describe("Number of tweets to retrieve (max 100)"),
        seenTweetIds: z
          .array(z.string())
          .optional()
          .describe("IDs of tweets already seen"),
      },
      async ({ count, seenTweetIds = [] }) => {
        const timeline = await twitterClient.fetchFollowingTimeline(
          count,
          seenTweetIds,
        );

        return {
          content: [
            {
              type: "text",
              text:
                timeline.length > 0
                  ? JSON.stringify(timeline, null, 2)
                  : "No tweets found",
            },
          ],
        };
      },
    );

    // Get direct message conversations
    server.tool(
      "twitter-get-dm-conversations",
      "Gets direct message conversations for the authenticated user.",
      {
        userId: z.string().describe("User ID to get conversations for"),
      },
      async ({ userId }) => {
        const conversations =
          await twitterClient.getDirectMessageConversations(userId);

        return {
          content: [
            {
              type: "text",
              text:
                conversations &&
                conversations.conversations &&
                conversations.conversations.length > 0
                  ? JSON.stringify(conversations, null, 2)
                  : "No conversations found",
            },
          ],
        };
      },
    );

    // Send direct message
    server.tool(
      "twitter-send-dm",
      "Sends a direct message to another user.",
      {
        conversationId: z
          .string()
          .describe("ID of the conversation to send the message to"),
        text: z.string().describe("Text of the message to send"),
      },
      async ({ conversationId, text }) => {
        const result = await twitterClient.sendDirectMessage(
          conversationId,
          text,
        );

        return {
          content: [
            {
              type: "text",
              text: result
                ? "Message sent successfully"
                : "Failed to send message",
            },
          ],
        };
      },
    );
  }

  // Add Grok chat tool if Grok access is available
  if (
    twitterFeatures.grokAccess &&
    (serverOptions.includeAllTools || serverOptions.includeGrokTools)
  ) {
    server.tool(
      "twitter-grok-chat",
      "Sends a message to Grok AI and gets a response.",
      {
        message: z.string().describe("Message to send to Grok"),
        history: z
          .array(
            z.object({
              role: z.enum(["user", "assistant"]),
              content: z.string(),
            }),
          )
          .optional()
          .describe("Optional conversation history"),
      },
      async ({ message, history = [] }) => {
        // Prepare messages for Grok
        const messages = [...history, { role: "user", content: message }];

        const result = await twitterClient.grokChat(messages);

        return {
          content: [
            {
              type: "text",
              text: result.message || "No response from Grok",
            },
          ],
        };
      },
    );
  }

  return server;
}

export default createTwitterServer;

/**
 * Run the Twitter MCP server directly with stdio transport
 */
// This check determines if the file is being run directly
if (
  process.argv[1].endsWith("twitter/server.js") ||
  process.argv[1].endsWith("twitter/server.ts")
) {
  // Need to use dynamic import to avoid TypeScript errors
  import("@modelcontextprotocol/sdk/server/stdio.js").then(
    ({ StdioServerTransport }) => {
      try {
        console.error("Starting Twitter MCP server...");
        const twitterServer = createTwitterServer();
        const transport = new StdioServerTransport();

        // Handle stdin end for clean shutdown
        process.stdin.on("end", () => {
          process.exit(0);
        });

        twitterServer.server.connect(transport).then(() => {
          console.error("Twitter MCP server started and listening");
        });
      } catch (error) {
        console.error("Failed to start Twitter MCP server:", error);
        process.exit(1);
      }
    },
  );
}
