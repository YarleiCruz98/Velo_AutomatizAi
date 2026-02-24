import { test, expect } from '@playwright/test';
import { ConsultaPedidoPage } from '../support/pages/ConsultaPedidoPage';
import { generateOrderNumber } from '../support/helpers';

// AAA — Arrange / Act / Assert
test.describe('order lookup', () => {

  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/');
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  });

  // ---------------------------------------------------------------------------
  // APROVADO
  // ---------------------------------------------------------------------------

  test('Should verify an approved order', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const testData = {
      orderCode: 'VLO-U9BW56',
      orderStatus: 'APROVADO' as const,
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert — order code is displayed under the "Pedido" label
    const containerPedido = page
      .getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..');
    await expect(containerPedido).toContainText(testData.orderCode, { timeout: 10_000 });

    await expect(page.getByText(testData.orderStatus)).toBeVisible();

    // Badge style + icon delegated to the Page Object
    await consultaPedidoPage.expectStatusBadge(testData.orderStatus);
  });

  test('Should verify an approved order with snapshot', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const order = {
      orderCode:     'VLO-U9BW56',
      orderStatus:   'APROVADO' as const,
      carColor:      'Glacier Blue',
      wheelType:     'aero Wheels',
      customerName:  'Yarlei Cruz',
      customerEmail: 'yarlei@cruz.com.br',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    // Act
    await consultaPedidoPage.searchOrder(order.orderCode);

    // Assert — full aria snapshot
    await consultaPedidoPage.validateOrderResult(order);

    // Badge style + icon delegated to the Page Object
    await consultaPedidoPage.expectStatusBadge(order.orderStatus);
  });

  // ---------------------------------------------------------------------------
  // REPROVADO
  // ---------------------------------------------------------------------------

  test('Should verify a reproved order with snapshot', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const order = {
      orderCode:     'VLO-DVVKQC',
      orderStatus:   'REPROVADO' as const,
      carColor:      'Midnight Black',
      wheelType:     'sport Wheels',
      customerName:  'Jaci Teixeira',
      customerEmail: 'jaciteixera@velo.com',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    // Act
    await consultaPedidoPage.searchOrder(order.orderCode);

    // Assert — full aria snapshot
    await consultaPedidoPage.validateOrderResult(order);

    // Badge style + icon delegated to the Page Object
    await consultaPedidoPage.expectStatusBadge(order.orderStatus);
  });

  // ---------------------------------------------------------------------------
  // EM_ANALISE
  // ---------------------------------------------------------------------------

  test('Should verify an order in analysis', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const order = {
      orderCode:     'VLO-FAFYGC',
      orderStatus:   'EM_ANALISE' as const,
      carColor:      'Lunar White',
      wheelType:     'sport Wheels',
      customerName:  'Luiz Cruz',
      customerEmail: 'Luiz@velo.com',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    // Act
    await consultaPedidoPage.searchOrder(order.orderCode);

    // Assert — full aria snapshot
    await consultaPedidoPage.validateOrderResult(order);

    // Badge style + icon delegated to the Page Object
    await consultaPedidoPage.expectStatusBadge(order.orderStatus);
  });

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------

  test('Should verify a non existing order', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const orderCode = generateOrderNumber();

    // Act
    await consultaPedidoPage.searchOrder(orderCode);

    // Assert
    await consultaPedidoPage.validateNonExistingOrder(orderCode);
  });

  test('Should verify an order winth number format different from the expected', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);

    // Act
    await consultaPedidoPage.searchOrder("ABC123");

    // Assert
    await consultaPedidoPage.validateNonExistingOrder("ABC123");
  });
});