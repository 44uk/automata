import { expect, test } from "@playwright/test";
import Chance from "chance";
import { shuffle } from "lodash";
import { randomNumber, randomScroll, randomWait, scrollInto } from "../lib/helpers";
import randomWordFromWikipedia from "../lib/randomWordFromWikipedia";

const { RAKUTEN_ID, RAKUTEN_PW } = process.env;

const BASE_URL = "https://kuji.rakuten.co.jp";

test.use({ baseURL: BASE_URL });

test("web kuji", async ({ browser }) => {
  const context = await browser.newContext({
    locale: "ja",
  });
  context.addCookies([]);
  const page = await context.newPage();

  await page.goto("/", { waitUntil: "load" });
  await randomScroll(page);

  // await page.click('//div[@id="topics-user"]//a[.="ログイン"]')
  // await expect(page).toHaveURL(/authorize/)

  // await page.type('form input[name="username"]', RAKUTEN_ID!, { delay: randomNumber(100, 300)})
  // await page.click('//form//div[@role="button"]/div/div[.="次へ"]')
  // await randomWait(page, 2)

  // await page.waitForSelector('form input[name="password"]')
  // await page.type('form input[name="password"]', RAKUTEN_PW!, { delay: randomNumber(100, 300)})
  // await page.click('//form//div[@role="button"]/div/div[.="ログイン"]')
  // await randomWait(page, 3)
  // await expect(page).toHaveURL(/SimpleTop/)

  try {
    await page.waitForSelector(".kuji_list");

    const selBase = ".kuji_list ul li a ";
    const selBanners = shuffle([
      "img[alt='楽天ペイ (オンライン決済)']",
      "img[alt='楽天ブックス']",
      "img[alt='楽天Infoseekニュース']",
      "img[alt='楽天保険の総合窓口']",
      "img[alt='楽天×ぐるなび']",
      "img[alt='楽天Car車検']",
      "img[alt='楽天レシピ']",
      "img[alt='楽天ビューティ']",
      "img[alt='楽天toto']",
      "img[alt='楽天×宝くじ']",
      "img[alt='楽天くじ広場']",
      "img[alt='楽天ウェブ検索']",
      "img[alt='楽天証券']",
      "img[alt='楽天不動産']",
      "img[alt='楽天ブログ']",
      "img[alt='Rakuten TV']",
      "img[alt='楽天Edy']",
      "img[alt='楽天ラクマ']",
    ]);

    for (const selBanner of selBanners) {
      const $banner = await page.$(selBase + selBanner);
      if (!$banner) continue;
      await $banner.click();
      console.log("Banner clicked: %s", selBanner);
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });

      await page.waitForTimeout(10 * 1000);
      if (chance.bool({ likelihood: 50 })) {
        await randomScroll(page);
      }

      const $go = await page.$("#kuji-10000 a");
      if ($go) {
        await $go.click();
        console.log("Go to Kuji clicked.");
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      }

      const $omikuji = await page.$(".kujihiroba-btn-01");
      if ($omikuji) {
        await $omikuji.click();
        console.log("Go to Omikuji clicked.");
        await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      }

      try {
        console.log("Play a lot.");
        await page.click("#lot", { delay: 100 });

        console.log("Start lot.");
        await page.waitForTimeout(30 * 1000);

        console.log("Maybe done.");
      } catch (error) {
        console.log("It already seem to have been done.");
      }
      if (chance.bool({ likelihood: 50 })) {
        await page.waitForTimeout(10 * 1000);
      }

      console.log("Back to list.");
      await page.goto(contentURL, { waitUntil: "domcontentloaded" });
      await page.waitForSelector(".kuji_list");
      await page.waitForTimeout(10 * 1000);
    }
    console.log("Kuji end.");
  } catch (error) {
    // if (!(error instanceof TimeoutError)) { throw error; }
    console.debug("Error! %o", error);
  }

  await page.waitForTimeout(5000 * 6);
});
