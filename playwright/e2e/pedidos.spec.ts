import { test, expect } from '../support/fixtures';
import type { OrderResultExpectation } from '../support/actions/orderLookupActions';
import { generateOrderNumber } from '../support/helpers';

test.describe('order lookup', () => {
  test.beforeEach(async ({ page, app }) => {
    await app.home.goto();
    await app.home.expectHeroLoaded();
    await app.navbar.goToOrderLookup();
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  });

  test('Should verify an approved order', async ({ page, app }) => {
    const { orderLookup } = app;

    const testData: Pick<OrderResultExpectation, 'orderCode' | 'orderStatus'> = {
      orderCode: 'VLO-U9BW56',
      orderStatus: 'APROVADO' as const,
    };

    await orderLookup.searchOrder(testData.orderCode);
    const containerPedido = page
      .getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..');
    await expect(containerPedido).toContainText(testData.orderCode, { timeout: 10_000 });
    await expect(page.getByText(testData.orderStatus)).toBeVisible();
    await orderLookup.expectStatusBadge(testData.orderStatus);
  });

  test('Should verify an approved order with snapshot', async ({ app }) => {
    const { orderLookup } = app;
    const order: OrderResultExpectation = {
      orderCode: 'VLO-U9BW56',
      orderStatus: 'APROVADO' as const,
      carColor: 'Glacier Blue',
      wheelType: 'aero Wheels',
      customerName: 'Yarlei Cruz',
      customerEmail: 'yarlei@cruz.com.br',
      paymentMethod: 'À Vista',
    };

    await orderLookup.searchOrder(order.orderCode);
    await orderLookup.validateOrderResult(order);
    await orderLookup.expectStatusBadge(order.orderStatus);
  });

  test('Should verify a reproved order with snapshot', async ({ app }) => {
    const { orderLookup } = app;
    const order: OrderResultExpectation = {
      orderCode: 'VLO-DVVKQC',
      orderStatus: 'REPROVADO' as const,
      carColor: 'Midnight Black',
      wheelType: 'sport Wheels',
      customerName: 'Jaci Teixeira',
      customerEmail: 'jaciteixera@velo.com',
      paymentMethod: 'À Vista',
    };

    await orderLookup.searchOrder(order.orderCode);
    await orderLookup.validateOrderResult(order);
    await orderLookup.expectStatusBadge(order.orderStatus);
  });

  test('Should verify an order in analysis', async ({ app }) => {        
    const { orderLookup } = app;
    const order: OrderResultExpectation = {
      orderCode: 'VLO-FAFYGC',
      orderStatus: 'EM_ANALISE' as const,
      carColor: 'Lunar White',
      wheelType: 'sport Wheels',
      customerName: 'Luiz Cruz',
      customerEmail: 'Luiz@velo.com',
      paymentMethod: 'À Vista',
    };

    await orderLookup.searchOrder(order.orderCode);
    await orderLookup.validateOrderResult(order);
    await orderLookup.expectStatusBadge(order.orderStatus);
  });

  test('Should verify a non existing order', async ({ app }) => {
    const { orderLookup } = app;

    const orderCode = generateOrderNumber();
    await orderLookup.searchOrder(orderCode);
    await orderLookup.validateNonExistingOrder(orderCode);
  });

  test('Should verify an order winth number format different from the expected', async ({ app }) => {
    const { orderLookup } = app;

    await orderLookup.searchOrder('ABC123');
    await orderLookup.validateNonExistingOrder('ABC123');
  });
  test('Should keep the button disabled when the order number is empty', async ({ app, page }) => {
    const button = app.orderLookup.elements.searchButton;
    await expect(button).toBeDisabled();
    await app.orderLookup.elements.orderNumberInput.fill('             ');
    await expect(button).toBeDisabled();
  });
})