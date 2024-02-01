import { chromium, FullConfig } from '@playwright/test';

export default async function(config: FullConfig) {
  console.debug(config)
}
