import { expect, test } from "@playwright/test";
import { randomNumber, randomScroll, randomWait, scrollInto } from "../lib/helpers";

const { SBISEC_ID, SBISEC_PW, SBISEC_TR_PW } = process.env;

const BASE_URL = "https://www.sbisec.co.jp";

test.use({ baseURL: BASE_URL });

test("entry IPO", async ({ browser }) => {
  const context = await browser.newContext({});
  context.addCookies([]);
  const page = await context.newPage();

  await page.goto("/ETGate");
  await expect(page).toHaveURL(/ETGate/);
  await page.focus('//*[@id="top_stock_sec"]');
  await randomScroll(page);

  if (await page.$('//li[@id="logout"]//img[@title="ログアウト"]')) {
    await scrollInto(page, '//h1[@id="logo"]');
  } else {
    await page.type("form input[name='user_id']", SBISEC_ID!, {
      delay: randomNumber(50, 100),
    });
    await randomWait(page, 1);
    await page.type("form input[name='user_password']", SBISEC_PW!, {
      delay: randomNumber(50, 100),
    });
    await page.click("form input[type='submit']", { delay: 50 });
    await expect(page).toHaveURL(/ETGate/);
  }
  await randomWait(page);

  await page.click('//*[@id="navi01P"]//img[@title="国内株式"]', {});
  await expect(page).toHaveURL(/marble\/domestic/);

  await page.click('//*[@id="navi02P"]//a[.="IPO・PO"]');
  await expect(page).toHaveURL(/dir=ipo/);

  await page.locator('//*[@id="main"]').getByRole("link", { name: "新規上場株式ブックビルディング / 購入意思表示" }).click();
  // await page.click('//*[@id="main"]//img[@alt="新規上場株式ブックビルディング / 購入意思表示"]');
  await expect(page).toHaveURL(/switchnaviMain/);

  await randomScroll(page);

  for (;;) {
    const entryButtons = await page.$$('//*[@id="displayList"]//img[@alt="申込"]');
    console.info("Ready to Entry IPO: %d", entryButtons.length);
    if (entryButtons.length === 0) {
      console.info("No ready to Entry IPO");
      break;
    }

    await entryButtons[0].click();
    await expect(page).toHaveURL(/oeapw011/);
    await randomWait(page);

    await page.type("form input[name='suryo']", "100", {
      delay: randomNumber(50, 100),
    });
    await page.click('form label[for="strPriceRadio"]');
    await page.type("form input[name='tr_pass']", SBISEC_TR_PW!, {
      delay: randomNumber(50, 100),
    });
    await page.click("form input[type='submit']", { delay: 50 });
    await expect(page).toHaveURL(/oeapw021/);
    await randomWait(page);

    await page.click("form input[type='submit'][name='order_btn']", {
      delay: 50,
    });
    await expect(page).toHaveURL(/oeapw031/);
    await randomWait(page);

    await page.click('//table//a[.="新規上場株式ブックビルディング/購入意思表示画面へ戻る"]');
    await randomScroll(page);
  }

  await page.context().storageState({ path: "state.json" });
});
