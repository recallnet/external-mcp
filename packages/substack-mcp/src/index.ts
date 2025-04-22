/**
 * Substack Module
 * Provides access to Substack publications and content.
 */
import { createSubstackServer } from './server.js';

// Export the server creator as the default export
export default createSubstackServer;

// Export server-related types and functions
export { createSubstackServer };

// Export client functionality
export * from './client.js';

// Module identifier
export const name = 'substack';

// Will export createSubstackServer and other functionality in later phases
