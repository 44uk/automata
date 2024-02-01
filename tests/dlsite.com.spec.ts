import { expect, test } from '@playwright/test';
import { randomNumber, randomScroll, randomWait, removeCookies, scrollInto } from '../util';

const {
  DLSITE_ID,
  DLSITE_PW,
} = process.env

const BASE_URL = "https://www.dlsite.com/"

test.use({ baseURL: BASE_URL });

test('click DLSite farm', async ({ browser }) => {
  const context = await browser.newContext({})
  context.addCookies([])
  const page = await context.newPage()

  await page.goto('/')
  await randomScroll(page)

  if(await page.$('//ul[@class="utility_menu"]/li[@class="type-login"]/a/i[@class="_loggedIn"][contains(@style, "display: none")]')) {
    await page.getByRole('link', { name: 'ログイン' }).click();
    await expect(page).toHaveURL(/login/);

    await page.type("form input[name='login_id']", DLSITE_ID!, { delay: randomNumber(100, 300) });
    await page.type("form input[name='password']", DLSITE_PW!, { delay: randomNumber(100, 300) });
    await page.getByRole('button', { name: 'ログイン' }).click()
  } else {
    await page.getByRole('link', { name: 'マイページ' }).click();
  }

  await expect(page).toHaveURL(/mypage/)
  await randomScroll(page);

  await scrollInto(page, '//div[@id="dl_farm"]');
  await page.click('#dl_farm .dl_farm_main');

  await page.waitForTimeout(15 * 1000);

  // await removeCookies(await page.context(), [
  //   'xxxxxxxxxxxx',
  //   'xxxxxxxxxxxx',
  //   'xxxxxxxxxxxx',
  // ]);

  await page.context().storageState({ path: 'state.json' });
});
