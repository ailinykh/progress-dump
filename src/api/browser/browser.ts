import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { Browser, CDPSession, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

export async function createBrowserWithStealth(): Promise<Browser> {
  const connect = () =>
    puppeteer.connect({
      browserURL: "http://127.0.0.1:9222",
      defaultViewport: null,
    });

  try {
    return await connect();
  } catch {
    // No reachable browser; start one.
  }
  const executablePath = await puppeteer.executablePath();
  const child = spawn(
    executablePath,
    [
      "--remote-debugging-address=127.0.0.1",
      "--remote-debugging-port=9222",
      `--user-data-dir=${resolve(".puppeteer")}`,
      "--no-first-run",
      "--no-default-browser-check",
    ],
    {
      detached: true,
      stdio: "ignore",
    },
  );

  let launchError: Error | undefined;
  child.on("error", (error: Error | undefined) => {
    launchError = error;
  });
  child.unref();

  const deadline = Date.now() + 15_000;

  while (true) {
    if (launchError) throw launchError;

    try {
      return await connect();
    } catch (error) {
      if (Date.now() >= deadline) throw error;
      await delay(250);
    }
  }
}

export async function resizeBrowser(
  session: CDPSession,
  { width, height }: { width: number; height: number },
) {
  const { windowId } = await session.send("Browser.getWindowForTarget");

  await session.send("Browser.setWindowBounds", {
    windowId,
    bounds: { windowState: "normal" },
  });

  await session.send("Browser.setWindowBounds", {
    windowId,
    bounds: { width, height },
  });

  await session.detach();
}

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
