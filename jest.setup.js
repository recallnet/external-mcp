// Set up Jest global variables
global.jest = jest;
global.expect = expect;
global.test = test;
global.describe = describe;
global.beforeAll = beforeAll;
global.afterAll = afterAll;
global.beforeEach = beforeEach;
global.afterEach = afterEach;

// Import dotenv
const dotenv = require('dotenv');

// Load test environment variables
process.env.NODE_ENV = 'test';
process.env.TWITTER_USERNAME = 'test_user';
process.env.TWITTER_PASSWORD = 'test_password';
process.env.TWITTER_EMAIL = 'test@example.com';

// Handle ES Module imports in non-ESM files
global.require = module => {
  try {
    return require(module);
  } catch (e) {
    if (e.code === 'ERR_REQUIRE_ESM') {
      console.warn(`Module ${module} is an ES module, trying to mock it instead.`);
      return {};
    }
    throw e;
  }
}; 