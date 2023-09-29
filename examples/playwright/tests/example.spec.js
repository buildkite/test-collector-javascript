const { test, expect } = require('@playwright/test');

test('has title', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Buildkite/);
});

test('says hello', async ({ page }) => {
  await page.goto('/');

  const h1 = await page.locator('h1');
  await expect(h1).toHaveText('Hello, World!');
});
