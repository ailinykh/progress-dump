import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { Browser } from "puppeteer";
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
