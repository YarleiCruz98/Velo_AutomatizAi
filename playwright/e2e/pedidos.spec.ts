import { test, expect } from '@playwright/test';
  // AAA Arrange Act Assert

test('Should verify an approved order', async ({ page }) => {
  // Arrange
  await page.goto('http://localhost:5173/');
  await expect(page.getByTestId('hero-section').getByRole('heading')).toContainText('Velô Sprint');
  await page.getByRole('link', { name: 'Consultar Pedido' }).click();
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido');
  
  // Act
  await page.getByLabel('Número do Pedido').fill('VLO-U9BW56');
  await page.getByRole('button', { name: 'Buscar Pedido' }).click();
  
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
  await expect(containerPedido).toContainText('VLO-U9BW56', {timeout: 10_000});

  await expect(page.getByText('APROVADO')).toBeVisible();
});