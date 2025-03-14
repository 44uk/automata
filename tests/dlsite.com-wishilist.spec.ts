import fs from "node:fs";
import { expect, test } from "@playwright/test";
import { randomNumber, randomScroll, randomWait, removeCookies, scrollInto } from "../lib/helpers";

const { DLSITE_ID, DLSITE_PW } = process.env;

const BASE_URL = "https://www.dlsite.com/";

test.use({ baseURL: BASE_URL });

test("click DLSite farm", async ({ browser }) => {
  const context = await browser.newContext({});
  context.addCookies([]);
  const page = await context.newPage();

  await page.goto("/");
  await randomScroll(page, { try: 2 });

  const $isLoggedIn = await page.$(
    '//div[@id="index2_header"]//ul[@class="utility_menu"]/li[@class="type-register _notLoggedIn"][contains(@style, "display: none")]',
  );
  if ($isLoggedIn) {
    console.info("Already Logged in.");
  } else {
    console.info("Need to logg in.");
    await page.getByRole("link", { name: "ログイン" }).click();
    await expect(page).toHaveURL(/login/);

    await page.type("form input[name='login_id']", DLSITE_ID!, {
      delay: randomNumber(100, 300),
    });
    await page.type("form input[name='password']", DLSITE_PW!, {
      delay: randomNumber(100, 300),
    });
    await page.getByRole("button", { name: "ログイン" }).click();
  }

  await page.goto("/home/mypage/wishlist/folder/=/order/regist_date_d/per_page/100");
  await expect(page).toHaveURL(/wishlist/);
  await randomScroll(page, { try: 2 });

  const $modal = await page.$('//div[@class="modal_close"]');
  if ($modal) {
    await $modal.click();
  }

  const urls: (string | null)[] = [];
  while (true) {
    const $aList = await page
      .locator(
        '//table[contains(@class, "n_worklist")]//tr[contains(@class, "_favorite_item _active_item_")]/td[1]/div[@class="work_thumb"]/a',
      )
      .all();
    urls.push(...(await Promise.all($aList.map(($a) => $a.getAttribute("href")))));
    const $nextLink = page.getByRole("link", { name: "次へ" });
    if ((await $nextLink.count()) > 0) {
      await $nextLink.click();
    } else {
      break;
    }
  }
  console.log(urls);

  fs.writeFileSync("wishlist.csv", urls.join("\n"), {});

  await page.waitForTimeout(10 * 1000);
});
