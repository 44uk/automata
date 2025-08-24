import { defineConfig, devices } from '@playwright/test';
import fs from 'node:fs';

if (!fs.existsSync('./state.json')) {
  fs.writeFileSync('./state.json', '{}');
}

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();
import 'dotenv/config'

const extDir = `${process.cwd()}/ext`
const extPath = `${extDir}/rakuten-web-search/4.686_0`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // globalSetup: require.resolve('./global-setup'),
  // globalTeardown: require.resolve('./global-teardown'),

  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: 'html',
  reporter: 'line',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    headless: !!process.env.CI,
    // storageState: 'storage.json',
    ignoreHTTPSErrors: true,

    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    video: 'on',
    launchOptions: {
      slowMo: 250,
      args: [],
      ignoreDefaultArgs: [],
    },
    contextOptions: {},
    locale: 'ja,en-US;q=0.7,en;q=0.3',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36'
  },

  timeout: 10 * 60 * 1000,

  /* Configure projects for major browsers */
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'],
      storageState: 'state.json',
      launchOptions: {
        slowMo: 200,
        timeout: 15 * 60 * 1000,
        args: [
          '--blink-settings=imagesEnabled=false',
          '--disable-dev-shm-usage',
          // HTTPSへリダイレクト？するので使わない
          // '--disable-features=Translate',
          '--disable-remote-fonts',
          '--disable-setuid-sandbox',
          '--disk-cache-size=1',
          '--hide-scrollbars',
          '--ignore-certificate-errors',
          '--ignore-urlfetcher-cert-requests',
          '--incognito',
          '--lang=ja,en',
          '--mute-audio',
          '--no-default-browser-check',
          '--no-sandbox',
          '--propagate-iph-for-testing',
          '--window-position=10,10',
          '--window-size=800,600',
          `--disable-extensions-except=${extPath}`,
          `--load-extension=${extPath}`,
        ],
        ignoreDefaultArgs: [
          '--disable-component-extensions-with-background-pages'
        ]
      }
    } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'],
    //   storageState: 'state.ff.json',
    //   launchOptions: {
    //     slowMo: 200,
    //     args: [
    //     ]
    //   }
    // } },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ..devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
