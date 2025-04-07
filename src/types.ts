

/**
 * Represents a tool that can be used by the MCP server
 */
export interface Tool {
  /** The name of the tool */
  name: string;
  /** A description of what the tool does */
  description: string;
  /** The parameters the tool accepts */
  parameters: {
    type?: string;
    properties?: Record<string, any>;
    required?: string[];
  };
  /** The function that handles the tool's execution */
  handler: (params: any) => Promise<any>;
}

interface Video {
  id: string;
  preview: string;
  url?: string;
}

export interface Profile {
  avatar?: string;
  banner?: string;
  biography?: string;
  birthday?: string;
  followersCount?: number;
  followingCount?: number;
  friendsCount?: number;
  mediaCount?: number;
  statusesCount?: number;
  isPrivate?: boolean;
  isVerified?: boolean;
  isBlueVerified?: boolean;
  joined?: Date;
  likesCount?: number;
  listedCount?: number;
  location: string;
  name?: string;
  pinnedTweetIds?: string[];
  tweetsCount?: number;
  url?: string;
  userId?: string;
  username?: string;
  website?: string;
  canDm?: boolean;
}

interface Mention {
  id: string;
  username?: string;
  name?: string;
}

interface Photo {
  id: string;
  url: string;
  alt_text: string | undefined;
}

interface PlaceRaw {
  id?: string;
  place_type?: string;
  name?: string;
  full_name?: string;
  country_code?: string;
  country?: string;
  bounding_box?: {
      type?: string;
      coordinates?: number[][][];
  };
}

export interface PollV2 {
  id: string;
  options: {
      position: number;
      label: string;
      votes: number;
  }[];
  duration_minutes?: number;
  end_datetime?: string;
  voting_status?: string;
}

export interface Tweet {
  bookmarkCount?: number;
  conversationId?: string;
  hashtags: string[];
  html?: string;
  id?: string;
  inReplyToStatus?: Tweet;
  inReplyToStatusId?: string;
  isQuoted?: boolean;
  isPin?: boolean;
  isReply?: boolean;
  isRetweet?: boolean;
  isSelfThread?: boolean;
  likes?: number;
  name?: string;
  mentions: Mention[];
  permanentUrl?: string;
  photos: Photo[];
  place?: PlaceRaw;
  quotedStatus?: Tweet;
  quotedStatusId?: string;
  replies?: number;
  retweets?: number;
  retweetedStatus?: Tweet;
  retweetedStatusId?: string;
  text?: string;
  thread: Tweet[];
  timeParsed?: Date;
  timestamp?: number;
  urls: string[];
  userId?: string;
  username?: string;
  videos: Video[];
  views?: number;
  sensitiveContent?: boolean;
  poll?: PollV2 | null;
}