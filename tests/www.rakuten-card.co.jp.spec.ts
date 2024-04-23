import { expect, test } from "@playwright/test";
import { randomNumber, randomScroll, randomWait, scrollInto } from "../util";

const { RAKUTEN_ID, RAKUTEN_PW } = process.env;

const BASE_URL = "https://www.rakuten-card.co.jp";

test.use({ baseURL: BASE_URL });

test("click point", async ({ browser }) => {
  const context = await browser.newContext({});
  context.addCookies([]);
  const page = await context.newPage();

  await page.goto("/");
  await randomScroll(page);
  await page.getByRole("link", { name: "ログイン" }).click();
  await randomScroll(page);

  if (await page.$('//div[@class="service-nav__login"]/*[.="前回のログイン"]')) {
    await expect(page).toHaveURL(/e-navi\/members/);
  } else {
    await page.fill("form input[name='u']", "");
    await page.type("form input[name='u']", RAKUTEN_ID!, {
      delay: randomNumber(100, 200),
    });
    await randomWait(page);
    await page.fill("form input[name='p']", "");
    await page.type("form input[name='p']", RAKUTEN_PW!, {
      delay: randomNumber(100, 200),
    });
    await page.getByRole("button", { name: "ログイン" }).click();
    await expect(page).toHaveURL(/e-navi\/members/);
  }

  await randomScroll(page);
  await scrollInto(page, '//li[@class="rce-userDetails__linkItem"]/a[contains(@href,"click-point")]');

  await page.getByRole("link", { name: /クリックして ポイント/ }).click();
  await expect(page).toHaveURL(/members\/point/);
  await randomScroll(page);

  const xpath =
    "//*[@id='topArea']/div[contains(@class, 'topArea')]//img[contains(@alt, 'Check')]/parent::node()/parent::node()/parent::node()/div[@class='bnrBox']";
  const locators = await page.locator(xpath).all();
  console.info("Banner count: %d", locators.length);
  for (const loc of locators) {
    await randomScroll(page);
    console.info("click! %o", loc);
    await page.keyboard.down("Meta");
    await loc.click();
    await page.keyboard.up("Meta");
  }
  await randomWait(page);
  console.info("finished.");

  await page.context().storageState({ path: "state.json" });
});
