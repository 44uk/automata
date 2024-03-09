import { expect, test } from '@playwright/test';
import Chance from 'chance'
import { randomNumber, randomScroll, randomWait, removeCookies, scrollInto } from '../util';
import randomWordFromWikipedia from '../lib/randomWordFromWikipedia'

const {
  RAKUTEN_ID,
  RAKUTEN_PW,
} = process.env

const BASE_URL = "https://websearch.rakuten.co.jp";

test.use({ baseURL: BASE_URL });

test('web search', async ({ browser, page: initialPage }) => {
  // await initialPage.goto('chrome://extensions')
  // await initialPage.click('css=body > extensions-manager >> css=#items-list >> css=extensions-item >> css=#detailsButton');
  // await initialPage.click('css=body > extensions-manager >> css=#viewManager > extensions-detail-view >> css=#allow-incognito');

  const context = await browser.newContext({
    locale: 'ja'
  });
  context.addCookies([]);
  const page = await context.newPage();

  await page.goto('/', { waitUntil: 'load' })
  await randomScroll(page)

  if(await page.$('//div[@id="topics-user"]//a[.="ログイン"]')) {
    console.info("Need to login.")
    await page.click('//div[@id="topics-user"]//a[.="ログイン"]')

    // 一呼吸おくとうまくいく
    await randomWait(page, 3)
    await randomScroll(page)

    if(! page.url().match(/SimpleTop/)) {
      console.info("Try login.")

      if (await page.$('form input[name="username"]')) {
        await page.fill('form input[name="username"]', '')
        await page.type('form input[name="username"]', RAKUTEN_ID!, { delay: randomNumber(100, 200)})
        await page.click('//form//div[@role="button"]/div/div[.="次へ"]')
        await randomWait(page, 2)
      }

      await page.waitForSelector('form input[name="password"]')
      await page.fill('form input[name="password"]', '')
      await page.type('form input[name="password"]', RAKUTEN_PW!, { delay: randomNumber(100, 200)})
      await page.click('//form//div[@role="button"]/div/div[.="ログイン"]')
      await randomWait(page, 2)
    }
    await expect(page).toHaveURL(/SimpleTop/)
  } else {
    console.info("Already logged in.")
  }

  const clickCount = parseInt(await page.$eval("[class='search-progress-current']", el => el.textContent) || "0")
  console.info("Click Count: %d", clickCount)
  // if(clickCount === 30) {
  if(clickCount === 5) {
    console.info("Already reached at Max Click Count.")
    return
  }

  let words: string[] = []
  while(words.length < 30 - clickCount) {
    const results = await randomWordFromWikipedia("ja", 10).catch(() => [])
    if(results.length === 0) continue
    words = words.concat(results)
      .filter((w: string) => 4 <= w.length && w.length <= 12)
      .slice(0, 30)
    console.info("search keywords stacking... %d", words.length)
  }
  console.info("%d words ready to search.", words.length);

  await page.waitForSelector("#simple-top-search-form", { state: 'visible' });
  console.info("Search form found.");

  (await page.$('#clear-history'))?.click();
  await scrollInto(page, '#page');
  await randomWait(page);

  const chance = new Chance();
  if(chance.bool({ likelihood: 60 })) {
    await page.locator('//form[@id="simple-top-search-form"]//dl/dd//input').first().click();
    console.info("First Word Clicked!");
  } else {
    const word = words.pop() || "リラックマ";
    await page.fill("input#search-input", '');
    await page.type("input#search-input", word, { delay: randomNumber(100, 300) });
    await page.click("#search-submit");
    console.info("Word: %s searched!", word);
  }
  await randomScroll(page);

  await page.waitForSelector("#myForm input[name='qt']", { state: 'visible' });
  for(let idx = 0; idx < words.length; idx++) {
    // ５回の検索で終了する
    if(idx > 5) { break; }

    await page.fill("input[name='qt']", '');
    await page.type("input[name='qt']", words[idx], { delay: randomNumber(100, 300) });
    await page.click("#searchBtn");
    console.info("Word: %s searched!", words[idx]);
    await page.waitForSelector("#myForm input[name='qt']", { state: 'visible' });

    await randomScroll(page);
    if(chance.bool({ likelihood: 60 })) {
      const cnt = chance.integer({ min: 1, max: 2 });
      console.info("(%d) Will paging.", cnt);

      const nextSelector = "nav.page-navi-serp a.next-sc-page-serp";
      for(let i = 0; i < cnt; i++) {
        const next = await page.$(nextSelector);
        if(next == null) {
          console.info("No next page.");
          break;
        }
        try {
          await randomScroll(page)
          await scrollInto(page, nextSelector);
          console.info("(%d) Click next page.", i + 1);
          await page.click(nextSelector);
          await randomWait(page);
        } catch(e) {
          console.error(e);
          // do nothing
        }
        // たまに戻る
        // if(chance.bool({ likelihood: 30 })) {
        //   await page.goBack()
        //   await randomWait(page)
        // }
      }
    }
    await randomWait(page);

    if(chance.bool({ likelihood: 50 })) {
      console.info("Will open first result of webpage.");
      try {
        await page.keyboard.down('Meta');
        await page.click("#result-main .web-result .window", {});
        await page.keyboard.up('Meta');
        console.info("Opened a webpage.");
        await randomWait(page);
        //  console.log(await page.$$("#result-main .web-result .window"))
        //  const href = Array.from(document.querySelectorAll("#result-main .web-result .window"))
        //    .map((el: any) => el.href as string)
        //    .filter(href => !/(pdf|xls|xlsx)$/.test(href))
        //    [0]
        //  const linkSelector = `#result-main a[href="${href}"]`
        //  await scrollInto(page, linkSelector)
        //  await page.locator(linkSelector).click()
        //  console.info("Opened a webpage.")
        //  await page.waitForSelector("body", { state: 'visible' })
        //  await page.waitForTimeout(3000)
      } catch (e) {
        console.error(e);
        // // if (!(e instanceof TimeoutError)) { throw e }
        // console.debug("Opening website has been timeout.")
      } finally {
        // page.goBack()
      }
    }
  }

  await randomWait(page);

  await page.context().storageState({ path: 'state.json' });
});
