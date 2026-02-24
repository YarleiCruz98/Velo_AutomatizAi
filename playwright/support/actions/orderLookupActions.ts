import { Page, expect } from '@playwright/test';

export type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE';

interface StatusStyle {
  cssClass: RegExp;
  iconClass: RegExp;
}

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  APROVADO: { cssClass: /bg-green-100 text-green-700/, iconClass: /lucide-circle-check-big/ },
  REPROVADO: { cssClass: /bg-red-100 text-red-700/, iconClass: /lucide-circle-x/ },
  EM_ANALISE: { cssClass: /bg-amber-100 text-amber-700/, iconClass: /lucide-clock/ },
};

export interface OrderResultExpectation {
  orderCode: string;
  orderStatus: OrderStatus;
  carColor: string;
  wheelType: string;
  customerName: string;
  customerEmail: string;
  paymentMethod: string;
  // opcional: presente na massa de teste, não usado nas asserções
  customerStore?: string;
}

export function createOrderLookupActions(page: Page) {
  const orderNumberInput = page.getByRole('textbox', { name: 'Número do Pedido' }),
  const searchButton = page.getByRole('button', { name: 'Buscar Pedido' });
    
  return {
    elements: {
      orderNumberInput,
      searchButton
    },

    async searchOrder(orderNumber: string) {
      await this.elements.orderNumberInput.fill(orderNumber);
      await this.elements.searchButton.click();
    },

    async expectStatusBadge(status: OrderStatus) {
      const { cssClass, iconClass } = STATUS_STYLES[status];

      const badge = page.getByRole('status').filter({ hasText: status });
      await expect(badge, `Badge do status "${status}" deve estar visível`).toBeVisible();
      await expect(badge, `Badge deve ter as classes CSS: ${cssClass}`).toHaveClass(cssClass);

      const icon = badge.locator('svg');
      await expect(icon, `Ícone do badge deve ter a classe: ${iconClass}`).toHaveClass(iconClass);
    },

    async validateOrderResult(order: OrderResultExpectation) {
      await expect(page.getByTestId(`order-result-${order.orderCode}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.orderCode}
      - status:
        - img
        - text: ${order.orderStatus}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.carColor}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheelType}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customerName}
      - paragraph: Email
      - paragraph: ${order.customerEmail}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.paymentMethod}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `);
    },

    async validateNonExistingOrder(orderCode: string) {
      await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
    `);
    },
  };
}

