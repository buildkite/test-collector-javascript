const { test, expect } = require('@playwright/test');

test('with tags and annotations', {
  tag: ['@team:old-team', '@type:e2e'],
  annotation: [
    { type: 'buildkite.tag.team', description: 'new-team' },
    { type: 'buildkite.tag.priority', description: 'high' },
    { type: 'issue', description: 'https://github.com/microsoft/playwright/issues/23180' },
  ],
}, async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Buildkite/);
});
