import Chance from "chance";
import type { BrowserContext, Page } from "playwright";

export function randomNumber(min = 0, max = 100) {
  const chance = new Chance();
  return chance.integer({ min, max });
}

export async function scrollInto(page: Page, selector: string) {
  await page.waitForSelector(selector);
  await page.$eval(selector, (el) => el.scrollIntoView());
}

export async function downScroll(page: Page, opts: { try: number } = { try: 7 }) {
  const keyInputs = ["ArrowDown", "PageDown", "PageDown", "PageDown"];
  const chance = new Chance();
  await page.mouse.wheel(0, chance.integer({ min: 100, max: 200 }));
  await page.waitForTimeout(200);
  for (let i = opts.try; i > 0; i--) {
    const idx = chance.integer({ min: 0, max: keyInputs.length - 1 });
    await page.keyboard.press(keyInputs[idx]);
    await page.waitForTimeout(100);
  }
}

export async function upScroll(page: Page, opts: { try: number } = { try: 7 }) {
  const keyInputs = ["ArrowUp", "PageUp", "PageUp", "PageUp"];
  const chance = new Chance();
  await page.mouse.wheel(0, chance.integer({ min: 100, max: 200 }));
  await page.waitForTimeout(200);
  for (let i = opts.try; i > 0; i--) {
    const idx = chance.integer({ min: 0, max: keyInputs.length - 1 });
    await page.keyboard.press(keyInputs[idx]);
    await page.waitForTimeout(100);
  }
}

export async function randomScroll(page: Page, opts: { try: number } = { try: 7 }) {
  const keyInputs = ["ArrowDown", "PageDown", "ArrowUp", "PageUp", " "];
  const chance = new Chance();
  await page.mouse.wheel(0, chance.integer({ min: 100, max: 200 }));
  await page.waitForTimeout(300);
  for (let i = opts.try; i > 0; i--) {
    const idx = chance.integer({ min: 0, max: keyInputs.length - 1 });
    await page.keyboard.press(keyInputs[idx]);
    await page.waitForTimeout(200);
  }
}

export async function randomWait(page: Page, maxSecs = 3) {
  const chance = new Chance();
  const base = ~~Date.now().toString().slice(-1);
  const range = {
    min: base + 1,
    max: base + maxSecs,
  };
  const mul = 1000;
  await page.waitForTimeout(chance.integer(range) * mul);
}

export async function removeCookies(context: BrowserContext, name_or_domains: string[]) {
  if (name_or_domains.length === 0) return;
  const cookies = await context.cookies();
  const keeps = cookies.filter(({ name, domain }) => !name_or_domains.includes(name) || !name_or_domains.includes(domain));
  await context.clearCookies();
  await context.addCookies(keeps);
}

export async function keepCookies(context: BrowserContext, name_or_domains: string[]) {
  if (name_or_domains.length === 0) return;
  const cookies = await context.cookies();
  const keeps = cookies.filter(({ name, domain }) => name_or_domains.includes(name) || name_or_domains.includes(domain));
  await context.clearCookies();
  await context.addCookies(keeps);
}

export async function humanMouseMove(page: Page, fromX: number, fromY: number, toX: number, toY: number) {
  const chance = new Chance();
  const steps = chance.integer({ min: 8, max: 15 });

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const controlX = fromX + (toX - fromX) * 0.5 + chance.integer({ min: -20, max: 20 });
    const controlY = fromY + (toY - fromY) * 0.5 + chance.integer({ min: -20, max: 20 });

    const x = (1 - t) ** 2 * fromX + 2 * (1 - t) * t * controlX + t ** 2 * toX;
    const y = (1 - t) ** 2 * fromY + 2 * (1 - t) * t * controlY + t ** 2 * toY;

    await page.mouse.move(x, y);
    await page.waitForTimeout(chance.integer({ min: 10, max: 30 }));
  }
}

export async function naturalScroll(page: Page, direction: "up" | "down" = "down", intensity: "light" | "normal" | "heavy" = "normal") {
  const chance = new Chance();
  const baseScrollAmount = { light: 100, normal: 300, heavy: 500 }[intensity];

  const scrolls = chance.integer({ min: 3, max: 7 });

  for (let i = 0; i < scrolls; i++) {
    const amount = baseScrollAmount * (1 - i / scrolls) * chance.floating({ min: 0.7, max: 1.3 });

    // 20%の確率で逆方向にスクロール（見逃したコンテンツを確認する動作）
    const currentDirection = chance.bool({ likelihood: 20 }) ? (direction === "down" ? "up" : "down") : direction;
    const delta = currentDirection === "down" ? amount : -amount;

    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(chance.integer({ min: 50, max: 200 }));
  }
}

function getTypingDelay(currentChar: string, previousChar: string): number {
  const chance = new Chance();
  const baseDelay = 120;

  const commonPairs = ["th", "er", "on", "an", "re", "he", "in", "ed", "nd", "ha"];
  const pair = previousChar + currentChar;

  if (commonPairs.includes(pair.toLowerCase())) {
    return chance.integer({ min: 80, max: 120 });
  }

  return chance.integer({ min: baseDelay, max: baseDelay + 80 });
}

export async function humanTypeText(page: Page, selector: string, text: string) {
  const chance = new Chance();
  const element = page.locator(selector);

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (chance.bool({ likelihood: 5 })) {
      const wrongChar = chance.character();
      await element.pressSequentially(wrongChar, { delay: chance.integer({ min: 80, max: 150 }) });
      await page.waitForTimeout(chance.integer({ min: 100, max: 300 }));
      await element.press("Backspace");
      await page.waitForTimeout(chance.integer({ min: 50, max: 150 }));
    }

    await element.pressSequentially(char, { delay: getTypingDelay(char, i > 0 ? text[i - 1] : "") });

    if (i > 0 && i % chance.integer({ min: 10, max: 20 }) === 0) {
      await page.waitForTimeout(chance.integer({ min: 200, max: 800 }));
    }
  }
}

export async function naturalWait(page: Page, context: "click" | "page-load" | "scroll" | "typing" = "click") {
  const chance = new Chance();

  const params = {
    click: { shape: 2, scale: 200, min: 100, max: 1000 },
    "page-load": { shape: 1.5, scale: 800, min: 500, max: 3000 },
    scroll: { shape: 2.5, scale: 150, min: 50, max: 500 },
    typing: { shape: 3, scale: 100, min: 50, max: 400 },
  }[context];

  const u1 = chance.floating({ min: 0.01, max: 0.99 });
  const u2 = chance.floating({ min: 0.01, max: 0.99 });
  const gamma = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

  const delay = Math.max(params.min, Math.min(params.max, Math.abs(gamma) * params.scale));
  await page.waitForTimeout(Math.floor(delay));
}
