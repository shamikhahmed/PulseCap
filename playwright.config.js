// @ts-check
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  projects: [
    /* PW_CHANNEL=chrome runs on installed Google Chrome when the bundled
       browser build is missing (another Playwright version can swap the cache). */
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  use: { baseURL: 'http://127.0.0.1:8766' },
  webServer: {
    command: 'node scripts/static-server.mjs 8766',
    url: 'http://127.0.0.1:8766',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
