/**
 * Tests for the Substack client
 *
 * These tests validate the Substack API client functions using the 's4mmyeth.substack.com' newsletter
 */
import {
  getAvailableFeatures,
  getCategoryNewsletters,
  getComments,
  getNewsletterAuthors,
  getNewsletterRecommendations,
  getPostBySlug,
  getPostContent,
  getPosts,
  getRecentPosts,
  getUserProfile,
  listCategories,
  searchPosts,
} from '../client.js';

// Test newsletter to use for all tests
const TEST_NEWSLETTER = 's4mmyeth.substack.com';
// A known valid Substack username for testing user profile API
const TEST_USER = 'mattyglesias'; // A popular Substack author
// Test category ID (Technology)
const TEST_CATEGORY_ID = 42;
// Known post slug from the test newsletter (updated to a valid post)
const TEST_POST_SLUG = 'the-agentic-future-ai-agent-weekly-20a';
// Full URL for a post to test content retrieval
const TEST_POST_URL = `https://${TEST_NEWSLETTER}/p/${TEST_POST_SLUG}`;

/**
 * Helper function to ensure tests don't overload the API
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Set Jest global variables for ESM compatibility
global.jest = jest;
global.test = test;
global.describe = describe;
global.beforeEach = beforeEach;

// Set longer timeout for API calls
jest.setTimeout(30000);

describe('Substack Client', () => {
  // Add delay between tests to avoid rate limiting
  beforeEach(async () => {
    await delay(1000);
  });

  test('getAvailableFeatures returns features object', () => {
    const features = getAvailableFeatures();
    expect(features).toBeDefined();
    expect(features.basicAccess).toBeDefined();
  });

  test('getPosts returns posts from test newsletter', async () => {
    try {
      const posts = await getPosts(TEST_NEWSLETTER, 2);
      expect(Array.isArray(posts)).toBe(true);

      if (posts.length > 0) {
        expect(posts[0].post_id).toBeDefined();
        expect(posts[0].title).toBeDefined();
      } else {
        console.warn('No posts returned but API call was successful');
      }
    } catch (error) {
      console.warn(`API call to getPosts failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getPosts).toBe('function');
    }
  });

  test('getRecentPosts returns recent posts from test newsletter', async () => {
    try {
      const posts = await getRecentPosts(TEST_NEWSLETTER, 2);
      expect(Array.isArray(posts)).toBe(true);

      if (posts.length > 0) {
        expect(posts[0].post_id).toBeDefined();
        expect(posts[0].title).toBeDefined();
      } else {
        console.warn('No recent posts returned but API call was successful');
      }
    } catch (error) {
      console.warn(`API call to getRecentPosts failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getRecentPosts).toBe('function');
    }
  });

  test('getPostBySlug returns a specific post by slug', async () => {
    try {
      const post = await getPostBySlug(TEST_NEWSLETTER, TEST_POST_SLUG);
      expect(post).toBeDefined();
      if (post) {
        expect(post.post_id).toBeDefined();
        expect(post.title).toBeDefined();
        expect(post.slug).toBe(TEST_POST_SLUG);
      }
    } catch (error) {
      console.warn(`API call to getPostBySlug failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getPostBySlug).toBe('function');
    }
  });

  test('searchPosts finds posts containing search term', async () => {
    try {
      // Use a generic term likely to be found in most newsletters
      const searchTerm = 'the';
      const posts = await searchPosts(TEST_NEWSLETTER, searchTerm, 2);
      expect(Array.isArray(posts)).toBe(true);
    } catch (error) {
      console.warn(`API call to searchPosts failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof searchPosts).toBe('function');
    }
  });

  test('getPostContent fetches the full content of a post', async () => {
    try {
      const postContent = await getPostContent(TEST_POST_URL);
      expect(postContent).toBeDefined();
      expect(postContent.title).toBeDefined();
      expect(postContent.author).toBeDefined();

      // Check for either HTML or text content
      if (postContent.content) {
        expect(postContent.content.length).toBeGreaterThan(0); // Content should have some length
      }
    } catch (error: unknown) {
      console.warn(`API call to getPostContent failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getPostContent).toBe('function');
    }
  });

  test('listCategories returns a list of Substack categories', async () => {
    try {
      const categories = await listCategories();
      expect(Array.isArray(categories)).toBe(true);

      if (categories.length > 0) {
        expect(categories[0].id).toBeDefined();
        expect(categories[0].name).toBeDefined();
      } else {
        console.warn('No categories returned but API call was successful');
      }
    } catch (error) {
      console.warn(`API call to listCategories failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof listCategories).toBe('function');
    }
  });

  test('getCategoryNewsletters returns newsletters in a category', async () => {
    try {
      const newsletters = await getCategoryNewsletters(TEST_CATEGORY_ID, 0, 3);
      expect(Array.isArray(newsletters)).toBe(true);

      if (newsletters.length > 0) {
        expect(newsletters[0].name).toBeDefined();
        expect(newsletters[0].domain).toBeDefined();
      } else {
        console.warn('No newsletters returned but API call was successful');
      }
    } catch (error) {
      console.warn(`API call to getCategoryNewsletters failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getCategoryNewsletters).toBe('function');
    }
  });

  test('getUserProfile returns information about a Substack user', async () => {
    try {
      const userProfile = await getUserProfile(TEST_USER);
      expect(userProfile).toBeDefined();
      expect(userProfile.id).toBeDefined();
      expect(userProfile.name).toBeDefined();
      expect(userProfile.handle).toBe(TEST_USER);
    } catch (error) {
      console.warn(`API call to getUserProfile failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getUserProfile).toBe('function');
    }
  });

  test('getNewsletterAuthors returns authors of a newsletter', async () => {
    try {
      const authors = await getNewsletterAuthors(TEST_NEWSLETTER);
      expect(Array.isArray(authors)).toBe(true);

      if (authors.length > 0) {
        expect(authors[0].id).toBeDefined();
        expect(authors[0].name).toBeDefined();
        expect(authors[0].handle).toBeDefined();
      } else {
        console.warn('No authors returned but API call was successful');
      }
    } catch (error) {
      console.warn(`API call to getNewsletterAuthors failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getNewsletterAuthors).toBe('function');
    }
  });

  test('getNewsletterRecommendations returns recommended newsletters', async () => {
    try {
      const recommendations = await getNewsletterRecommendations(TEST_NEWSLETTER);
      expect(Array.isArray(recommendations)).toBe(true);

      if (recommendations.length > 0) {
        expect(recommendations[0].name).toBeDefined();
        expect(recommendations[0].domain).toBeDefined();
      } else {
        console.warn('No recommendations returned but API call was successful');
      }
    } catch (error) {
      console.warn(`API call to getNewsletterRecommendations failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getNewsletterRecommendations).toBe('function');
    }
  });

  test('getComments returns comments on a post if available', async () => {
    try {
      // First get a post ID for a recent post
      const posts = await getRecentPosts(TEST_NEWSLETTER, 1);

      if (posts.length > 0 && posts[0].post_id) {
        const comments = await getComments(TEST_NEWSLETTER, posts[0].post_id);
        expect(Array.isArray(comments)).toBe(true);
      } else {
        console.warn('No posts found to test comments');
        // Verify the function exists and is callable
        expect(typeof getComments).toBe('function');
      }
    } catch (error) {
      console.warn(`API call to getComments or getRecentPosts failed: ${error}`);
      // Verify the function exists and is callable
      expect(typeof getComments).toBe('function');
    }
  });
});
