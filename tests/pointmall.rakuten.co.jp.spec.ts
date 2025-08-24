import { expect, test } from "@playwright/test";
import { randomNumber, randomScroll, randomWait, scrollInto } from "../lib/helpers";

const { RAKUTEN_ID, RAKUTEN_PW } = process.env;

const BASE_URL = "https://pointmall.rakuten.co.jp";

test.use({
  baseURL: BASE_URL,
});

test("pointmall", async ({ browser }) => {
  const context = await browser.newContext({
    locale: "ja",
  });
  context.addCookies([]);
  const page = await context.newPage();

  await page.goto("/");

  // オーバーレイを閉じる
  await randomScroll(page, { try: 3 });
  if ((await page.locator(".karte-close").count()) > 0) {
    await page.locator(".karte-close").click({ delay: 1000 });
  }

  if (await page.$("#header__login")) {
    await page.click('//li[@id="header__login"]/a[.="ログイン"]');

    if (/authorize/.test(page.url())) {
      await expect(page).toHaveURL(/authorize/);

      await page.locator('form input[name="username"]').pressSequentially(RAKUTEN_ID!, {
        delay: randomNumber(100, 300),
      });
      await page.click('//form//div[@role="button"]/div/div[.="次へ"]');
      await randomWait(page, 2);

      await page.waitForSelector('form input[name="password"]');
      await page.locator('form input[name="password"]').pressSequentially(RAKUTEN_PW!, {
        delay: randomNumber(100, 300),
      });
      await page.click('//form//div[@role="button"]/div/div[.="ログイン"]');
      await randomWait(page, 3);
    }

    await randomScroll(page);
    await expect(page).toHaveURL(/pointmall\.rakuten\.co\.jp/);
  }
  await page.goto("/");

  // 抽選券のクリック
  try {
    console.debug("Start Banner Clicking.");
    await page.waitForSelector(".dreamkuji-list", { state: "visible" });
    await randomScroll(page);

    const banners = await page.$$(".dreamkuji-list > .dreamkuji-item > a");
    console.debug("Banners found: %d", banners.length);
    for (let i = 0; i < banners.length; i++) {
      const banner = banners[i];
      await banner.click({ delay: 100 });
      console.debug("Clicked index: %d", i);
      await page.waitForTimeout(10 * 1000);
      await page.bringToFront();
    }
  } catch (error) {
    // if (!(error instanceof TimeoutError)) { throw error; }
    console.debug("Error! %o", error);
  }

  try {
    console.debug("Start Mail");
    await page.getByText("メールで貯める").click();
    await page.getByRole("link", { name: /メールボックス/, includeHidden: true }).click();

    if (/session\/upgrade/.test(page.url())) {
      await expect(page).toHaveURL(/session\/upgrade/);

      // await page.locator('form input[name="username"]').pressSequentially(RAKUTEN_ID!, { delay: randomNumber(100, 300)})
      // await page.click('//form//div[@role="button"]/div/div[.="次へ"]')
      // await randomWait(page, 2)

      await page.waitForSelector('form input[name="password"]');
      await page.locator('form input[name="password"]').pressSequentially(RAKUTEN_PW!, {
        delay: randomNumber(100, 300),
      });
      await page.click('//form//div[@role="button"]/div/div[.="次へ"]');
      await randomWait(page, 3);
    }
    await expect(page).toHaveURL(/pointmail\.rakuten\.co\.jp\/box/);
    await randomScroll(page);

    // await page.getByText('未読').click();
    await page.getByRole("link", { name: "未読" }).click();
    await randomScroll(page);

    if (!(await page.$('//div[@class="mailboxBox"]/ul/li[contains(@class, "unread")][1]/div[@class="listCont"]/a'))) {
      throw "No unread mails.";
    }

    await page.click('//div[@class="mailboxBox"]/ul/li[contains(@class, "unread")][1]/div[@class="listCont"]/a');
    for (let i = 16; i > 0; --i) {
      await randomScroll(page);
      scrollInto(page, '//div[@id="mailContents"]//div[@class="mailbox"]//a[contains(@href, "pmrd")]');
      const banner =
        (await page.$('//div[@id="mailContents"]//div[@class="mailbox"]//*[@class="point_url"]//a')) ||
        (await page.$('//div[@id="mailContents"]//div[@class="mailbox"]//img[contains(@alt, "抽せん券をGET")]'));
      if (banner) {
        console.debug("Banner found and Open!");
        await banner.click({ delay: 100 });
        await randomWait(page, 8);
        await page.bringToFront();
      } else {
        console.debug("Banner not found...");
        await randomWait(page, 8);
      }
      await randomWait(page, 4);

      // 次のメールへ
      console.debug("Mail crawl count left: %d", i);
      scrollInto(page, '//div[@id="mailContents"]//div[@class="bottomCont"]//div[@class="pager"]//li[contains(@class, "next")]');
      await page.click('//div[@id="mailContents"]//div[@class="bottomCont"]//div[@class="pager"]//li[contains(@class, "next")]');
    }
  } catch (error) {
    // if (!(error instanceof TimeoutError)) { throw error; }
    console.debug("Error! %o", error);
  } finally {
    await page.goto("/");
  }

  // // ビンゴ
  // try {
  //   console.debug("Start BINGO");
  //   await page.getByRole("link", { name: "BINGO", exact: true }).click();
  //   await expect(page).toHaveURL(/game\/bingo/);
  //   await randomWait(page, 3);

  //   await page.bringToFront();
  //   const startButton = await page.getByRole("link", { name: "今すぐスタート！" });
  //   console.debug("BINGO Clicked Start button");
  //   console.debug(await startButton.count());
  //   startButton.click({ timeout: 5000 });
  //   // await page.click("#main .lp-header-btn", { delay: 100 });
  //   await page.bringToFront();

  //   await randomScroll(page);
  //   await page.waitForSelector("#bingocard", { state: "visible" });

  //   if (await page.$("#video-add-modal")) {
  //     console.debug("BINGO Play Ad");
  //     await page.$eval("#video-add-modal-play-btn", (el) => (el as HTMLLIElement).click());
  //     await page.waitForTimeout(60 * 1000);
  //   }
  //   console.debug("Waiting for finish.");
  //   await page.waitForTimeout(60 * 1000);
  //   console.debug("BINGO Maybe finished.");
  // } catch (error) {
  //   // if (!(error instanceof TimeoutError)) { throw error; }
  //   console.debug("%o", error);
  // } finally {
  //   await page.goto("/");
  // }

  // await page.waitForTimeout(30 * 1000)

  // // じゃんけん
  // await page.click('.side-mallkuji .janken-mallkuji');
  // await expect(page).toHaveURL(/janken/)
  // await randomWait(page, 3)
  // await randomScroll(page)

  // await page.waitForSelector('#main-inner .btn_area');
  // await scrollInto(page, '#main-inner');
  // await page.click('#main-inner .btn_area', { delay: 150 });
  // await randomWait(page, 3)
  // await page.click('#main-inner .select_hands .paper', { delay: 150 });
  // // await page.click('#main-inner .scratch_yet', { delay: 150 });

  // await page.waitForTimeout(15 * 1000)

  // // スクラッチ
  // await page.click('.side-mallkuji .scratch-mallkuji');
  // await expect(page).toHaveURL(/scratch/)
  // await randomWait(page, 3)
  // await randomScroll(page)

  // console.log('checking AD...')
  // if(await page.$('.gmoam_close_button')) {
  //   console.log('AD Found.')
  //   await page.click('.gmoam_close_button')
  // }

  // await page.waitForSelector('#main-inner .start_btn');
  // await scrollInto(page, '#main-inner');
  // await page.click('#main-inner .start_btn', { delay: 150 });
  // await randomWait(page, 3)
  // await page.click('#main-inner .scratch_yet', { delay: 150 });

  // await page.waitForTimeout(15 * 1000)

  // // モールくじ
  // await page.click('.side-mallkuji .gacha-mallkuji');
  // await expect(page).toHaveURL(/gacha/)
  // await randomWait(page, 3)

  // await page.waitForSelector('#gacha-main-inner .normal_start');
  // await scrollInto(page, '#gacha-main-inner');
  // await page.click('#gacha-main-inner .normal_start', { delay: 250, clickCount: 3 });
  // await page.waitForTimeout(15 * 1000)

  await page.context().storageState({ path: "state.json" });
  // await page.waitForTimeout(5000 * 6)
});
