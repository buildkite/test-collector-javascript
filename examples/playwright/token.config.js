const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  reporter: [
    ['line'],
    ['buildkite-test-collector/playwright/reporter', { token: process.env.BUILDKITE_ANALYTICS_PLAYWRIGHT_TOKEN }]
  ],
  webServer: {
    command: 'npm start',
    url: 'http://127.0.0.1:8080',
  },
  use: {
    baseURL: 'http://localhost:8080/',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

