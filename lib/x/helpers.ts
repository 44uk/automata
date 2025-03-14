import type { Page } from "playwright";
import { randomNumber, randomWait } from "../helpers";

export async function login(page: Page, username: string, password: string) {
  if (!username || !password) {
    throw new Error("USERNAME and PASSWORD environment variables are required");
  }
  await page.getByTestId("loginButton").click();
  await randomWait(page);

  await page.getByLabel("電話番号/メールアドレス/ユーザー名").pressSequentially(username, { delay: randomNumber(100, 200) });
  await randomWait(page);
  await page.getByLabel("電話番号/メールアドレス/ユーザー名").press("Enter");

  await page.getByLabel("パスワード", { exact: true }).pressSequentially(password, { delay: randomNumber(100, 200) });
  await randomWait(page);
  await page.getByLabel("パスワード", { exact: true }).press("Enter");
}
