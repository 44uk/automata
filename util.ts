import { BrowserContext, Page } from 'playwright'
import Chance from 'chance'

export function randomNumber(min: number = 0, max: number = 100) {
  const chance = new Chance()
  return chance.integer({ min, max })
}

export async function scrollInto(page: Page, selector: string) {
  await page.waitForSelector(selector)
  await page.$eval(selector, el => el.scrollIntoView())
}

export async function downScroll(page: Page, opts: { try: number } = { try: 7 }) {
  const keyInputs = [
    'ArrowDown',
    'PageDown',
    'PageDown',
    'PageDown',
  ]
  const chance = new Chance()
  await page.mouse.wheel(0, chance.integer({ min: 100, max: 200 }));
  await page.waitForTimeout(200)
  for(let i = opts.try; i > 0; i--) {
    const idx = chance.integer({ min: 0, max: keyInputs.length - 1 })
    await page.keyboard.press(keyInputs[idx])
    await page.waitForTimeout(100)
  }
}

export async function randomScroll(page: Page, opts: { try: number } = { try: 7 }) {
  const keyInputs = [
    'ArrowDown',
    'PageDown',
    'ArrowUp',
    'PageUp',
    " "
  ]
  const chance = new Chance()
  await page.mouse.wheel(0, chance.integer({ min: 100, max: 200 }));
  await page.waitForTimeout(300)
  for(let i = opts.try; i > 0; i--) {
    const idx = chance.integer({ min: 0, max: keyInputs.length - 1 })
    await page.keyboard.press(keyInputs[idx])
    await page.waitForTimeout(200)
  }
}

export async function randomWait(page: Page, maxSecs = 3) {
  const chance = new Chance()
  const base = ~~(Date.now().toString().slice(-1))
  const range = {
    min: base + 1,
    max: base + maxSecs
  }
  const mul = 1000
  await page.waitForTimeout(chance.integer(range) * mul)
}

export async function removeCookies (context: BrowserContext, name_or_domains: string[]) {
  if(name_or_domains.length === 0) return
  const cookies = await context.cookies()
  const keeps = cookies.filter(({ name, domain }) => !name_or_domains.includes(name) || !name_or_domains.includes(domain));
  await context.clearCookies();
  await context.addCookies(keeps);
}

export async function keepCookies (context: BrowserContext, name_or_domains: string[]) {
  if(name_or_domains.length === 0) return
  const cookies = await context.cookies()
  const keeps = cookies.filter(({ name, domain }) => name_or_domains.includes(name) || name_or_domains.includes(domain));
  await context.clearCookies();
  await context.addCookies(keeps);
}
