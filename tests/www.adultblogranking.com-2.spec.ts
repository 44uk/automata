import { BrowserContext, expect, test } from '@playwright/test';
import { randomScroll, randomNumber, randomWait, scrollInto } from '../util';
import { Chance } from 'chance';

const {
  ADULTBLOGRANKING_ID,
  ADULTBLOGRANKING_PW
} = process.env;

const baseURL = "http://www.adultblogranking.com";

test.use({
  baseURL,
  proxy: {
    server: 'http://krunnwba-rotate:03v9e64h7o13@p.webshare.io:80'
  },
});

test('Click links', async ({ browser }) => {
  const context = await browser.newContext({});
  context.addCookies([
    { name: "checkAge", value: "1", domain: "www.adultblogranking.com", path: "/" },
  ]);
  const page = await context.newPage();
  await page.goto('/');

  // await page.goto('https://maid-h.com/');
  // await page.getByRole('button', { name: 'はい' }).click();
  // await page.waitForTimeout(1000 * 10)
  // await page.getByRole('link', { name: 'アダルトブログランキング', exact: true }).click();
  // await page.waitForTimeout(1000 * 10)
  // await page.getByRole('link', { name: 'は い' }).click();
  // await page.waitForTimeout(1000 * 10)
  // await page.getByRole('link', { name: 'ログイン' }).click();
  // await page.waitForTimeout(1000 * 10)

  const categoryLinks = await page.locator('//div[contains(@class, "category")]//ul/li/a').all();
  const chance = new Chance();
  const index = chance.integer({ min: 1, max: categoryLinks.length}) - 1;
  await categoryLinks[index].click();
  await randomScroll(page);

  if (await page.getByRole('link', { name: 'ログイン', exact: true }).isVisible()) {
    await page.getByRole('link', { name: 'ログイン', exact: true }).click();
    await expect(page).toHaveURL(/login/);

    await page.fill('form input[name="id"]', '', {});
    await page.fill('form input[name="pswd"]', '', {});
    await page.type('form input[name="id"]', ADULTBLOGRANKING_ID!, { delay: randomNumber(100, 200)});
    await page.type('form input[name="pswd"]', ADULTBLOGRANKING_PW!, { delay: randomNumber(100, 200)});
    await page.press('input[name="pswd"]', 'Enter');
    await randomScroll(page);
  } else {
    await page.locator('#svc-header').getByRole('link', { name: 'マイページ' }).click();
  }

  // if(/login/.test(page.url())) {
  //   await page.type('form input[name="id"]', ADULTBLOGRANKING_ID!, { delay: randomNumber(100, 300)})
  //   await page.type('form input[name="pswd"]', ADULTBLOGRANKING_PW!, { delay: randomNumber(100, 300)})
  //   await page.press('input[name="pswd"]', 'Enter')
  //   await randomScroll(page)
  // }

  await expect(page).toHaveURL(/my/);
  await randomScroll(page);
  await page.waitForSelector(".roulette");

  if(await page.$(".roulette .new")) {
    await scrollInto(page, ".roulette");
    await page.click(".roulette .new");
    console.info("Run roulette!");
    await page.waitForTimeout(1000 * 10);
  } else {
    console.info("Already Done today.");
  }

  await randomWait(page);

  await page.context().storageState({ path: 'state.json' });
});
