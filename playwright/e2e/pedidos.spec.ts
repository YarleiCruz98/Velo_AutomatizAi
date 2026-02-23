import { test, expect } from '@playwright/test';
import { ConsultaPedidoPage } from '../support/pages/ConsultaPedidoPage'
import { generateOrderNumber} from '../support/helpers'
// AAA Arrange Act Assert
test.describe('order lookup', () => {

  test.beforeEach(async ({ page }) => {
    // Arrange
    await page.goto('http://localhost:5173/');
    await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  })

  test('Should verify an approved order', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    // testData
    const testData = {
      orderCode: 'VLO-U9BW56',
      orderStatus: 'APROVADO',
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
    // Locate the paragraph with the text "Pedido", go up to its parent element (the order block)
    // and inside it, look specifically for the <p> that contains the code "VLO-U9BW56".
    // This ensures we are checking the correct code within the correct section.
    // const orderCode = page.locator('//p[text()="Pedido"]/..//p[text()="VLO-U9BW56"]');
    // await expect(orderCode).toBeVisible();

    // Alternative using Playwright locators instead of pure XPath:
    // 1) Find the paragraph (or equivalent element) that contains the text "Pedido"
    // 2) Go up to its parent element (the "Pedido" header container)
    // 3) Check if this container contains the code text "VLO-U9BW56"
    // This way we test the label ("Pedido") + value (code) relationship without relying on text() in XPath.
    const containerPedido = page.getByRole('paragraph')
      .filter({ hasText: /^Pedido$/ })
      .locator('..'); // go up to the parent element of "Pedido"
    await expect(containerPedido).toContainText(testData.orderCode, { timeout: 10_000 });

    await expect(page.getByText(testData.orderStatus)).toBeVisible();

    const statusBadge = page.getByRole('status').filter({ hasText: testData.orderStatus })
    await expect(statusBadge).toHaveClass(/bg-green-100 text-green-700/);
    const statusIcon = statusBadge.locator('svg');
    await expect(statusIcon).toHaveClass(/lucide-circle-check-big/);
  });

  test('Should verify an non existing order', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    // testData
    const testData = {
      orderCode: generateOrderNumber(),
      orderWarning: 'Pedido não encontrado',
      orderNotFound: 'Verifique o número do pedido e tente novamente',
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente`);

  });

  test('Should verify an approved order with snapshot', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    const testData = {
      orderCode: 'VLO-U9BW56',
      orderStatus: 'APROVADO',
      carColor: 'Glacier Blue',
      customerName: 'Yarlei Cruz',
      customerEmail: 'yarlei@cruz.com.br',
      customerStore: 'Velô Paulista',
      customerOrderDate: '01/01/2026',
      paymentMethod: 'À Vista',
    };

    // Act  
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
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

    const statusBadge = page.getByRole('status').filter({ hasText: testData.orderStatus })
    await expect(statusBadge).toHaveClass(/bg-green-100 text-green-700/);
    const statusIcon = statusBadge.locator('svg');
    await expect(statusIcon).toHaveClass(/lucide-circle-check-big/);

  });

  test('Should verify an reproved order with snapshot', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    // testData
    const testData = {
      orderCode: 'VLO-DVVKQC',
      orderStatus: 'REPROVADO',
      carColor: 'Midnight Black',
      customerName: 'Jaci Teixeira',
      customerEmail: 'jaciteixera@velo.com',
      customerStore: 'Velô Paulista',
      customerOrderDate: '01/01/2026',
      paymentMethod: 'À Vista',
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
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

    const statusBadge = page.getByRole('status').filter({ hasText: testData.orderStatus })
    await expect(statusBadge).toHaveClass(/bg-red-100 text-red-700/);
    const statusIcon = statusBadge.locator('svg');
    await expect(statusIcon).toHaveClass(/lucide-circle-x/);

  });

  test('Should verify an non existing order with snapshot', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    // testData
    const testData = {
      orderCode: generateOrderNumber(),
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
    await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `);
  });

  test('Should verify an order in analysis', async ({ page }) => {
    const consultaPedidoPage = new ConsultaPedidoPage(page);
    // testData
    const testData = {
      orderCode: 'VLO-FAFYGC',
      orderStatus: 'EM_ANALISE',
      carColor: 'Lunar White',
      wheelType: 'sport Wheels',
      customerName: 'Luiz Cruz',
      customerEmail: 'Luiz@velo.com',
      customerStore: 'Velô Paulista',
      paymentMethod: 'À Vista',
    };

    // Act
    await consultaPedidoPage.searchOrder(testData.orderCode);

    // Assert
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

    const statusBadge = page.getByRole('status').filter({ hasText: testData.orderStatus })
    await expect(statusBadge).toHaveClass(/bg-amber-100 text-amber-700/);
    const statusIcon = statusBadge.locator('svg');
    await expect(statusIcon).toHaveClass(/lucide-clock/);

  });
})