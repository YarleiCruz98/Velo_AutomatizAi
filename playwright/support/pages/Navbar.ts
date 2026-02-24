import type { Page } from '@playwright/test';

export class Navbar {
  constructor(private page: Page) {}

  async goToOrderLookup() {
    await this.page.getByRole('link', { name: 'Consultar Pedido' }).click();
  }
}

