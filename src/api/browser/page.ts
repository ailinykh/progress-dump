import { Page } from "puppeteer";

export async function safeClick(page: Page, selector: string): Promise<void> {
  // 1. Locate the button and get its exact physical coordinates
  const button = await page.waitForSelector(selector);
  const box = await button.boundingBox();

  if (!box) throw `Element ${selector} not found`;

  // 2. Pick a random point inside the button (not the exact center!)
  const x = box.x + Math.floor(Math.random() * box.width);
  const y = box.y + Math.floor(Math.random() * box.height);

  // 3. Move the mouse to the destination
  // For high-security sites, use a library like 'ghost-cursor' to handle micro-movements,
  // or introduce a multi-step movement manually.
  await page.mouse.move(x, y, { steps: 25 }); // Steps create a smoother path

  // 4. Short human delay right before clicking
  await new Promise((r) => setTimeout(r, 50 + Math.random() * 100));

  // 5. Fire a trusted hardware click
  await page.mouse.click(x, y, { delay: 30 + Math.random() * 50 }); // Simulates key-down hold time
}

export async function safeType(
  page: Page,
  selector: string,
  text: string,
): Promise<void> {
  // 0. Perform random delay before any action
  await new Promise((r) => setTimeout(r, 500 + Math.random() * 3000));

  // 1. Safely click to focus the input field first (using human-like click math)
  const input = await page.waitForSelector(selector);
  const box = await input.boundingBox();

  if (!box) throw `Element ${selector} not found`;

  const targetX = box.x + Math.floor(Math.random() * box.width);
  const targetY = box.y + Math.floor(Math.random() * box.height);

  await page.mouse.move(targetX, targetY, { steps: 15 });
  await page.mouse.click(targetX, targetY, { delay: 40 + Math.random() * 40 });

  // 2. Clear any pre-existing text humanly (Cmd/Ctrl + A, then Backspace)
  const isMac = process.platform === "darwin";
  const modifier = isMac ? "Meta" : "Control";

  await page.keyboard.down(modifier);
  await page.keyboard.press("KeyA");
  await page.keyboard.up(modifier);
  await page.keyboard.press("Backspace");
  await new Promise((r) => setTimeout(r, 100 + Math.random() * 150));

  // 3. Type the text character-by-character with randomized latency
  for (const char of text) {
    await page.keyboard.sendCharacter(char);

    // Random delay between 40ms and 150ms per keystroke (mimicking a fast typist)
    // Occasionally add a tiny extra delay to simulate a slight pause or correction rhythm
    const standardDelay = 40 + Math.random() * 110;
    const rhythmicPause = Math.random() > 0.85 ? 100 + Math.random() * 100 : 0;

    await new Promise((r) => setTimeout(r, standardDelay + rhythmicPause));
  }
}
