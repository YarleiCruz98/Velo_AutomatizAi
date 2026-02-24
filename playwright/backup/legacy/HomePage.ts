import { Page, expect } from '@playwright/test';

const DEFAULT_BASE_URL = 'http://localhost:5173/';

export class HomePage {
  constructor(private page: Page) {}

  async goto(baseUrl = DEFAULT_BASE_URL) {
    await this.page.goto(baseUrl);
  }

  async expectHeroLoaded() {
    await expect(
      this.page.getByTestId('hero-section').getByRole('heading'),
    ).toContainText('Velô Sprint');
  }
}

