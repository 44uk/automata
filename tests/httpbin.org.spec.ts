import { test } from '@playwright/test';

const baseURL = 'https://httpbin.org/ip';

test.use({ ...test.use, ...{
  baseURL,
  // proxy: {
  //   server: 'http://p.webshare.io:80',
  //   username: 'krunnwba-rotate',
  //   password: '03v9e64h7o13',
  // }
}})

test('httpbin', async ({ browser }) => {
  const context = await browser.newContext({
    // proxy: {
    //   server: 'http://p.webshare.io:80',
    //   username: 'krunnwba-rotate',
    //   password: '03v9e64h7o13',
    // }
  });
  context.addCookies([]);

  const page = await context.newPage();
  // page.setDefaultTimeout(10 * 1000);
  // page.setDefaultNavigationTimeout(10 * 1000);
  await page.goto('/ip');
  await page.waitForTimeout(1000 * 30);

  await page.getByText('HOME', {}).click({modifiers: ['Meta']});
});
