// @ts-check
const { defineConfig, devices } = require('@playwright/test');
module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  use: { baseURL: 'http://127.0.0.1:8766' },
  webServer: {
    command: 'python3 -m http.server 8766',
    url: 'http://127.0.0.1:8766',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
