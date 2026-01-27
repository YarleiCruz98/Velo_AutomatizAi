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
  await page.getByTestId('search-order-button').click();
  // Assert
  await expect(page.getByTestId('order-result-id')).toBeVisible();
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-U9BW56');
  await expect(page.getByTestId('order-result-status')).toBeVisible();
  await expect(page.getByTestId('order-result-status')).toHaveText('APROVADO');
});