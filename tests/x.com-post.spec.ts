import path from "node:path";
import { expect, test } from "@playwright/test";
import { randomScroll, upScroll } from "../lib/helpers";
import { login } from "../lib/x/helpers";

const BASE_URL = "https://x.com";

test.use({ baseURL: BASE_URL });

const USERNAME = "KakusanShoujo_C";
const PASSWORD = "@TWkur37koa";

test("post.", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: `state-${USERNAME}.json`,
  });
  const page = await context.newPage();

  await page.goto("/home");
  await page.waitForLoadState("load");

  if (await page.getByTestId("loginButton").isVisible()) {
    console.debug("Login...");
    login(page, USERNAME, PASSWORD);

    // // SignIn
    // await page.getByTestId("loginButton").click();
    // await randomWait(page);

    // await page.getByLabel("電話番号/メールアドレス/ユーザー名").type(USERNAME, { delay: randomNumber(100, 200) });
    // await randomWait(page);
    // await page.getByLabel("電話番号/メールアドレス/ユーザー名").press("Enter");

    // await page.getByLabel("パスワード", { exact: true }).type(PASSWORD, { delay: randomNumber(100, 200) });
    // await randomWait(page);
    // await page.getByLabel("パスワード", { exact: true }).press("Enter");

    await page.context().storageState({ path: `state-${USERNAME}.json` });
  } else {
    expect(page.url()).toMatch(/home/);
    console.debug("Already Logged in.");
  }
  await page.goto("/home");
  await upScroll(page, { try: 5 });

  await page.getByTestId("fileInput").setInputFiles(path.join(__dirname, USERNAME, "/001.png"));
  await page.getByTestId("tweetTextarea_0").focus();
  await page.getByTestId("tweetTextarea_0").pressSequentially("おはよう！", { delay: 100 });
  await page.getByTestId("tweetButtonInline").click();

  // const notFollowBackLoc = await page.locator('//div[@data-testid="cellInnerDiv"][not(div//div[@data-testid="userFollowIndicator"])]');
  // for (let i = 1; i <= 100; i++) {
  //   console.debug(`Try to unfollow a not follow back user. (${i})`);
  //   await notFollowBackLoc
  //     .getByTestId(/\d+-unfollow/)
  //     .last()
  //     .click({ force: true });
  //   await page.waitForTimeout(250);
  //   await page.getByTestId("confirmationSheetConfirm").click({ force: true });
  //   console.debug("Unfollowed not follow back user.");

  //   if (i % 7 == 0) {
  //     await randomScroll(page, { try: 5 * 3 });
  //   } else if (i % 9 == 0) {
  //     await randomScroll(page, { try: 8 * 3 });
  //     await page.waitForTimeout(1000 * 10);
  //   } else {
  //     await downScroll(page, { try: 3 * 3 });
  //   }
  // }

  await page.waitForTimeout(250);
  await page.context().storageState({ path: `state-${USERNAME}.json` });
});
