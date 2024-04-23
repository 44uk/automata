import { test, expect } from "@playwright/test";
import { downScroll, randomNumber, randomScroll, randomWait } from "../util";

const BASE_URL = "https://twitter.com";

test.use({ baseURL: BASE_URL });
test.setTimeout(60 * 60 * 1000);

// const USERNAME = 'gngn60';
// const USERNAME = 'kuuuuuuuuune';
// const PASSWORD = 'mhr28hua';
// const USERNAME = 'KakusanShoujo_A';
// const PASSWORD = '@TWkur37koa';
const USERNAME = "_maid_h_";
const PASSWORD = "@TWkur37koa";

test("automate RT/Fav", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: `state-${USERNAME}.json`,
  });
  const page = await context.newPage();

  // await page.goto(`/search?q=from%3Agngn60%20filter%3Anativeretweets&src=typed_query&f=live`);
  await page.goto(`/`);
  await page.waitForLoadState("load");

  if (await page.getByTestId("loginButton").isVisible()) {
    console.debug("Login...");
    // SignIn
    await page.getByTestId("loginButton").click();
    page.waitForTimeout(1000);

    await page.getByLabel("電話番号/メールアドレス/ユーザー名").type(USERNAME, { delay: randomNumber(50, 100) });
    page.waitForTimeout(1000);
    await page.getByLabel("電話番号/メールアドレス/ユーザー名").press("Enter");

    await page.getByLabel("パスワード", { exact: true }).type(PASSWORD, { delay: randomNumber(50, 100) });
    page.waitForTimeout(1000);
    await page.getByLabel("パスワード", { exact: true }).press("Enter");
    // await page.getByLabel('ログイン').click();

    page.waitForTimeout(2000);

    await page.goto(`/`);

    await page.context().storageState({ path: `state-${USERNAME}.json` });
  } else {
    expect(page.url()).toMatch(new RegExp(USERNAME));
    console.debug("Already Logged in.");
  }
  console.debug("Starting...");

  await page.goto(`/${USERNAME}`);
  await page.waitForLoadState("load");

  // https://qiita.com/ryo_hisano/items/9f15ae87d691d497bc17

  const usernames = [];
  let counter = 5 * 10;
  // await downScroll(page, { try: 3 * 100 });
  await randomScroll(page);
  while (counter > 0) {
    try {
      await downScroll(page, { try: 3 });

      await page.waitForSelector('//div[@data-testid="cellInnerDiv"]');

      for (let i = 0; i < 10; i++) {
        console.debug("Try to delete Tweet.");
        await downScroll(page, { try: 3 });

        await page
          .getByTestId("caret")
          .last()
          .click({ timeout: 1000 })
          .catch((_) => false);
        await page.waitForTimeout(300);
        const del = await page
          .getByTestId("Dropdown")
          .locator('span[.="削除"]')
          .click({ timeout: 1000, force: true })
          .catch((_) => false);
        await page.waitForTimeout(200);
        if (del === false) {
          continue;
        }
        await page
          .getByTestId("confirmationSheetConfirm")
          .click({ timeout: 1000 })
          .catch((_) => false);
        await page.waitForTimeout(200);

        // console.debug('Try to unFavorite.')
        // await page.getByTestId('unlike').last().click({ timeout: 1000 }).catch(_ => false);
        // await page.waitForTimeout(200);

        // await downScroll(page, { try: 3 });
        // await randomScroll(page, { try: 3 });

        // console.debug('Try to unRe-post.')
        // await page.getByTestId('unretweet').last().click({ timeout: 1000 }).catch(_ => false);
        // await page.waitForTimeout(300);
        // await page.getByTestId('unretweetConfirm').click({ timeout: 1000 }).catch(_ => false);
        // await page.waitForTimeout(200);
      }

      await randomScroll(page);

      counter--;
      await page.reload({});
    } catch (e) {
      console.debug(e);
      // await page.goto(`/search?q=from%3Agngn60%20filter%3Anativeretweets&src=typed_query&f=live`);
      await page.goto(`/${USERNAME}/likes`);
      expect(page.url()).toMatch(new RegExp(USERNAME));
      await page.waitForLoadState("load");
    } finally {
      console.debug("Go next.");
    }
  }

  await page.waitForTimeout(3 * 1000);
  await page.context().storageState({ path: `state-${USERNAME}.json` });
});
