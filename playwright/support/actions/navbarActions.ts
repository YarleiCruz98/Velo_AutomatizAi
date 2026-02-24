import { Page } from '@playwright/test';

export function createNavbarActions(page: Page) {
  return {
    async goToOrderLookup() {
      await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    },
  };
}

