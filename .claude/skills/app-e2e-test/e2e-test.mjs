// E2E test for the Notes app — drives Chromium, screenshots every step.
// Run from project root:  node .claude/skills/app-e2e-test/e2e-test.mjs
// Requires: dev server on http://localhost:3000, `npx playwright install chromium` done.
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const BASE = process.env.BASE_URL || "http://localhost:3000";
const DIR = "screenshots";
mkdirSync(DIR, { recursive: true });

// run-level timestamp -> YYYY-MM-DD_HH-MM-SS (matches the `screenshot` skill format)
const d = new Date();
const p = (n) => String(n).padStart(2, "0");
const TS = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}-${p(d.getMinutes())}-${p(d.getSeconds())}`;

let step = 0;
async function shot(page, slug) {
  step += 1;
  const name = `${DIR}/screenshot-${TS}-${p(step)}-${slug}.png`;
  await page.screenshot({ path: name, fullPage: true });
  console.log(`  📸 ${name}`);
  return name;
}

const user = {
  name: "Test User",
  email: `tester+${Date.now()}@example.com`,
  password: "test-password-123",
};

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();

try {
  console.log(`User: ${user.email}`);

  // 1. home
  await page.goto(BASE, { waitUntil: "networkidle" });
  await shot(page, "01-home");

  // 2. register page
  await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
  await shot(page, "02-register-empty");

  // 3. fill + submit register
  await page.fill("#name", user.name);
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await shot(page, "03-register-filled");
  await page.click('button:has-text("Create account")');
  await page.waitForURL("**/notes", { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await shot(page, "04-notes-after-register");

  // 5. full-page editor
  await page.goto(`${BASE}/notes/new`, { waitUntil: "networkidle" });
  await shot(page, "05-editor-empty");

  // 6. type title + body
  await page.fill('input[placeholder="Untitled Note"]', "My first note");
  const editor = page.locator(".ProseMirror");
  await editor.click();
  await editor.type("Hello from the automated test. This note was typed by a robot.");
  await shot(page, "06-editor-filled");

  // 7. save (full page -> POST), wait for "Saved"
  await page.click('button:has-text("Save")');
  await page.getByText("Saved", { exact: false }).first().waitFor({ timeout: 15000 });
  await page.waitForURL("**/notes/**/edit", { timeout: 15000 }).catch(() => {});
  await shot(page, "07-saved-fullpage");

  // 8. back to list
  await page.goto(`${BASE}/notes`, { waitUntil: "networkidle" });
  await shot(page, "08-list-with-note");

  // 9. open in modal, edit, save
  await page.click('text="My first note"');
  await page.waitForTimeout(400); // modal open animation
  const titleInput = page.locator('input[placeholder="Untitled Note"]').last();
  await titleInput.fill("My first note (edited in modal)");
  await shot(page, "09-modal-edited");
  await page.locator('button:has-text("Save")').last().click();
  await page.getByText("Saved", { exact: false }).first().waitFor({ timeout: 15000 });
  await shot(page, "10-modal-saved");

  // 10. enable sharing, read public link
  await page.locator('button:has-text("Share publicly")').last().click();
  await page.locator('input[readonly]').last().waitFor({ timeout: 15000 });
  const publicUrl = await page.locator('input[readonly]').last().inputValue();
  console.log(`  public URL: ${publicUrl}`);
  await shot(page, "11-sharing-enabled");

  // 11. open public link in a fresh logged-out context
  const anon = await browser.newContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(publicUrl, { waitUntil: "networkidle" });
  await shot(anonPage, "12-public-view-anon");
  await anon.close();

  // 12. logout
  await page.goto(`${BASE}/notes`, { waitUntil: "networkidle" });
  await page.click('button:has-text("Sign out")');
  await page.waitForURL("**/login", { timeout: 15000 });
  await shot(page, "13-after-logout-login");

  // 13. auth guard: visit /notes while logged out -> redirect to /login
  await page.goto(`${BASE}/notes`, { waitUntil: "networkidle" });
  await shot(page, "14-guard-redirect-to-login");

  // 14. log back in
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL("**/notes", { timeout: 15000 });
  await page.waitForLoadState("networkidle");
  await shot(page, "15-logged-back-in");

  console.log(`\n✅ DONE — ${step} screenshots in ${DIR}/`);
} catch (err) {
  console.error("\n❌ FAILED at step", step + 1, "-", err.message);
  await shot(page, `99-FAILURE-step-${step + 1}`).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
