import { Page } from "@playwright/test"

export class ConsultaPedidoPage {
    constructor(private page: Page) {}
  
    async searchOrder(orderNumber: string) {
      await this.page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderNumber)
      await this.page.getByRole('button', { name: 'Buscar Pedido' }).click()
    }
  } 