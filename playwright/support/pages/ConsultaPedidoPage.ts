import { Page, expect } from '@playwright/test';

type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE';

interface StatusStyle {
  cssClass: RegExp;
  iconClass: RegExp;
}

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  APROVADO:   { cssClass: /bg-green-100 text-green-700/, iconClass: /lucide-circle-check-big/ },
  REPROVADO:  { cssClass: /bg-red-100 text-red-700/,     iconClass: /lucide-circle-x/         },
  EM_ANALISE: { cssClass: /bg-amber-100 text-amber-700/, iconClass: /lucide-clock/            },
};

export class ConsultaPedidoPage {
  constructor(private page: Page) {}

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  async searchOrder(orderNumber: string) {
    await this.page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber);
    await this.page.getByRole('button', { name: 'Buscar Pedido' }).click();
  }

  // ---------------------------------------------------------------------------
  // Assertions
  // ---------------------------------------------------------------------------

  /**
   * Asserts that the status badge:
   *  - is visible
   *  - contains the expected status text
   *  - has the correct background/text CSS classes
   *  - renders the correct SVG icon
   *
   * @example
   *   await consultaPedidoPage.expectStatusBadge('APROVADO');
   */
  async expectStatusBadge(status: OrderStatus) {
    const { cssClass, iconClass } = STATUS_STYLES[status];

    const badge = this.page.getByRole('status').filter({ hasText: status });
    await expect(badge, `Badge do status "${status}" deve estar visível`).toBeVisible();
    await expect(badge, `Badge deve ter as classes CSS: ${cssClass}`).toHaveClass(cssClass);

    const icon = badge.locator('svg');
    await expect(icon, `Ícone do badge deve ter a classe: ${iconClass}`).toHaveClass(iconClass);
  }
}