import { Browser, Page } from "puppeteer";

export async function getPage(
  browser: Browser,
  hostname: string,
): Promise<Page> {
  const pages = await browser.pages();

  for (const page of pages) {
    const url = new URL(page.url());
    if (url.hostname === hostname) {
      return page;
    }
  }

  return await browser.newPage();
}
