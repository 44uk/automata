import { expect, test } from "@playwright/test";
import { downScroll, randomScroll, upScroll } from "../lib/helpers";
import { login } from "../lib/x/helpers";

const BASE_URL = "https://x.com";

test.use({ baseURL: BASE_URL });

const USERNAME = "KakusanShoujo_C";
const PASSWORD = "@TWkur37koa";
const WAVE_COUNT = 3;

test("unfollow a not follow back user.", async ({ browser }) => {
  const context = await browser.newContext({
    storageState: `state-${USERNAME}.json`,
  });
  const page = await context.newPage();

  await page.goto("/followers");
  await page.waitForLoadState("load");

  if (await page.getByTestId("loginButton").isVisible()) {
    console.debug("Login...");
    await login(page, USERNAME, PASSWORD);
    await page.context().storageState({ path: `state-${USERNAME}.json` });
  } else {
    expect(page.url()).toMatch(/followers/);
    console.debug("Already Logged in.");
  }
  await page.goto("/followers");
  await page.setViewportSize({ width: 960, height: 3200 });
  await downScroll(page, { try: 10 });

  for (let i = 1; i <= WAVE_COUNT; i++) {
    const userCellsLoc = await page.locator('//div[@data-testid="cellInnerDiv"][(div//button[contains(@aria-label, "フォローバック")])]');
    console.debug(`Try to block a not follow back users. ${await userCellsLoc.count()}`);
    for (const userCell of await userCellsLoc.all()) {
      // const suspiciousKeywords = ['お金配り', 'せふ'];
      // const suspiciousUserLocator = `*[contains(text(), '${suspiciousKeywords.join("') or contains(text(), '")}')]`;
      // console.debug(`suspiciousUserLocator: ${suspiciousUserLocator}`);
      // if( await userCellLoc.locator(suspiciousUserLocator).count() === 0) {
      //   console.debug(`This may be safe user. (${i})`);
      //   continue;
      // }

      await userCell.getByLabel("もっと見る").last().click({ force: true });
      await page.getByTestId("Dropdown").getByTestId("block").last().click({ force: true });
      await page.waitForTimeout(400);
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
  await page.context().storageState({ path: `state-${USERNAME}.json` });
});
