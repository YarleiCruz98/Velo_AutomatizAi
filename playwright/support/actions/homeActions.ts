import { Page, expect } from '@playwright/test';

const DEFAULT_BASE_URL = 'http://localhost:5173/';

export function createHomeActions(page: Page) {
  return {
    async goto(baseUrl: string = DEFAULT_BASE_URL) {
      await page.goto(baseUrl);
    },

    async expectHeroLoaded() {
      await expect(
        page.getByTestId('hero-section').getByRole('heading'),
      ).toContainText('Velô Sprint');
    },
  };
}

