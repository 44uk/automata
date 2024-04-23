import { expect, test } from "@playwright/test";
import { randomNumber, randomScroll, randomWait } from "../util";

const { SOKMIL_ID, SOKMIL_PW } = process.env;

const BASE_URL = "https://www.sokmil.com";

test.use({ baseURL: BASE_URL });

test("login bonus", async ({ browser }) => {
  const context = await browser.newContext({});
  context.addCookies([{ name: "AGEAUTH", value: "ok", domain: ".sokmil.com", path: "/" }]);
  const page = await context.newPage();

  await page.goto("/");
  await randomScroll(page);

  await page.click("a.is-tvod-av", {});
  await expect(page).toHaveURL(/av/);
  await randomScroll(page);

  if (await page.$("a.p-header-global__button--login")) {
    await page.click("a.p-header-global__button--login", {});
    await expect(page).toHaveURL(/member\/login/);
    await randomWait(page);

    await page.type('input[name="id"]', SOKMIL_ID!, {
      delay: randomNumber(100, 300),
    });
    await page.type('input[name="pw"]', SOKMIL_PW!, {
      delay: randomNumber(100, 300),
    });
    await page.press('input[name="pw"]', "Enter");
  }
  await randomScroll(page);

  await page.click("a.btn-header-my-bookmark", {});
  await expect(page).toHaveURL(/mypage\/bookmark/);
  await randomWait(page);

  await page.context().storageState({ path: "state.json" });
});
