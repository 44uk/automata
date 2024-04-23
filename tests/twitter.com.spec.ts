import { test, expect } from "@playwright/test";
import { randomNumber, randomScroll, randomWait } from "../util";

const BASE_URL = "https://twitter.com";

test.use({ baseURL: BASE_URL });
test.setTimeout(60 * 60 * 1000);

const USERNAME = "gngn60";
const PASSWORD = "mhr28hua";
// const USERNAME = 'KakusanShoujo_A';
// const PASSWORD = '@TWkur37koa';

test("automate RT/Fav", async ({ browser }) => {
  const context = await browser.newContext({});
  const page = await context.newPage();

  await page.goto("/");
  await page.waitForLoadState("load");

  if (await page.getByTestId("loginButton").isVisible()) {
    console.debug("Login...");
    // SignIn
    await page.getByTestId("loginButton").click();
    await randomWait(page);

    await page.getByLabel("電話番号/メールアドレス/ユーザー名").type(USERNAME, { delay: randomNumber(100, 200) });
    await randomWait(page);
    await page.getByLabel("電話番号/メールアドレス/ユーザー名").press("Enter");

    await page.getByLabel("パスワード", { exact: true }).type(PASSWORD, { delay: randomNumber(100, 200) });
    await randomWait(page);
    await page.getByLabel("パスワード", { exact: true }).press("Enter");

    await page.context().storageState({ path: `state-${USERNAME}.json` });
  } else {
    expect(page.url()).toMatch(/home/);
    console.debug("Already Logged in.");
  }

  // https://qiita.com/ryo_hisano/items/9f15ae87d691d497bc17

  const usernames = [];
  let counter = 5 * 10;
  await randomWait(page);
  while (counter > 0) {
    // リプライする：27
    // リプライに投稿者が返信/いいね/リツイートする：75
    try {
      await randomScroll(page);

      await page.waitForSelector('//div[@data-testid="cellInnerDiv"]');
      await randomWait(page, 1);
      console.debug("Find video tweet.");
      await page.waitForSelector('//div[@data-testid="cellInnerDiv"][div//div[@data-testid="videoComponent"]]//article');
      // await page.waitForSelector('//div[@data-testid="cellInnerDiv"]//article');

      // ツイートをクリックし、「いいね」かリツイートする：11
      console.debug("Open video tweet.");
      const videoTweetsLoc = await page.locator(
        '//div[@data-testid="cellInnerDiv"][div//div[@data-testid="videoComponent"]]//article//time',
      );
      // const videoTweetsLoc = await page.locator('//div[@data-testid="cellInnerDiv"]//article//time');
      videoTweetsLoc.last().click({ force: true });
      await randomWait(page, 1);
      expect(page.url()).toMatch(/status\/\d+/);

      // フォロー済みであるか
      if ((await page.getByTestId(/\d+-unfollow/).count()) === 0) {
        console.debug("Not followed.");
      }

      // フォローされているか
      if ((await page.getByTestId("userFollowIndicator").count()) === 0) {
        console.debug("Not followed by.");
      }

      // ツイートに2分間とどまる：11
      if (randomNumber(0, 9) === 0) {
        console.debug("Waiting for 2min.");
        await page.waitForTimeout(2 * 60 * 1000);
      }

      // いいね：0.5
      if ((await page.getByTestId("unlike").count()) > 0) {
        console.debug("Already Favorited.");
      } else {
        console.debug("Try to Favorite.");
        await page.getByTestId("like").first().click();
        await randomWait(page, 1);
      }

      // リツイート：1
      if ((await page.getByTestId("unretweet").count()) > 0) {
        console.debug("Already Re-posted.");
      } else {
        console.debug("Try to Re-post.");
        await page.getByTestId("retweet").first().click();
        await page.waitForTimeout(500);
        console.debug("Try to Re-post confirm.");
        await page.getByTestId("retweetConfirm").click();
        await randomWait(page, 1);
      }

      // ブックマーク
      // if(await page.getByTestId('removeBookmark').count() > 0) {
      //   console.debug('Already booked.')
      // } else {
      //   console.debug('Try to book.')
      //   await page.getByTestId('bookmark').click();
      //   await randomWait(page, 1);
      // }

      // ツイートに「いいね」かリプライし、投稿者のプロフィールを見に行く:12
      console.debug("Try to open User Profile.");
      await page.getByTestId("User-Name").locator("//a").first().click();
      await randomWait(page, 1);
      expect(page.url()).toMatch(/[0-9a-zA-Z_]{1,15}/);

      // 戻る
      console.debug("Try to back to timeline.");
      await page.getByTestId("app-bar-back").click();
      await page.getByTestId("app-bar-back").click();
      // await downScroll(page, { try: 10 });

      // カウンター消費
      counter--;
    } catch (e) {
      console.debug(e);
    } finally {
      await page.goto("/");
      expect(page.url()).toMatch(/home/);
      await page.waitForLoadState("load");
      console.debug("Go next tweet.");
    }
  }

  // if(await page.$('//span[contains(text(), "件のポストを表示")]')) {
  //   await page.click('//span[contains(text(), "件のポストを表示")]', { delay: randomNumber(100, 300) })
  // }

  // https://note.com/maddogmtg/n/n2b9b48540149

  await page.waitForTimeout(3 * 1000);
  await page.context().storageState({ path: `state-${USERNAME}.json` });
});

// test('test', async ({ page }) => {
//   await page.goto('https://twitter.com/');
//   await page.getByTestId('loginButton').click();
//   await page.getByLabel('電話番号/メールアドレス/ユーザー名').click();
//   await page.getByLabel('電話番号/メールアドレス/ユーザー名').fill('gngn60');
//   await page.getByLabel('電話番号/メールアドレス/ユーザー名').press('Enter');
//   await page.getByLabel('パスワード', { exact: true }).fill('mhr28hua');
//   await page.getByLabel('パスワード', { exact: true }).press('Enter');
//   await page.getByLabel('138').click();
//   await page.getByLabel('138').click();
//   await page.locator('article > div > div > div:nth-child(2) > div').first().click();
//   await page.getByLabel('いいね', { exact: true }).click();
//   await page.getByLabel('リポスト', { exact: true }).click();
//   await page.getByText('リポスト').click();
//   await page.getByTestId('bookmark').click();
//   await page.getByTestId('app-bar-back').click();
//   await page.getByTestId('primaryColumn').getByTestId('UserAvatar-Container-Mozarina1377').locator('a').click();
// });
