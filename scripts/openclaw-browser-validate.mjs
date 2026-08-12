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

async function waitForVisible(locator, name, timeout) {
  const heartbeat = setInterval(() => {
    void locator
      .isVisible()
      .then(async (visible) => {
        const scanText = await locator
          .locator("xpath=ancestor::*[@id='scan']")
          .innerText()
          .catch(() => "");
        console.log(
          `WAIT  ${name} visible=${visible} :: ${scanText.replace(/\s+/g, " ").slice(0, 420)}`,
        );
      })
      .catch(() => console.log(`WAIT  ${name} visible=unknown`));
  }, 5000);
  try {
    await locator.waitFor({ state: "visible", timeout });
  } finally {
    clearInterval(heartbeat);
  }
}

const browser = await chromium.launch({ headless: true });
let page;
try {
  page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  // Production builds point at the real API. A loopback preview has a
  // different origin, so stub only the DNS endpoint that the edge cannot
  // observe anyway; all production runs continue to exercise the live API.
  const previewUrl = new URL(BASE_URL);
  const isLoopback =
    previewUrl.hostname === "localhost" ||
    previewUrl.hostname === "127.0.0.1" ||
    previewUrl.hostname === "::1";
  if (isLoopback) {
    await page.route("**/v1/defense/dns", async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": BASE_URL,
        },
        body: JSON.stringify({
          success: true,
          resolver: {
            ip: "unavailable",
            provider: "Unknown",
            isEncrypted: false,
          },
          leakTest: {
            passed: false,
            leakedIPs: [],
            status: "inconclusive",
          },
        }),
      });
    });
  }
  // OpenClaw browser workspaces may retain a prior local-only case file. Each
  // acceptance run must start from the authorization gate, not restored state.
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  page.on("console", (m) => {
    if (m.type() === "error") results.errors.push(m.text().slice(0, 200));
  });
  page.on("pageerror", (e) =>
    results.errors.push("pageerror: " + e.message.slice(0, 200)),
  );
  page.on("requestfailed", (request) => {
    results.errors.push(
      `requestfailed: ${request.url().slice(0, 160)} :: ${request.failure()?.errorText || "unknown"}`,
    );
  });
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
  const authorize = page.getByRole("button", {
    name: /authorize the investigation/i,
  });
  await authorize.waitFor({ state: "visible", timeout: 30000 });
  await authorize.click();
  step("scan authorized", true);
  await waitForVisible(
    page.getByRole("heading", { name: "Investigation Complete" }),
    "scan completion",
    45000,
  );
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

  // --- simulations honor the same local-only default ---
  apiRequests.length = 0;
  await page.goto(`${BASE_URL}/simulation/rtb/`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  const auctionButton = page.getByRole("button", {
    name: /start auction with my fingerprint/i,
  });
  await auctionButton.waitFor({ state: "visible", timeout: 30000 });
  await auctionButton.click();
  await waitForVisible(
    page.getByRole("heading", { name: "Auction Results" }),
    "RTB result",
    30000,
  );
  step(
    "RTB stays local without consent",
    apiRequests.length === 0,
    apiRequests[0] || "none",
  );

  // The edge endpoint cannot observe a device resolver; the UI must not turn
  // that limitation into a false secure verdict.
  await page.goto(`${BASE_URL}/tests/dns/`, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  const dnsButton = page.getByRole("button", { name: /start dns leak test/i });
  await dnsButton.waitFor({ state: "visible", timeout: 30000 });
  await dnsButton.click();
  await waitForVisible(
    page.getByRole("heading", { name: "DNS leak status inconclusive" }),
    "DNS result",
    30000,
  );
  step(
    "DNS result is explicitly inconclusive",
    (await page.getByRole("heading", { name: "DNS leak status inconclusive" }).count()) > 0 &&
      (await page.getByText(/No DNS Leak Detected/i).count()) === 0,
  );

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
  const failureBody = await page
    .locator("body")
    .innerText()
    .catch(() => "<body unavailable>");
  console.log(
    `\n--- failure snapshot ---\n${failureBody.replace(/\s+/g, " ").slice(0, 1200)}`,
  );
  const runtimeResources = await page
    .evaluate(() =>
      performance
        .getEntriesByType("resource")
        .map((entry) => entry.name)
        .filter((name) => /sdk|valuation|chunk|_next\/static/i.test(name))
        .slice(-30),
    )
    .catch(() => []);
  console.log(`--- runtime resources ---\n${runtimeResources.join("\n") || "none"}`);
  await page
    .screenshot({ path: `${ARTIFACT_DIR}/failure.png`, fullPage: false })
    .catch(() => undefined);
  step("run completed without exception", false, e.message);
} finally {
  const blocking = results.errors.filter(
    (e) => !NOISE.test(e) && !/^Failed to load resource/.test(e),
  );
  console.log("\n--- console errors (blocking only) ---");
  console.log(blocking.length ? blocking.join("\n") : "none");
  step(
    "no blocking console errors",
    blocking.length === 0,
    blocking[0] || "none",
  );
  const failed = results.steps.filter((s) => !s.ok);
  console.log(
    `\n=== ${results.steps.length - failed.length}/${results.steps.length} steps passed ===`,
  );
  await browser.close();
  process.exit(failed.length ? 1 : 0);
}
