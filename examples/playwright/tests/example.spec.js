const { test, expect } = require('@playwright/test');

test('has title', { tag: ['@foo:bar'] }, async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Buildkite/);
});

test('says hello', async ({ page }, { retry }) => {
  await page.goto('/');

  // Trigger flaky test to assert --retries behaviour
  const h1 = await page.locator(retry == 0 ? 'h2' : 'h1');
  await expect(h1).toHaveText('Hello, World!');
});
