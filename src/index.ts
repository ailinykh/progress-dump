import {
  createBrowserWithStealth,
  getPage,
  resizeBrowser,
} from "./api/browser";
import "dotenv/config";
import { handleLogin } from "./api/progressme";

async function scrape() {
  const browser = await createBrowserWithStealth();
  const page = await getPage(browser, "progressme.ru");
  // use realistic screen dimensions
  const session = await page.createCDPSession();
  await resizeBrowser(session, { width: 1920, height: 1080 });

  const materials_page_url =
    "https://progressme.ru/cabinet/school/materials/personal";
  // navigate to materials page
  // method performs authorization
  // if needed and waits for selector
  await handleLogin(page, {
    target: materials_page_url,
    selector: ".material_card_list",
    email: process.env.USER_EMAIL,
    password: process.env.USER_PASSWORD,
  });

  // TODO: per 25 items pagination, loaded on scroll
  // const total_materials_count = await page.$eval(".tir-separator", (el) => {
  //   const match = el.textContent.match(/\d+/);
  //   return match ? parseInt(match[0], 10) : 0;
  // });

  const materials = await page.evaluate(() => {
    const items = document.querySelectorAll(".material_card_list-card");
    return Array.from(items).map((item) => ({
      id: item.parentElement.getAttribute("id"),
      image_url: item.querySelector("img")?.getAttribute("src"),
      title: item.querySelector(".avatar-card-name_wrap")?.textContent?.trim(),
    }));
  });

  console.log(materials);

  await browser.disconnect();
}

scrape();
