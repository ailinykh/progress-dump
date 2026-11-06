import { Browser, Page } from "puppeteer";

export async function getPage(
  browser: Browser,
  hostname: string,
): Promise<Page> {
  const pages = await browser.pages();

  for (const page of pages) {
    const url = page.url();
    if (url.indexOf(hostname) != -1) {
      return page;
    }
  }

  return await browser.newPage();
}
