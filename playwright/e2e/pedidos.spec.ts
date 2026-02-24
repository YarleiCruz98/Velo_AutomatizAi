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
    const testData = {
      orderCode:     'VLO-U9BW56',
      orderStatus:   'APROVADO' as const,
      carColor:      'Glacier Blue',
      customerName:  'Yarlei Cruz',
      customerEmail: 'yarlei@cruz.com.br',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert — full aria snapshot
    await expect(page.getByTestId(`order-result-${testData.orderCode}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${testData.orderCode}
      - status:
        - img
        - text: ${testData.orderStatus}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${testData.carColor}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: aero Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${testData.customerName}
      - paragraph: Email
      - paragraph: ${testData.customerEmail}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${testData.paymentMethod}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `);

    // Badge style + icon delegated to the Page Object
    await consultaPedidoPage.expectStatusBadge(testData.orderStatus);
  });

  // ---------------------------------------------------------------------------
  // REPROVADO
  // ---------------------------------------------------------------------------

  test('Should verify a reproved order with snapshot', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const testData = {
      orderCode:     'VLO-DVVKQC',
      orderStatus:   'REPROVADO' as const,
      carColor:      'Midnight Black',
      customerName:  'Jaci Teixeira',
      customerEmail: 'jaciteixera@velo.com',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert — full aria snapshot
    await expect(page.getByTestId(`order-result-${testData.orderCode}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${testData.orderCode}
      - status:
        - img
        - text: ${testData.orderStatus}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${testData.carColor}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: sport Wheels
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${testData.customerName}
      - paragraph: Email
      - paragraph: ${testData.customerEmail}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${testData.paymentMethod}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `);

    // Badge style + icon delegated to the Page Object
    await consultaPedidoPage.expectStatusBadge(testData.orderStatus);
  });

  // ---------------------------------------------------------------------------
  // EM_ANALISE
  // ---------------------------------------------------------------------------

  test('Should verify an order in analysis', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const testData = {
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
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert — full aria snapshot
    await expect(page.getByTestId(`order-result-${testData.orderCode}`)).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${testData.orderCode}
      - status:
        - img
        - text: ${testData.orderStatus}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${testData.carColor}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${testData.wheelType}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${testData.customerName}
      - paragraph: Email
      - paragraph: ${testData.customerEmail}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d{2}\\/\\d{2}\\/\\d{4}/
      - heading "Pagamento" [level=4]
      - paragraph: ${testData.paymentMethod}
      - paragraph: /R\\$ [\\d.,]+/
    `);

    // Badge style + icon delegated to the Page Object
    await consultaPedidoPage.expectStatusBadge(testData.orderStatus);
  });

  // ---------------------------------------------------------------------------
  // Not found
  // ---------------------------------------------------------------------------

  test('Should verify a non existing order', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const testData = { orderCode: generateOrderNumber() };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente`);
  });

  test('Should verify a non existing order with snapshot', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const testData = { orderCode: generateOrderNumber() };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
    `);
  });
});