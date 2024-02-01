import { chromium, FullConfig, FullProject } from '@playwright/test';

const getSimpleSetting = (project: FullProject) => {
  const { timeout } = project;
  const { locale, headless } = project.use;
  return { timeout, locale, headless };
};

export const getDefaultBrowser = async (config: FullConfig) => {
  if (!config.projects[0]) {
    throw new Error('There is not a single project set. Please check.');
  }
  const { locale, headless } = getSimpleSetting(config.projects[0]);
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext({
    locale,
    storageState: 'state.json',
  });
  return {
    browser,
    context,
  };
};

const globalSetup = async (config: FullConfig) => {
  const { context } = await getDefaultBrowser(config);
  context.clearCookies();
  const page = await context.newPage();
  await page.context().storageState({ path: 'state.json' });
};

export default globalSetup;
