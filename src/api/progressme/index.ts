import { Page } from "puppeteer";
import { safeClick, safeType } from "../browser";

export async function handleLogin(
  page: Page,
  {
    target,
    selector,
    email,
    password,
  }: {
    target: string;
    selector: string;
    email: string | undefined;
    password: string | undefined;
  },
) {
  await page.goto(target, {
    waitUntil: "networkidle0",
    timeout: 30_000,
  });

  const login_button = 'button[test="login_b_login"]';
  await page.waitForSelector(`${login_button}, ${selector}`, {
    visible: true,
    timeout: 3000,
  });

  if (
    await page
      .$eval(login_button, (el) => el.checkVisibility())
      .catch(() => false)
  ) {
    if (!email || !password) {
      throw new Error("Credentials required: session is not authenticated");
    }

    console.info("🔑 perform authorization flow");
    await safeType(page, 'input[type="email"]', email);
    await safeType(page, 'input[type="password"]', password);

    await safeClick(page, login_button);
    await page.waitForSelector(".avatar-box", {
      visible: true,
      timeout: 30_000,
    });

    await page.goto(target, { waitUntil: "domcontentloaded" });
    console.info("✅ authorization completed successfully");
  }

  await page.waitForSelector(selector, {
    visible: true,
    timeout: 30_000,
  });
}
