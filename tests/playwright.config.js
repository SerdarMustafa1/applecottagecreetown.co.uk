// Playwright config
// SITE_URL should be the deployed site (e.g., Netlify). MEDIA_BASE_URL should
// be set in the environment so CDN tests and the site both resolve media.
// Example:
//   SITE_URL=https://applecottagecreetown.co.uk MEDIA_BASE_URL=https://d1t6...cloudfront.net npx playwright test

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
  timeout: 30_000,
  use: {
    baseURL: process.env.SITE_URL || 'http://localhost:8080',
    headless: true,
  },
  reporter: [['list']],
};

module.exports = config;

