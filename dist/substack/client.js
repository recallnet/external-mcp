import axios from "axios";
import { handleClientError } from "../utils/errors.js";
import * as cheerio from "cheerio";
// Module name for error context
const MODULE_NAME = "substack-client";
/**
 * Normalizes a Substack ID to ensure it's a full domain
 * @param substackId The Substack ID (can be just the ID or a full domain)
 * @returns A normalized Substack domain
 */
export function normalizeSubstackId(substackId) {
    // If it already contains a dot, assume it's a full domain
    if (substackId.includes(".")) {
        return substackId;
    }
    // Otherwise, append .substack.com
    return `${substackId}.substack.com`;
}
/**
 * Checks what Substack API features are available based on environment variables
 * @returns An object indicating which features are available
 */
export function getAvailableFeatures() {
    // Basic access is always available as the API is public
    return {
        basicAccess: true,
    };
}
/**
 * Gets posts from a Substack publication
 * @deprecated This function is deprecated and will be removed in a future version. Use getRecentPosts instead.
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @param limit Maximum number of posts to retrieve (default: 10, max: 50)
 * @param offset Offset for pagination (default: 0)
 * @returns Array of Substack posts
 * @throws {ApiError} If the API request fails
 */
export async function getPosts(substackId, limit = 10, offset = 0) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Ensure limit is within bounds
        const validLimit = Math.min(Math.max(1, limit), 50);
        // Construct the URL
        const url = `https://${normalizedId}/api/v1/posts?limit=${validLimit}&offset=${offset}`;
        const response = await axios.get(url);
        // Map the response data to only include the fields we need
        return response.data.map((post) => ({
            slug: post.slug,
            title: post.title,
            subtitle: post.subtitle || "",
            post_date: post.post_date,
            url: post.canonical_url || `https://${normalizedId}/p/${post.slug}`,
            post_id: post.id
        }));
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getPosts`);
    }
}
/**
 * Gets posts from a Substack publication sorted by newest first
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @param limit Maximum number of posts to retrieve (default: 10, max: 50)
 * @param offset Offset for pagination (default: 0)
 * @returns Array of Substack posts
 * @throws {ApiError} If the API request fails
 */
export async function getRecentPosts(substackId, limit = 10, offset = 0) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Ensure limit is within bounds
        const validLimit = Math.min(Math.max(1, limit), 50);
        // Construct the URL
        const url = `https://${normalizedId}/api/v1/archive?sort=new&limit=${validLimit}&offset=${offset}`;
        const response = await axios.get(url);
        // Map the response data to only include the fields we need
        return response.data.map((post) => ({
            slug: post.slug,
            title: post.title,
            subtitle: post.subtitle || "",
            post_date: post.post_date,
            url: post.canonical_url || `https://${normalizedId}/p/${post.slug}`,
            post_id: post.id,
        }));
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getRecentPosts`);
    }
}
/**
 * Gets comments for a specific post
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @param postId The ID of the post to get comments for
 * @returns Array of comments
 * @throws {ApiError} If the API request fails
 */
export async function getComments(substackId, postId) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Get the post's comments endpoint
        const url = `https://${normalizedId}/api/v1/post/${postId}/comments?token=&all_comments=true&sort=newest_first`;
        const response = await axios.get(url);
        // Extract and normalize comments data
        if (response.data && Array.isArray(response.data.comments)) {
            return response.data.comments.map((comment) => ({
                id: comment.id,
                body: comment.body,
                created_at: comment.created_at,
                author: {
                    name: comment.user.name || "Anonymous",
                    photo_url: comment.user.photo_url,
                },
            }));
        }
        return [];
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getComments`);
    }
}
/**
 * Gets a specific post by its slug
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @param slug The post slug from the URL
 * @returns Post information or null if not found
 */
export async function getPostBySlug(substackId, slug) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Get the post page
        const response = await axios.get(`https://${normalizedId}/p/${slug}`);
        const html = response.data;
        // Extract post ID for comments
        const idMatch = html.match(/"post_id":(\d+)/);
        const postId = idMatch ? parseInt(idMatch[1], 10) : undefined;
        // Extract title
        const titleMatch = html.match(/<h1[^>]*class="[^"]*post-title[^"]*"[^>]*>(.*?)<\/h1>/i);
        const title = titleMatch ? titleMatch[1].trim() : "";
        // Extract subtitle
        const subtitleMatch = html.match(/<h3[^>]*class="[^"]*subtitle[^"]*"[^>]*>(.*?)<\/h3>/i);
        const subtitle = subtitleMatch ? subtitleMatch[1].trim() : "";
        // Extract author
        const authorMatch = html.match(/<a[^>]*class="[^"]*author-name[^"]*"[^>]*>(.*?)<\/a>/i);
        const author = authorMatch ? authorMatch[1].trim() : "";
        // Extract date
        const dateMatch = html.match(/<time[^>]*>(.*?)<\/time>/i);
        let post_date = "";
        if (dateMatch) {
            post_date = dateMatch[1].trim();
        }
        else {
            // Alternative date format
            const altDateMatch = html.match(/"datePublished":"([^"]*)"/);
            post_date = altDateMatch ? altDateMatch[1] : "";
        }
        // If we couldn't extract a title, the post probably doesn't exist
        if (!title) {
            return null;
        }
        return {
            slug,
            post_id: postId,
            title,
            subtitle,
            author,
            post_date,
            url: `https://${normalizedId}/p/${slug}`,
        };
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getPostBySlug`);
    }
}
/**
 * Extract the post ID from a post's HTML
 * @param $ Cheerio instance loaded with post HTML
 * @returns The post ID or undefined if not found
 */
function extractPostId($) {
    // Try to find post ID in metadata
    const metaElement = $('meta[name="post-id"]');
    if (metaElement.length) {
        const postId = metaElement.attr("content");
        if (postId)
            return parseInt(postId, 10);
    }
    // Try to find post ID in script tags
    const scripts = $("script");
    for (let i = 0; i < scripts.length; i++) {
        const scriptContent = $(scripts[i]).html() || "";
        const postIdMatch = scriptContent.match(/"post_id"\s*:\s*(\d+)/);
        if (postIdMatch && postIdMatch[1]) {
            return parseInt(postIdMatch[1], 10);
        }
    }
    return undefined;
}
/**
 * Gets the full content of a post by its URL
 * @param postUrl The full URL to the Substack post
 * @returns Detailed post information
 */
export async function getPostContent(postUrl) {
    try {
        const response = await fetch(postUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch post: ${response.status} ${response.statusText}`);
        }
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $("h1.post-title").text().trim();
        const authorElement = $(".author-name");
        const author = authorElement.length
            ? authorElement.text().trim()
            : undefined;
        const dateElement = $(".post-date");
        const publish_date = dateElement.length
            ? dateElement.text().trim()
            : undefined;
        const subtitleElement = $(".subtitle");
        const subtitle = subtitleElement.length
            ? subtitleElement.text().trim()
            : undefined;
        const contentElement = $(".available-content");
        const content = contentElement.length
            ? contentElement.html() || undefined
            : undefined;
        const post_id = extractPostId($);
        // Extract URL parts for domain and slug
        const urlObj = new URL(postUrl);
        const domain = urlObj.hostname;
        const pathMatch = urlObj.pathname.match(/\/p\/([^\/]+)/);
        const slug = pathMatch ? pathMatch[1] : "";
        return {
            title,
            subtitle,
            author,
            publish_date,
            content,
            post_id,
            url: postUrl,
            domain,
            slug,
        };
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getPostContent`);
    }
}
/**
 * Searches for posts in a Substack publication
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @param searchTerm The term to search for
 * @param limit Maximum number of posts to retrieve (default: 10)
 * @param offset Offset for pagination (default: 0)
 * @returns Array of matching posts
 */
export async function searchPosts(substackId, searchTerm, limit = 10, offset = 0) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Ensure limit is within bounds
        const validLimit = Math.min(Math.max(1, limit), 50);
        // For search with pagination, we need to get a larger set of posts
        // and then manually paginate, since there's no direct search API
        const searchPoolSize = 100; // How many posts to search through
        // Get recent posts and filter by search term
        const recentPosts = await getRecentPosts(normalizedId, searchPoolSize);
        // Simple search implementation (case-insensitive match in title or subtitle)
        const term = searchTerm.toLowerCase();
        const matches = recentPosts.filter((post) => post.title.toLowerCase().includes(term) ||
            (post.subtitle && post.subtitle.toLowerCase().includes(term)));
        // Apply pagination
        const startIndex = Math.min(offset, matches.length);
        const endIndex = Math.min(startIndex + validLimit, matches.length);
        // Return only with the fields we want
        return matches.slice(startIndex, endIndex).map((post) => ({
            slug: post.slug,
            title: post.title,
            subtitle: post.subtitle || "",
            post_date: post.post_date,
            url: post.url,
            post_id: post.post_id,
        }));
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.searchPosts`);
    }
}
/**
 * Gets information about a Substack publication
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @returns Publication information
 */
export async function getPublicationInfo(substackId) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Get the main page
        const response = await axios.get(`https://${normalizedId}`);
        const html = response.data;
        // Extract publication name
        const nameMatch = html.match(/<title>(.*?)(?: \||\s*<\/title>)/i);
        const name = nameMatch ? nameMatch[1].trim() : normalizedId;
        // Extract description
        const descriptionMatch = html.match(/<meta\s+name="description"\s+content="([^"]*?)"/i);
        const description = descriptionMatch ? descriptionMatch[1] : "";
        // Extract logo
        const logoMatch = html.match(/<img[^>]*?class="[^"]*?publication-logo[^"]*?"[^>]*?src="([^"]*?)"/i);
        let logoUrl = logoMatch ? logoMatch[1] : "";
        // Extract twitter handle if available
        const twitterMatch = html.match(/<a[^>]*?href="https:\/\/twitter\.com\/([^"\/]*?)"/i);
        const twitterHandle = twitterMatch ? twitterMatch[1] : null;
        // Extract about page content if available
        let about = "";
        try {
            const aboutResponse = await axios.get(`https://${normalizedId}/about`);
            const aboutHtml = aboutResponse.data;
            const aboutMatch = aboutHtml.match(/<div[^>]*?class="[^"]*?about-page-body[^"]*?"[^>]*?>([\s\S]*?)<\/div>\s*<\/div>/i);
            about = aboutMatch
                ? aboutMatch[1]
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                : "";
        }
        catch (e) {
            // About page might not exist, that's ok
        }
        // Get recent posts for stats
        const recentPosts = await getRecentPosts(normalizedId, 3);
        const postCount = recentPosts.length;
        const lastPostDate = postCount > 0 ? recentPosts[0].post_date : null;
        // Compile information
        return {
            name,
            domain: normalizedId,
            description,
            logoUrl,
            twitterHandle,
            about,
            stats: {
                recentPostCount: postCount,
                lastPostDate,
            },
        };
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getPublicationInfo`);
    }
}
/**
 * Gets a list of Substack categories
 * @deprecated This function is deprecated and will be removed in a future version. Use publication-specific endpoints instead.
 * @returns Array of categories
 */
export async function listCategories() {
    try {
        // This endpoint isn't publicly documented but can be found in network requests
        const response = await axios.get("https://substack.com/api/v1/categories");
        // If successful, return the categories
        if (response.data && Array.isArray(response.data)) {
            return response.data.map((category) => ({
                id: category.id,
                name: category.name,
            }));
        }
        return [];
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.listCategories`);
    }
}
/**
 * Gets newsletters in a specific category
 * @deprecated This function is deprecated and will be removed in a future version. Use publication-specific endpoints instead.
 * @param categoryId The ID of the category
 * @param page Page number for pagination (default: 0)
 * @param limit Maximum number of newsletters to retrieve (default: 20)
 * @returns Array of newsletters
 */
export async function getCategoryNewsletters(categoryId, page = 0, limit = 20) {
    try {
        // This endpoint isn't publicly documented but can be found in network requests
        const url = `https://substack.com/api/v1/category/${categoryId}/publications?page=${page}&limit=${limit}`;
        const response = await axios.get(url);
        // If successful, extract and return the newsletter info
        if (response.data && Array.isArray(response.data.publications)) {
            return response.data.publications.map((pub) => ({
                name: pub.name,
                domain: pub.custom_domain || `${pub.subdomain}.substack.com`,
                subdomain: pub.subdomain,
                custom_domain: pub.custom_domain,
            }));
        }
        return [];
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getCategoryNewsletters`);
    }
}
/**
 * Gets a user's profile by their username
 * @param username The Substack username
 * @returns User profile information
 */
export async function getUserProfile(username) {
    try {
        // This endpoint isn't publicly documented but can be found in network requests
        const url = `https://substack.com/api/v1/user/profile/${username}`;
        const response = await axios.get(url);
        if (response.data) {
            const userData = response.data;
            // Extract the profile information
            return {
                id: userData.id,
                name: userData.name,
                handle: userData.handle,
                bio: userData.bio,
                photo_url: userData.photo_url,
                profile_set_up_at: userData.profile_set_up_at,
                subscriptions: userData.subscriptions
                    ? userData.subscriptions.map((sub) => ({
                        publication_id: sub.publication_id,
                        publication_name: sub.publication_name,
                        domain: sub.domain,
                        membership_state: sub.membership_state,
                    }))
                    : [],
            };
        }
        throw new Error("User profile data not found");
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getUserProfile`);
    }
}
/**
 * Gets authors of a Substack newsletter
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @returns Array of authors
 */
export async function getNewsletterAuthors(substackId) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Get the main page
        const response = await axios.get(`https://${normalizedId}`);
        const html = response.data;
        // Extract author information
        // This is a simple approach and might need adjustment for different Substack layouts
        const authorsSection = html.match(/<div[^>]*?class="[^"]*?authors-section[^"]*?"[^>]*?>([\s\S]*?)<\/div>\s*<\/div>/i);
        if (authorsSection) {
            const authorDivs = authorsSection[1].match(/<div[^>]*?class="[^"]*?author-profile[^"]*?"[^>]*?>[\s\S]*?<\/div>\s*<\/div>/gi);
            if (authorDivs && authorDivs.length > 0) {
                return authorDivs.map((div, index) => {
                    const nameMatch = div.match(/<div[^>]*?class="[^"]*?name[^"]*?"[^>]*?>(.*?)<\/div>/i);
                    const photoMatch = div.match(/<img[^>]*?src="([^"]*?)"/i);
                    return {
                        id: index + 1, // Since we don't have actual IDs from the HTML
                        name: nameMatch ? nameMatch[1].trim() : `Author ${index + 1}`,
                        handle: "", // We can't reliably get this from the HTML
                        photo_url: photoMatch ? photoMatch[1] : null,
                    };
                });
            }
        }
        // Fallback to a single author (the publication itself)
        const publicationInfo = await getPublicationInfo(normalizedId);
        return [
            {
                id: 1,
                name: publicationInfo?.name || normalizedId,
                handle: normalizedId.replace(".substack.com", ""),
            },
        ];
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getNewsletterAuthors`);
    }
}
/**
 * Gets recommended newsletters for a Substack publication
 * @deprecated This function is deprecated and will be removed in a future version. Use publication-specific endpoints instead.
 * @param substackId The Substack publication ID (subdomain or custom domain)
 * @returns Array of recommended newsletters
 */
export async function getNewsletterRecommendations(substackId) {
    try {
        // Normalize the Substack ID
        const normalizedId = normalizeSubstackId(substackId);
        // Get the main page
        const response = await axios.get(`https://${normalizedId}`);
        const html = response.data;
        // Extract recommendations section
        const recsSection = html.match(/<div[^>]*?class="[^"]*?recommendations-section[^"]*?"[^>]*?>([\s\S]*?)<\/div>\s*<\/div>/i);
        if (recsSection) {
            const recDivs = recsSection[1].match(/<a[^>]*?class="[^"]*?publication-title[^"]*?"[^>]*?href="https:\/\/([^"]*?)"\s*>(.*?)<\/a>/gi);
            if (recDivs && recDivs.length > 0) {
                return recDivs.map((div) => {
                    const domainMatch = div.match(/href="https:\/\/([^"]*?)"/i);
                    const nameMatch = div.match(/>(.*?)<\/a>/i);
                    const domain = domainMatch ? domainMatch[1] : "";
                    return {
                        name: nameMatch ? nameMatch[1].trim() : domain,
                        domain: domain,
                    };
                });
            }
        }
        return [];
    }
    catch (error) {
        throw handleClientError(error, `${MODULE_NAME}.getNewsletterRecommendations`);
    }
}
