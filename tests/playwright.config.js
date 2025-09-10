const { defineConfig } = require('@playwright/test');

const viewports = [
  { width: 393, height: 852 },
  { width: 390, height: 844 },
  { width: 428, height: 926 },
  { width: 412, height: 892 },
  { width: 1920, height: 1080 },
];

const browsers = ['chromium', 'webkit'];

const projects = browsers.flatMap(browserName =>
  viewports.map(vp => ({
    name: `${browserName}-${vp.width}x${vp.height}`,
    use: { browserName, viewport: vp },
  }))
);

const network = {
  download: 1.5 * 1024 * 1024 / 8,
  upload: 750 * 1024 / 8,
  latency: 200,
};

module.exports = defineConfig({
  timeout: 30_000,
  testDir: '.',
  reporter: [['list']],
  use: {
    baseURL: process.env.SITE_URL || 'http://localhost:8080',
    headless: true,
    contextOptions: { networkConditions: network },
  },
  projects,
});
