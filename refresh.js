const { chromium } = require('playwright');
require('dotenv').config();

const EMAIL = process.env.NAUKRI_EMAIL;
const PASSWORD = process.env.NAUKRI_PASSWORD;
const RESUME_PATH = process.env.RESUME_PATH;

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const randomDelay = (min = 1000, max = 3000) => sleep(min + Math.random() * (max - min));

async function login(page) {
  console.log('Opening Naukri homepage...');
  await page.goto('https://www.naukri.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await randomDelay(3000, 5000);

  console.log('Clicking Login button...');
  await page.click('a:has-text("Login"), button:has-text("Login")', { timeout: 5000 });

  console.log('Waiting for login modal...');
  const emailField = page.locator('input[placeholder="Enter your active Email ID / Username"]');
  await emailField.waitFor({ state: 'visible', timeout: 15000 });
  await randomDelay(1000, 2000);

  console.log('Filling email...');
  await emailField.click();
  await randomDelay(300, 600);
  await emailField.type(EMAIL, { delay: 80 });
  await randomDelay(800, 1200);

  console.log('Filling password...');
  const passwordField = page.locator('input[placeholder="Enter your password"]');
  await passwordField.waitFor({ state: 'visible', timeout: 5000 });
  await passwordField.click();
  await randomDelay(300, 600);
  await passwordField.type(PASSWORD, { delay: 80 });
  await randomDelay(800, 1200);

  console.log('Submitting login...');
  await page.click('button[type="submit"]:has-text("Login"), .loginButton, button.blue-btn', { timeout: 5000 });
  await randomDelay(6000, 8000);
  console.log('✅ Logged in');
}

async function updateResume(page) {
  if (!RESUME_PATH) {
    console.log('ℹ️  RESUME_PATH not set in .env — skipping resume upload');
    return;
  }

  console.log('\n--- Resume Upload ---');
  try {
    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(4000, 6000);

    // Try direct file input first
    let uploaded = false;
    try {
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.waitFor({ state: 'attached', timeout: 5000 });
      await fileInput.setInputFiles(RESUME_PATH);
      await randomDelay(4000, 6000);
      uploaded = true;
    } catch {
      // Click Update button first then upload
      await page.click('a:has-text("Update"), button:has-text("Update resume"), label:has-text("Update")', { timeout: 5000 });
      await randomDelay(1000, 2000);
      const fileInput = page.locator('input[type="file"]').first();
      await fileInput.waitFor({ state: 'attached', timeout: 5000 });
      await fileInput.setInputFiles(RESUME_PATH);
      await randomDelay(4000, 6000);
      uploaded = true;
    }

    if (uploaded) console.log('✅ Resume uploaded successfully!');
  } catch (e) {
    console.log('❌ Resume upload failed:', e.message);
  }
}

async function updateHeadline(page) {
  console.log('\n--- Headline Update ---');
  try {
    await page.goto('https://www.naukri.com/mnjuser/profile', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await randomDelay(4000, 6000);

    // Click pencil icon next to Resume headline
    let clicked = false;
    const strategies = [
      async () => {
        await page.click('text="Resume headline" >> xpath=following-sibling::*[1]', { timeout: 3000 });
      },
      async () => {
        const section = page.locator('section, div, article').filter({ hasText: 'Resume headline' }).first();
        await section.locator('svg, .pencil, [class*="pencil"], [class*="edit"]').first().click({ timeout: 3000 });
      },
      async () => {
        await page.evaluate(() => {
          const headlineEl = [...document.querySelectorAll('*')].find(el => el.textContent.trim() === 'Resume headline');
          if (headlineEl) {
            const parent = headlineEl.closest('section, div[class]');
            const editEl = parent?.querySelector('svg, [class*="edit"], [class*="pencil"]');
            if (editEl) editEl.click();
          }
        });
        clicked = true;
      },
    ];

    for (const strategy of strategies) {
      try {
        await strategy();
        clicked = true;
        break;
      } catch {}
    }

    if (!clicked) throw new Error('Could not find headline edit button');

    await randomDelay(2000, 3000);

    const textarea = await page.$('textarea');
    if (!textarea) throw new Error('Textarea not found after clicking edit');

    const currentText = await textarea.inputValue();
    const updatedText = currentText.endsWith('.') ? currentText.slice(0, -1) : currentText + '.';
    console.log(`Headline: "${currentText.substring(0, 50)}..." → "${updatedText.substring(0, 50)}..."`);

    await textarea.fill(updatedText);
    await randomDelay(400, 700);

    const saveBtn = page.locator('button:has-text("Save")').last();
    await saveBtn.waitFor({ state: 'visible', timeout: 5000 });
    await saveBtn.click();
    await randomDelay(2000, 3000);
    console.log('✅ Headline updated successfully!');

  } catch (e) {
    console.log('❌ Headline update failed:', e.message);
    try { await page.screenshot({ path: 'headline-error.png' }); } catch {}
  }
}

async function refreshNaukriProfile() {
  console.log(`[${new Date().toLocaleString()}] Starting Naukri profile refresh...`);

  const browser = await chromium.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-dev-shm-usage',
      '--window-size=1366,768',
    ]
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1366, height: 768 },
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    extraHTTPHeaders: { 'Accept-Language': 'en-IN,en;q=0.9' }
  });

  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    window.chrome = { runtime: {} };
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3] });
  });

  const page = await context.newPage();

  // Random delay before starting — looks less like a scheduled bot
  const startDelay = Math.floor(15000 + Math.random() * 120000); // 15s to 2.5min
  console.log(`Waiting ${Math.round(startDelay/1000)}s before starting...`);
  await sleep(startDelay);

  try {
    await login(page);
  } catch (e) {
    console.error('❌ Login failed:', e.message);
    await browser.close();
    return;
  }

  // Run both independently in random order with random delay in between
  const tasks = [updateResume, updateHeadline];
  if (Math.random() > 0.5) tasks.reverse();
  console.log(`\nOrder: ${tasks.map(f => f.name).join(' → ')}`);
  await tasks[0](page);
  const delay = Math.floor(30000 + Math.random() * 90000); // 30s to 2min random gap
  console.log(`\nWaiting ${Math.round(delay/1000)}s before next task...`);
  await sleep(delay);
  await tasks[1](page);

  console.log('\n✅ All done!');
  await randomDelay(2000, 3000);
  await browser.close();
}

refreshNaukriProfile();