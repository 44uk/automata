import { test, expect } from "@playwright/test";
import { downScroll, randomNumber, randomScroll, randomWait } from "../util";

const BASE_URL = "https://twitter.com";

test.use({ baseURL: BASE_URL });

const USERNAME = "kuuuuuuuuune";
// const USERNAME = 'gngn60';
const PASSWORD = "mhr28hua";

test("unfollow a not follow back user.", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: `state-${USERNAME}.json`,
  });
  const page = await context.newPage();

  await page.goto("/following");
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
    expect(page.url()).toMatch(/following/);
    console.debug("Already Logged in.");
  }

  await downScroll(page, { try: 10 });

  const notFollowBackLoc = await page.locator('//div[@data-testid="cellInnerDiv"][not(div//div[@data-testid="userFollowIndicator"])]');
  for (let i = 0; i < 500; i++) {
    console.debug("Try to unfollow a not follow back user.");
    await notFollowBackLoc
      .getByTestId(/\d+-unfollow/)
      .first()
      .click({ force: true });
    await page.waitForTimeout(200);
    await page.getByTestId("confirmationSheetConfirm").click({ force: true });
    await page.waitForTimeout(200);
    console.debug("Not follow back user.");
    await downScroll(page, { try: 3 });
  }

  await page.waitForTimeout(500);
  await page.context().storageState({ path: `state-${USERNAME}.json` });
});
