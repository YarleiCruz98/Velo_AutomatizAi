import { test, expect } from '@playwright/test';
import { HomePage } from '../support/pages/HomePage';
import { Navbar } from '../support/pages/Navbar';
import { ConsultaPedidoPage } from '../support/pages/ConsultaPedidoPage';
import { generateOrderNumber } from '../support/helpers';

test.describe('order lookup', () => {
  let consultaPedidoPage: ConsultaPedidoPage;
  test.beforeEach(async ({ page }) => {
    
    consultaPedidoPage = new ConsultaPedidoPage(page);
    const homePage = new HomePage(page);
    await homePage.goto();
    await homePage.expectHeroLoaded();

    const navbar = new Navbar(page);
    await navbar.goToOrderLookup();
  });

  test('Should verify an approved order', async ({ page }) => {

    const testData = {
      orderCode: 'VLO-U9BW56',
      orderStatus: 'APROVADO' as const,
    };

    await consultaPedidoPage.searchOrder(testData.orderCode);
    const containerPedido = page
      .getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..');
    await expect(containerPedido).toContainText(testData.orderCode, { timeout: 10_000 });
    await expect(page.getByText(testData.orderStatus)).toBeVisible();
    await consultaPedidoPage.expectStatusBadge(testData.orderStatus);
  });

  test('Should verify an approved order with snapshot', async ({ page }) => {
    const order = {
      orderCode: 'VLO-U9BW56',
      orderStatus: 'APROVADO' as const,
      carColor: 'Glacier Blue',
      wheelType: 'aero Wheels',
      customerName: 'Yarlei Cruz',
      customerEmail: 'yarlei@cruz.com.br',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    await consultaPedidoPage.searchOrder(order.orderCode);
    await consultaPedidoPage.validateOrderResult(order);
    await consultaPedidoPage.expectStatusBadge(order.orderStatus);
  });

  test('Should verify a reproved order with snapshot', async ({ page }) => {
    const order = {
      orderCode: 'VLO-DVVKQC',
      orderStatus: 'REPROVADO' as const,
      carColor: 'Midnight Black',
      wheelType: 'sport Wheels',
      customerName: 'Jaci Teixeira',
      customerEmail: 'jaciteixera@velo.com',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    await consultaPedidoPage.searchOrder(order.orderCode);
    await consultaPedidoPage.validateOrderResult(order);
    await consultaPedidoPage.expectStatusBadge(order.orderStatus);
  });

  test('Should verify an order in analysis', async ({ page }) => {        
    const order = {
      orderCode: 'VLO-FAFYGC',
      orderStatus: 'EM_ANALISE' as const,
      carColor: 'Lunar White',
      wheelType: 'sport Wheels',
      customerName: 'Luiz Cruz',
      customerEmail: 'Luiz@velo.com',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    await consultaPedidoPage.searchOrder(order.orderCode);
    await consultaPedidoPage.validateOrderResult(order);
    await consultaPedidoPage.expectStatusBadge(order.orderStatus);
  });

  test('Should verify a non existing order', async ({ page }) => {
    const orderCode = generateOrderNumber();

    await consultaPedidoPage.searchOrder(orderCode);
    await consultaPedidoPage.validateNonExistingOrder();
  });

  test('Should verify an order winth number format different from the expected', async ({ page }) => {

    await consultaPedidoPage.searchOrder("ABC123");
    await consultaPedidoPage.validateNonExistingOrder();
  });
});