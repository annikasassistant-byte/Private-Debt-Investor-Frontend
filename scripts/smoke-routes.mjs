/**
 * Smoke test: visit all app routes and report HTTP status + console errors.
 * Run: node scripts/smoke-routes.mjs (requires dev server on BASE_URL)
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/forgot-password",
  "/reset-password",
  "/unauthorized",
];

const INVESTOR_ROUTES = [
  "/dashboard",
  "/dashboard/investment",
  "/dashboard/timeline",
  "/dashboard/schedule",
  "/dashboard/reports",
  "/dashboard/contracts",
  "/dashboard/profile",
  "/dashboard/settings",
];

const ADMIN_ROUTES = [
  "/admin/dashboard",
  "/admin/investors",
  "/admin/investments",
  "/admin/loans",
  "/admin/payments",
  "/admin/repayment-schedule",
  "/admin/timeline",
  "/admin/reports",
  "/admin/contracts",
  "/admin/notifications",
  "/admin/settings",
  "/admin/profile",
];

async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: /^Continue$/ }).click();
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 15000 });
}

async function visit(page, path, errors) {
  const pageErrors = [];
  const onConsole = (msg) => {
    if (msg.type() === "error") pageErrors.push(msg.text());
  };
  const onPageError = (err) => pageErrors.push(`PAGE ERROR: ${err.message}`);
  page.on("console", onConsole);
  page.on("pageerror", onPageError);

  let status = 0;
  try {
    const res = await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 30000 });
    status = res?.status() ?? 0;
    await page.waitForTimeout(800);
    const title = await page.title();
    const bodyText = await page.locator("body").innerText();
    const crashed =
      bodyText.includes("Application error") ||
      bodyText.includes("Unhandled Runtime Error") ||
      bodyText.includes("Something went wrong");
    errors.push({
      path,
      status,
      title,
      crashed,
      consoleErrors: [...pageErrors],
      finalUrl: page.url(),
    });
  } catch (e) {
    errors.push({
      path,
      status,
      crashed: true,
      consoleErrors: [...pageErrors, String(e)],
      finalUrl: page.url(),
    });
  } finally {
    page.off("console", onConsole);
    page.off("pageerror", onPageError);
  }
}

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();
const results = [];

for (const path of PUBLIC_ROUTES) {
  await visit(page, path, results);
}

await login(page, "investor@buyback.com", "Investor@123");
for (const path of INVESTOR_ROUTES) {
  await visit(page, path, results);
}

await page.getByRole("menuitem", { name: /Log out/i }).click().catch(async () => {
  await page.goto(`${BASE}/login`);
});
await page.waitForTimeout(500);

await login(page, "admin@buyback.com", "Admin@123");
for (const path of ADMIN_ROUTES) {
  await visit(page, path, results);
}

await browser.close();

const failed = results.filter(
  (r) =>
    r.crashed ||
    r.status >= 400 ||
    r.consoleErrors.some((e) => e.includes("PAGE ERROR") || e.includes("Uncaught"))
);

console.log(JSON.stringify({ total: results.length, failed: failed.length, results }, null, 2));
process.exit(failed.length > 0 ? 1 : 0);
