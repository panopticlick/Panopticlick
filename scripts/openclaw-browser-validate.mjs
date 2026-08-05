/**
 * Bounded browser acceptance for panopticlick.org, driven on OpenClaw via
 * `openclaw-ops e2e --project panopticlick-org`.
 *
 * Runs the real local-only scan on /scan/ (nothing stubbed) and checks the
 * shared scan machinery still renders the home-page investigation. A routine
 * pass stays under ~90s.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE_URL = (
  process.env.PANOPTICLICK_QA_BASE_URL ||
  process.env.OPENCLAW_TARGET_URL ||
  process.env.OPENCLAW_PREVIEW_URL ||
  "https://panopticlick.org"
).replace(/\/$/, "");
const ARTIFACT_DIR =
  process.env.OPENCLAW_ARTIFACT_DIR || "output/playwright/production";
// Cloudflare may inject its Web Analytics beacon after the response leaves
// Pages; the site's intentional strict CSP blocks that non-consensual script.
// Keep this exact platform violation out of the blocking console gate while
// continuing to fail on unrelated CSP or runtime errors.
const NOISE =
  /adsbygoogle|doubleclick|googlesyndication|aria-hidden|Intervention|favicon|\.ico|static\.cloudflareinsights\.com\/beacon\.min\.js\//i;

mkdirSync(ARTIFACT_DIR, { recursive: true });

const results = { steps: [], errors: [] };
const step = (name, ok, detail) => {
  results.steps.push({ name, ok, detail });
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}${detail ? "  :: " + detail : ""}`,
  );
};

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on("console", (m) => {
    if (m.type() === "error") results.errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) =>
    results.errors.push("pageerror: " + e.message.slice(0, 200)),
  );
  const badResponses = [];
  const apiRequests = [];
  page.on("response", (r) => {
    const u = r.url();
    if (
      u.startsWith(BASE_URL) &&
      r.status() >= 400 &&
      !u.includes("/not-a-real-page")
    ) {
      badResponses.push(`${r.status()} ${u.slice(0, 160)}`);
    }
  });
  page.on("request", (r) => {
    if (r.url().includes("api.panopticlick.org"))
      apiRequests.push(r.url().slice(0, 160));
  });

  // --- /scan/ standalone scanner page ---
  const scan = await page.goto(`${BASE_URL}/scan/`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  step(
    "/scan/ responds 200",
    scan?.status() === 200,
    `status=${scan?.status()}`,
  );
  step(
    "/scan/ h1 is the scanner",
    (await page.locator("h1").first().innerText()).includes(
      "Browser Fingerprint Scanner",
    ),
  );
  const canonical = await page
    .locator('link[rel="canonical"]')
    .first()
    .getAttribute("href");
  step(
    "/scan/ canonical points at /scan/",
    /\/scan\/$/.test(canonical || ""),
    canonical || "missing",
  );
  step(
    "header nav links to /scan/",
    (await page.locator('header nav a[href="/scan/"]').count()) > 0,
  );

  // Consent banner: keep the scan local-only, then authorize the collection.
  const localOnly = page.getByRole("button", { name: /local-only/i }).first();
  if (await localOnly.isVisible().catch(() => false)) await localOnly.click();
  await page
    .getByRole("button", { name: /authorize the investigation/i })
    .click();
  step("scan authorized", true);
  await page
    .getByText(/Investigation Complete/i)
    .first()
    .waitFor({ timeout: 45000 });
  step("scan completes on /scan/", true);

  const summary = await page.evaluate(() => document.body.innerText);
  const oneIn = (summary.match(/1 in [^\n]*browsers/i) || [null])[0];
  step(
    "uniqueness caption is well-formed",
    !!oneIn && !/1 in\s*1 in/i.test(oneIn),
    oneIn || "missing",
  );
  const exhibits = (summary.match(/(\d+)\s*exhibits/i) || [])[1];
  step(
    "dossier lists exhibits",
    Number(exhibits) >= 10,
    `exhibits=${exhibits}`,
  );
  step(
    "local-only scan never calls the API",
    apiRequests.length === 0,
    apiRequests[0] || "none",
  );
  await page.screenshot({
    path: `${ARTIFACT_DIR}/scan-complete.png`,
    fullPage: false,
  });

  // --- home page keeps the full investigation (shared components regression) ---
  const home = await page.goto(`${BASE_URL}/`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  step("home responds 200", home?.status() === 200, `status=${home?.status()}`);
  await page.locator("#scan-title").waitFor({ timeout: 30000 });
  await page.locator("#dossier-title").waitFor({ timeout: 30000 });
  const homeText = await page.evaluate(() => document.body.innerText);
  step(
    "home keeps File 02 investigation numbering",
    /file\s*02/i.test(homeText) && /the investigation/i.test(homeText),
  );
  step(
    "home keeps File 03 dossier",
    /file\s*03/i.test(homeText) && /the dossier/i.test(homeText),
  );

  // --- 404 behavior ---
  const nf = await page.goto(`${BASE_URL}/not-a-real-page`, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  step(
    "unknown path returns 404",
    nf?.status() === 404,
    `status=${nf?.status()}`,
  );

  step(
    "no failing first-party responses",
    badResponses.length === 0,
    badResponses.slice(0, 3).join(" | ") || "none",
  );
} catch (e) {
  step("run completed without exception", false, e.message);
} finally {
  const blocking = results.errors.filter(
    (e) => !NOISE.test(e) && !/^Failed to load resource/.test(e),
  );
  console.log("\n--- console errors (blocking only) ---");
  console.log(blocking.length ? blocking.join("\n") : "none");
  if (blocking.length) step("no blocking console errors", false, blocking[0]);
  const failed = results.steps.filter((s) => !s.ok);
  console.log(
    `\n=== ${results.steps.length - failed.length}/${results.steps.length} steps passed ===`,
  );
  await browser.close();
  process.exit(failed.length ? 1 : 0);
}
