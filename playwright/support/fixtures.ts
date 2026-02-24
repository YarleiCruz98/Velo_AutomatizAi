import { test as base } from '@playwright/test';
import { createHomeActions } from './actions/homeActions';
import { createNavbarActions } from './actions/navbarActions';
import { createOrderLookupActions } from './actions/orderLookupActions';

export type App = {
  home: ReturnType<typeof createHomeActions>;
  navbar: ReturnType<typeof createNavbarActions>;
  orderLookup: ReturnType<typeof createOrderLookupActions>;
};

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      home: createHomeActions(page),
      navbar: createNavbarActions(page),
      orderLookup: createOrderLookupActions(page),
    };

    await use(app);
  },
});

export { expect } from '@playwright/test';

