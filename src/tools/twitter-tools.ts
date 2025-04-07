import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { SearchMode } from 'agent-twitter-client';

// Profile Tools
export const PROFILE_BY_USERNAME_TOOL: Tool = {
  name: "profileByUsername",
  description: "Get a Twitter profile by username",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "The Twitter username without @ symbol"
      }
    },
    required: ["username"]
  }
};

export const GET_USER_ID_TOOL: Tool = {
  name: "getUserId",
  description: "Get a Twitter user's ID by their username",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "The Twitter username without @ symbol"
      }
    },
    required: ["username"]
  }
};

export const GET_SCREEN_NAME_TOOL: Tool = {
  name: "getScreenName",
  description: "Get a Twitter user's screen name by their user ID",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The Twitter user ID"
      }
    },
    required: ["userId"]
  }
};

// Tweet Tools
export const GET_TWEET_TOOL: Tool = {
  name: "getTweet",
  description: "Get a specific tweet by ID",
  inputSchema: {
    type: "object",
    properties: {
      tweetId: {
        type: "string",
        description: "The ID of the tweet to retrieve"
      }
    },
    required: ["tweetId"]
  }
};

export const GET_USER_TWEETS_TOOL: Tool = {
  name: "getUserTweets",
  description: "Get tweets from a Twitter user",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "The Twitter username without @ symbol"
      },
      count: {
        type: "number",
        description: "The maximum number of tweets to retrieve (default: 10)"
      }
    },
    required: ["username"]
  }
};

export const GET_TWEETS_BY_USER_ID_TOOL: Tool = {
  name: "getTweetsByUserId",
  description: "Get tweets from a Twitter user by their user ID",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The Twitter user ID"
      },
      count: {
        type: "number",
        description: "The maximum number of tweets to retrieve (default: 20)"
      }
    },
    required: ["userId"]
  }
};

export const GET_TWEETS_AND_REPLIES_TOOL: Tool = {
  name: "getTweetsAndReplies",
  description: "Get tweets and replies from a Twitter user",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "The Twitter username without @ symbol"
      },
      count: {
        type: "number",
        description: "The maximum number of tweets to retrieve (default: 20)"
      }
    },
    required: ["username"]
  }
};

export const GET_LATEST_TWEET_TOOL: Tool = {
  name: "getLatestTweet",
  description: "Get the latest tweet from a Twitter user",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "The Twitter username without @ symbol"
      },
      includeRetweets: {
        type: "boolean",
        description: "Whether to include retweets (default: false)"
      }
    },
    required: ["username"]
  }
};

export const SEND_TWEET_TOOL: Tool = {
  name: "sendTweet",
  description: "Post a new tweet",
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        description: "The text content of the tweet"
      }
    },
    required: ["text"]
  }
};

export const LIKE_TWEET_TOOL: Tool = {
  name: "likeTweet",
  description: "Like a tweet",
  inputSchema: {
    type: "object",
    properties: {
      tweetId: {
        type: "string",
        description: "The ID of the tweet to like"
      }
    },
    required: ["tweetId"]
  }
};

export const RETWEET_TOOL: Tool = {
  name: "retweet",
  description: "Retweet a tweet",
  inputSchema: {
    type: "object",
    properties: {
      tweetId: {
        type: "string",
        description: "The ID of the tweet to retweet"
      }
    },
    required: ["tweetId"]
  }
};

export const GET_ALL_QUOTED_TWEETS_TOOL: Tool = {
  name: "getAllQuotedTweets",
  description: "Get all quoted tweets for a specific tweet",
  inputSchema: {
    type: "object",
    properties: {
      tweetId: {
        type: "string",
        description: "The ID of the tweet to get quotes for"
      },
      maxTweetsPerPage: {
        type: "number",
        description: "The maximum number of tweets per page (default: 20)"
      }
    },
    required: ["tweetId"]
  }
};

export const GET_RETWEETERS_TOOL: Tool = {
  name: "getRetweeters",
  description: "Get users who retweeted a specific tweet",
  inputSchema: {
    type: "object",
    properties: {
      tweetId: {
        type: "string",
        description: "The ID of the tweet to get retweeters for"
      }
    },
    required: ["tweetId"]
  }
};

// Search Tools
export const SEARCH_TWEETS_TOOL: Tool = {
  name: "searchTweets",
  description: "Search for tweets",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query"
      },
      count: {
        type: "number",
        description: "The maximum number of tweets to retrieve (default: 20)"
      },
      searchMode: {
        type: "string",
        description: "Search mode: 'Latest', 'Top', 'Photos', or 'Videos' (default: 'Latest')",
        enum: ["Latest", "Top", "Photos", "Videos"]
      }
    },
    required: ["query"]
  }
};

export const SEARCH_PROFILES_TOOL: Tool = {
  name: "searchProfiles",
  description: "Search for Twitter profiles",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query"
      },
      count: {
        type: "number",
        description: "The maximum number of profiles to retrieve (default: 10)"
      }
    },
    required: ["query"]
  }
};

export const GET_TRENDS_TOOL: Tool = {
  name: "getTrends",
  description: "Get current Twitter trending topics",
  inputSchema: {
    type: "object",
    properties: {
      check: {
        type: "boolean",
        description: "Set to true to retrieve trends"
      }
    },
    required: ["check"]
  }
};

// Timeline Tools
export const GET_HOME_TIMELINE_TOOL: Tool = {
  name: "getHomeTimeline",
  description: "Get tweets from the authenticated user's home timeline",
  inputSchema: {
    type: "object",
    properties: {
      count: {
        type: "number",
        description: "The maximum number of tweets to retrieve (default: 20)"
      },
      seenTweetIds: {
        type: "array",
        description: "Array of tweet IDs that have been seen already",
        items: {
          type: "string"
        }
      }
    }
  }
};

export const GET_FOLLOWING_TIMELINE_TOOL: Tool = {
  name: "getFollowingTimeline",
  description: "Get tweets from users the authenticated user is following",
  inputSchema: {
    type: "object",
    properties: {
      count: {
        type: "number",
        description: "The maximum number of tweets to retrieve (default: 20)"
      },
      seenTweetIds: {
        type: "array",
        description: "Array of tweet IDs that have been seen already",
        items: {
          type: "string"
        }
      }
    }
  }
};

// Relationship Tools
export const GET_FOLLOWERS_TOOL: Tool = {
  name: "getFollowers",
  description: "Get the followers of a Twitter user",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the Twitter user"
      },
      count: {
        type: "number",
        description: "The number of followers to return (default: 20)"
      }
    },
    required: ["userId"]
  }
};

export const GET_FOLLOWING_TOOL: Tool = {
  name: "getFollowing",
  description: "Get the users that a Twitter user is following",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The ID of the Twitter user"
      },
      count: {
        type: "number",
        description: "The number of following to return (default: 20)"
      }
    },
    required: ["userId"]
  }
};

export const FOLLOW_USER_TOOL: Tool = {
  name: "followUser",
  description: "Follow a Twitter user",
  inputSchema: {
    type: "object",
    properties: {
      username: {
        type: "string",
        description: "The Twitter username to follow without @ symbol"
      }
    },
    required: ["username"]
  }
};

// Direct Message Tools
export const GET_DM_CONVERSATIONS_TOOL: Tool = {
  name: "getDMConversations",
  description: "Get direct message conversations for the authenticated user",
  inputSchema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The user ID to get conversations for"
      },
      cursor: {
        type: "string",
        description: "Optional cursor for pagination"
      }
    },
    required: ["userId"]
  }
};

export const SEND_DM_TOOL: Tool = {
  name: "sendDirectMessage",
  description: "Send a direct message to a Twitter user",
  inputSchema: {
    type: "object",
    properties: {
      conversationId: {
        type: "string",
        description: "The conversation ID to send the message to"
      },
      text: {
        type: "string",
        description: "The text content of the message"
      }
    },
    required: ["conversationId", "text"]
  }
};

// List Tools
export const GET_LIST_TWEETS_TOOL: Tool = {
  name: "getListTweets",
  description: "Get tweets from a Twitter list",
  inputSchema: {
    type: "object",
    properties: {
      listId: {
        type: "string",
        description: "The ID of the Twitter list"
      },
      count: {
        type: "number",
        description: "The maximum number of tweets to retrieve (default: 50)"
      }
    },
    required: ["listId"]
  }
};

// Article Tools
export const GET_ARTICLE_TOOL: Tool = {
  name: "getArticle",
  description: "Get a Twitter article by ID",
  inputSchema: {
    type: "object",
    properties: {
      articleId: {
        type: "string",
        description: "The ID of the article to retrieve"
      }
    },
    required: ["articleId"]
  }
};

// Grok Chat Tool
export const GROK_CHAT_TOOL: Tool = {
  name: "grokChat",
  description: "Interact with Twitter's Grok AI assistant",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        description: "Array of message objects with 'role' and 'content'",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "The role of the message sender ('user' or 'assistant')",
              enum: ["user", "assistant"]
            },
            content: {
              type: "string",
              description: "The content of the message"
            }
          },
          required: ["role", "content"]
        }
      }
    },
    required: ["messages"]
  }
};

// Feature Check Tool
export const GET_AVAILABLE_FEATURES_TOOL: Tool = {
  name: "getAvailableFeatures",
  description: "Check which optional Twitter features are available",
  inputSchema: {
    type: "object",
    properties: {
      check: {
        type: "boolean",
        description: "Set to true to check available features"
      }
    },
    required: ["check"]
  }
};

// Export all tools together
export const twitterTools: Tool[] = [
  // Profile tools
  PROFILE_BY_USERNAME_TOOL,
  GET_USER_ID_TOOL,
  GET_SCREEN_NAME_TOOL,
  
  // Tweet tools
  GET_TWEET_TOOL,
  GET_USER_TWEETS_TOOL,
  GET_TWEETS_BY_USER_ID_TOOL,
  GET_TWEETS_AND_REPLIES_TOOL,
  GET_LATEST_TWEET_TOOL,
  SEND_TWEET_TOOL,
  LIKE_TWEET_TOOL,
  RETWEET_TOOL,
  GET_ALL_QUOTED_TWEETS_TOOL,
  GET_RETWEETERS_TOOL,
  
  // Search tools
  SEARCH_TWEETS_TOOL,
  SEARCH_PROFILES_TOOL,
  GET_TRENDS_TOOL,
  
  // Timeline tools
  GET_HOME_TIMELINE_TOOL,
  GET_FOLLOWING_TIMELINE_TOOL,
  
  // Relationship tools
  GET_FOLLOWERS_TOOL,
  GET_FOLLOWING_TOOL,
  FOLLOW_USER_TOOL,
  
  // Direct Message tools
  GET_DM_CONVERSATIONS_TOOL,
  SEND_DM_TOOL,
  
  // List tools
  GET_LIST_TWEETS_TOOL,
  
  // Article tools
  GET_ARTICLE_TOOL,
  
  // Grok Chat tools
  GROK_CHAT_TOOL,
  
  // Feature check tool
  GET_AVAILABLE_FEATURES_TOOL
]; 