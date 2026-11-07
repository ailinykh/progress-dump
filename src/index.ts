import { createBrowserWithStealth, getPage } from "./api/browser";

async function scrape() {
  const browser = await createBrowserWithStealth();
  const page = await getPage(browser, "progressme.ru");
  // Use realistic screen dimensions
  await page.setViewport({ width: 1920, height: 1080 });

  // Navigate to target page
  await page.goto("https://progressme.ru/cabinet/school/materials/personal", {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });

  // Wait for products to load
  //await page.waitForSelector(".product", { timeout: 10000 });

  // Extract product information
  //const products = await page.evaluate(() => {
  //const items = document.querySelectorAll(".product");

  //});

  await browser.disconnect();
}

scrape();
