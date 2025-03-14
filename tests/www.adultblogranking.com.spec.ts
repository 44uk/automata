import { expect, test } from "@playwright/test";
import { Chance } from "chance";
import UserAgents from "user-agents";

import { keepCookies, randomNumber, randomScroll, randomWait, removeCookies, scrollInto } from "../lib/helpers";

const { ADULTBLOGRANKING_ID, ADULTBLOGRANKING_PW } = process.env;

const userAgent = new UserAgents({
  deviceCategory: "desktop",
}).toString();
const baseURL = "http://www.adultblogranking.com";

// test.use({ baseURL });

test("play roulette", async ({ browser }) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 720 },
    userAgent,
    locale: "ja,en-US;q=0.7,en;q=0.3",
    ignoreHTTPSErrors: true,
  });
  context.addCookies([
    {
      name: "checkAge",
      value: "1",
      domain: "www.adultblogranking.com",
      path: "/",
    },
  ]);
  const page = await context.newPage();
  await page.goto("/ranking/9900");

  // await page.goto('https://maid-h.com/');
  // await page.getByRole('button', { name: 'はい' }).click();
  // await page.waitForTimeout(1000 * 10)
  // await page.getByRole('link', { name: 'アダルトブログランキング', exact: true }).click();
  // await page.waitForTimeout(1000 * 10)
  // await page.getByRole('link', { name: 'は い' }).click();
  // await page.waitForTimeout(1000 * 10)
  // await page.getByRole('link', { name: 'ログイン' }).click();
  // await page.waitForTimeout(1000 * 10)

  // const categoryLinks = await page.locator('//div[contains(@class, "category")]//ul/li/a').all();
  // const chance = new Chance();
  // const index = chance.integer({ min: 1, max: categoryLinks.length }) - 1;
  // await categoryLinks[index].click();
  // await randomScroll(page, { try: 2 });
  await randomScroll(page, { try: 5 });

  if (await page.getByRole("link", { name: "ログイン", exact: true }).isVisible()) {
    await page.getByRole("link", { name: "ログイン", exact: true }).click();
    await expect(page).toHaveURL(/login/);

    await page.fill('form input[name="id"]', "", {});
    await page.fill('form input[name="pswd"]', "", {});
    await page.type('form input[name="id"]', ADULTBLOGRANKING_ID!, {
      delay: randomNumber(100, 200),
    });
    await page.type('form input[name="pswd"]', ADULTBLOGRANKING_PW!, {
      delay: randomNumber(100, 200),
    });
    await page.press('input[name="pswd"]', "Enter");
    await randomScroll(page, { try: 2 });
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
  await randomScroll(page, { try: 2 });

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

  await randomWait(page, 3);

  await page.getByRole("link", { name: "ログアウト" }).click();

  await randomWait(page, 2);

  await page.context().storageState({ path: "state.json" });
});
