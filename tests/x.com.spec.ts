import { expect, test } from "@playwright/test";
import { naturalScroll, naturalWait, randomNumber } from "../lib/helpers";
import { login } from "../lib/x/helpers";

const BASE_URL = "https://x.com";

test.use({ baseURL: BASE_URL });
test.setTimeout(3 * 60 * 60 * 1000);

test("automate RT/Fav", async ({ browser }) => {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;
  if (!username) {
    throw new Error("USERNAME environment variable is required");
  }
  if (!password) {
    throw new Error("PASSWORD environment variable is required");
  }
  const context = await browser.newContext({
    storageState: `state-${username}.json`,
  });
  const page = await context.newPage();

  await page.goto("/");
  await page.waitForLoadState("load");

  if (await page.getByTestId("loginButton").isVisible()) {
    console.debug("Login...");
    await login(page, username, password);
    await page.context().storageState({ path: `state-${username}.json` });
  } else {
    expect(page.url()).toMatch(/home/);
    console.debug("Already Logged in.");
  }

  // https://qiita.com/ryo_hisano/items/9f15ae87d691d497bc17

  let counter = 20;
  await naturalWait(page);
  while (counter > 0) {
    // リプライする：27
    // リプライに投稿者が返信/いいね/リツイートする：75
    try {
      await naturalScroll(page, "down");

      await page.waitForSelector('//div[@data-testid="cellInnerDiv"]');
      await naturalWait(page);
      // console.debug("Find video tweet.");
      // await page.waitForSelector('//div[@data-testid="cellInnerDiv"][div//div[@data-testid="videoComponent"]]//article');
      await page.waitForSelector('//div[@data-testid="cellInnerDiv"]//article');

      // ツイートをクリックし、「いいね」かリツイートする：11
      console.debug("Pick a tweet.");
      // const videoTweetsLoc = await page.locator(
      //   '//div[@data-testid="cellInnerDiv"][div//div[@data-testid="videoComponent"]]//article//time',
      // );
      const tweetsLoc = await page.locator('//div[@data-testid="cellInnerDiv"]//article//time');
      tweetsLoc.last().click({ force: true });
      await naturalWait(page);
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
      if ([0, 1, 2, 3].includes(randomNumber(0, 9))) {
        console.debug("Waiting for 2min.");
        await naturalScroll(page, "down");
        await page.waitForTimeout(2 * 60 * 1000);
        await naturalScroll(page, "up");
      }

      // いいね：0.5
      if ((await page.getByTestId("unlike").count()) > 0) {
        console.debug("Already Favored.");
      } else {
        console.debug("Try to Favored.");
        await page.getByTestId("like").first().click();
        await naturalWait(page);
      }

      // リツイート：1
      if ((await page.getByTestId("unretweet").count()) > 0) {
        console.debug("Already Re-posted.");
      } else {
        console.debug("Try to Re-post.");
        if (randomNumber(1, 6) === 1) {
          await page.getByTestId("retweet").first().click();
          await naturalWait(page);
          console.debug("Try to Re-post confirm.");
          await page.getByTestId("retweetConfirm").click();
          await naturalWait(page);
        } else {
          console.debug("Skip to Re-post.");
        }
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
      await naturalWait(page);
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
  // await page.context().storageState({ path: "state.json" });
  await page.context().storageState({ path: `state-${username}.json` });
});

// test('test', async ({ page }) => {
//   await page.goto('https://x.com/');
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
