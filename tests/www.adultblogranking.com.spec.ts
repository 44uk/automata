import { expect, test } from "@playwright/test";
import UserAgents from "user-agents";
import { humanTypeText, naturalScroll, naturalWait, randomNumber, randomScroll, randomWait, scrollInto } from "../lib/helpers";

const { ADULTBLOGRANKING_ID, ADULTBLOGRANKING_PW } = process.env;

const BASE_URL = "http://www.adultblogranking.com";

test.use({ baseURL: BASE_URL });

const userAgent = new UserAgents({
  deviceCategory: "desktop",
}).toString();

test("play roulette", async ({ browser }) => {
  const context = await browser.newContext({
    userAgent,
    locale: "ja,en-US;q=0.7,en;q=0.3",
    viewport: { width: 1080, height: 720 },
    ignoreHTTPSErrors: true,
  });
  context.addCookies([{ name: "checkAge", value: "1", domain: "www.adultblogranking.com", path: "/" }]);
  const page = await context.newPage();

  await page.goto("/ranking/9900");
  await page.waitForLoadState("load");
  await naturalScroll(page, "down");

  if (await page.getByRole("link", { name: "ログイン", exact: true }).isVisible()) {
    await page.getByRole("link", { name: "ログイン", exact: true }).click();
    await expect(page).toHaveURL(/login/);

    await page.fill('form input[name="id"]', "", {});
    await page.fill('form input[name="pswd"]', "", {});
    await humanTypeText(page, 'form input[name="id"]', ADULTBLOGRANKING_ID!);
    await humanTypeText(page, 'form input[name="pswd"]', ADULTBLOGRANKING_PW!);
    // await page.type('form input[name="id"]', ADULTBLOGRANKING_ID!, {
    //   delay: randomNumber(100, 200),
    // });
    // await page.type('form input[name="pswd"]', ADULTBLOGRANKING_PW!, {
    //   delay: randomNumber(100, 200),
    // });
    await page.press('input[name="pswd"]', "Enter");
    await naturalScroll(page, "down");
  } else {
    await page.locator("#svc-header").getByRole("link", { name: "マイページ" }).click();
  }

  // if(/login/.test(page.url())) {
  //   await page.type('form input[name="id"]', ADULTBLOGRANKING_ID!, { delay: randomNumber(100, 300)})
  //   await page.type('form input[name="pswd"]', ADULTBLOGRANKING_PW!, { delay: randomNumber(100, 300)})
  //   await page.press('input[name="pswd"]', 'Enter')
  //   await randomScroll(page)
  // }

  await expect(page).toHaveURL(/my/);
  await naturalScroll(page, "down");

  await page.waitForSelector(".roulette");
  if (await page.$(".roulette .new")) {
    await scrollInto(page, ".roulette");
    await page.click(".roulette .new");
    console.info("Run roulette!");
    await page.waitForTimeout(1000 * 8);
    console.info("Maybe done.");
  } else {
    console.info("Already Done today.");
  }

  if (process.env.PING) {
    console.info("Start Pinging.");
    await page.goto("/my/ping");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Pingを送信する" }).click();
    await page.waitForTimeout(4000);
    await page.getByRole("button", { name: "閉じる" }).click();
    console.info("Ping completed.");
  }

  await naturalWait(page);

  await page.getByRole("link", { name: "ログアウト" }).click();

  await naturalWait(page);

  await page.context().storageState({ path: "state.json" });
});
