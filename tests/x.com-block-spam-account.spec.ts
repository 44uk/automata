import { expect, test } from "@playwright/test";
import { downScroll, randomScroll, upScroll } from "../lib/helpers";
import { login } from "../lib/x/helpers";

const BASE_URL = "https://x.com";
const WAVE_COUNT = 5;

test.use({ baseURL: BASE_URL });

test("unfollow a not follow back user.", async ({ browser }) => {
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

  await page.goto("/followers");
  await page.waitForLoadState("load");

  if (await page.getByTestId("loginButton").isVisible()) {
    console.debug("Login...");
    await login(page, username, password);
    await page.context().storageState({ path: `state-${username}.json` });
  } else {
    expect(page.url()).toMatch(/followers/);
    console.debug("Already Logged in.");
  }
  await page.goto("/followers");
  await page.setViewportSize({ width: 960, height: 800 });
  await downScroll(page, { try: 8 });

  for (let i = 1; i <= WAVE_COUNT; i++) {
    // const userCellsLoc = await page.locator('//div[@data-testid="cellInnerDiv"][(div//button[contains(@aria-label, "フォローバック")])]');
    const userCellsLoc = await page.locator('//div[@data-testid="cellInnerDiv"]');
    console.debug(`Try to block a not follow back users. ${await userCellsLoc.count()}`);

    const suspiciousKeywords = ['お金配り', 'せふ', '独身'];
    const suspiciousUserLocator = `xpath=div//*[contains(text(), '${suspiciousKeywords.join("') or contains(text(), '")}')]`;
    console.debug(`suspiciousUserLocator: ${suspiciousUserLocator}`);

    // for (const userCell of await userCellsLoc.all()) {
    //   if( await userCell.locator(suspiciousUserLocator).count() === 0) {
    //     continue;
    //   }
    //   console.debug(`Detect Suspicious user.`);
    //   await userCell.getByLabel("もっと見る").last().click({ force: true });
    //   await page.waitForTimeout(200);
    //   await page.getByTestId("Dropdown").getByTestId("mute").last().click({ force: true });
    //   await page.waitForTimeout(200);
    //   // await page.getByTestId("Dropdown").getByTestId("block").last().click({ force: true });
    //   // await page.getByTestId("confirmationSheetConfirm").click({ force: true });
    //   console.debug("Muted not follow back user.");
    //   await page.waitForTimeout(1000 * 2);
    // }

    for (const userCell of await userCellsLoc.all()) {
      await userCell.getByLabel("もっと見る").last().click({ force: true });
      await page.waitForTimeout(200);
      await page.getByTestId("Dropdown").getByTestId("block").last().click({ force: true });
      await page.waitForTimeout(200);
      await page.getByTestId("confirmationSheetConfirm").click({ force: true });
      console.debug("Blocked not follow back user.");
      await page.waitForTimeout(1000 * 2);
    }
    console.debug(`Finished found users. Go to next wave. (${i})`);

    if (i % 7 === 0) {
      await upScroll(page, { try: 3 * 3 });
    } else if (i % 9 === 0) {
      await downScroll(page, { try: 6 * 3 });
    } else {
      await randomScroll(page, { try: 5 * 3 });
    }
  }

  await page.waitForTimeout(250);
  await page.context().storageState({ path: `state-${username}.json` });
});
