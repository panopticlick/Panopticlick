const { chromium } = require("playwright");

const baseUrl = process.env.QA_BASE_URL?.replace(/\/$/, "");
const qaMode = process.env.QA_MODE || "full";
if (!baseUrl) {
  throw new Error("Set QA_BASE_URL to the Pages preview or production origin.");
}
if (!["full", "blocker"].includes(qaMode)) {
  throw new Error(`Unsupported QA_MODE: ${qaMode}`);
}

const issues = [];
const evidence = {};
const consoleErrors = [];
const pageErrors = [];

function watchPage(page, label, { ignoreExpectedBaitFailures = false } = {}) {
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    const text = message.text();
    if (
      ignoreExpectedBaitFailures &&
      /bait\/|ERR_FAILED|ERR_BLOCKED_BY_CLIENT/.test(text)
    ) {
      return;
    }
    consoleErrors.push({ label, text });
  });
  page.on("pageerror", (error) =>
    pageErrors.push({
      label,
      stage: page.__panopticlickQaStage || "unknown",
      url: page.url(),
      text: String(error),
      stack: error.stack || "",
    })
  );
  return page.addInitScript(() => {
    window.__panopticlickCspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__panopticlickCspViolations.push({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
      });
    });
  });
}

async function cspEvidence(page) {
  return page.evaluate(() => window.__panopticlickCspViolations || []);
}

async function runMobileLocalFlow(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.__panopticlickQaStage = "initial-load";
  await watchPage(page, "mobile-home");
  const scanRequests = [];
  page.on("request", (request) => {
    if (/\/v1\/scan\//.test(request.url())) scanRequests.push(request.url());
  });

  await page.goto(`${baseUrl}/?qa=mobile-local`, { waitUntil: "domcontentloaded" });
  const consentRegion = page.locator("#site-consent-banner");
  await consentRegion.waitFor({ state: "visible", timeout: 10_000 });

  const initial = {
    title: await page.title(),
    h1Count: await page.locator("h1").count(),
    viewport: await page.evaluate(() => ({
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    })),
    consentVisible: await consentRegion.isVisible(),
    reducedMotion: await page.evaluate(() =>
      matchMedia("(prefers-reduced-motion: reduce)").matches
    ),
    primaryAction: await page
      .getByRole("button", { name: "Start Investigation" })
      .evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          top: Math.round(rect.top),
          bottom: Math.round(rect.bottom),
          inFirstViewport: rect.top >= 0 && rect.bottom <= innerHeight,
        };
      }),
  };

  await page.getByRole("button", { name: "Local-only" }).click();
  page.__panopticlickQaStage = "local-scan";
  await page.getByRole("button", { name: "Start Investigation" }).click();
  await page.getByRole("button", { name: "Authorize the investigation" }).click();
  await page
    .getByText("12 exhibits", { exact: false })
    .waitFor({ state: "visible", timeout: 30_000 });

  await page.locator("#valuation").scrollIntoViewIfNeeded();
  await page.waitForFunction(() => {
    const counter = document.querySelector(
      '#valuation p[aria-label^="Average modeled clearing value"]'
    );
    return counter && !counter.textContent?.includes("$0.00");
  });
  const valuationText = await page.locator("#valuation").innerText();
  const averageCPM = Number(
    valuationText.match(/AVERAGE MODELED CLEARING VALUE\s+\$([0-9.]+)/)?.[1]
  );
  const perImpression = Number(
    valuationText.match(/approximately \$([0-9.]+) for one impression/)?.[1]
  );

  await page.locator("#defense").scrollIntoViewIfNeeded();
  await page
    .getByText("Protection score", { exact: true })
    .waitFor({ state: "visible", timeout: 10_000 });
  const defenseVisible = /protection score/i.test(
    await page.locator("#defense").innerText()
  );

  page.__panopticlickQaStage = "restore-reload";
  await page.reload({ waitUntil: "domcontentloaded" });
  const restoredBanner = page.getByText("Case file reopened from this device", {
    exact: false,
  });
  const restored = await restoredBanner
    .waitFor({ state: "visible", timeout: 10_000 })
    .then(() => true)
    .catch(() => false);
  await page.getByRole("button", { name: "Scan again" }).click();
  page.__panopticlickQaStage = "reset-reload";
  await page.reload({ waitUntil: "domcontentloaded" });
  const resetPersisted = await page
    .getByRole("button", { name: "Authorize the investigation" })
    .isVisible();

  const testNodeMotion = await page.evaluate(() => {
    const node = document.createElement("span");
    node.className = "cursor";
    document.body.appendChild(node);
    const duration = getComputedStyle(node).animationDuration;
    node.remove();
    return duration;
  });

  const screenshot = await page.screenshot({ type: "jpeg", quality: 60 });
  const result = {
    initial,
    localOnlyScanRequests: scanRequests.length,
    dossierUnlocked: Number.isFinite(averageCPM),
    averageCPM,
    perImpression,
    defenseVisible,
    restored,
    resetPersisted,
    cssAnimationDurationUnderReduce: testNodeMotion,
    horizontalOverflow: await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth
    ),
    overflowElements: await page.evaluate(() =>
      [...document.querySelectorAll("*")]
        .map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            tag: node.tagName,
            className:
              typeof node.className === "string" ? node.className.slice(0, 180) : "",
            text: node.textContent?.trim().replace(/\s+/g, " ").slice(0, 100) || "",
            left: Math.round(rect.left),
            right: Math.round(rect.right),
          };
        })
        .filter((item) => item.left < -1 || item.right > innerWidth + 1)
        .slice(0, 12)
    ),
    screenshotBytes: screenshot.length,
    cspViolations: await cspEvidence(page),
  };

  await context.close();
  return result;
}

async function runDesktopAndDialog(browser) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "no-preference",
  });
  await context.addInitScript(() => {
    localStorage.setItem("panopticlick:consent", "denied");
  });
  const page = await context.newPage();
  page.__panopticlickQaStage = "tests-dialog";
  await watchPage(page, "desktop");

  await page.goto(`${baseUrl}/tests/?qa=desktop`, { waitUntil: "domcontentloaded" });
  const trigger = page.getByRole("button", { name: "Ask the analysis agent" });
  await page
    .locator(
      'button[aria-label="Ask the analysis agent"][data-hydrated="true"]:not([disabled])'
    )
    .waitFor({ state: "visible", timeout: 10_000 });
  await trigger.focus();
  await trigger.click();
  const input = page.getByRole("textbox", { name: "Ask the agent a question" });
  await input.waitFor({ state: "visible", timeout: 10_000 });
  const inputFocused = await input.evaluate((node) => node === document.activeElement);
  await page.keyboard.press("Escape");
  await input.waitFor({ state: "hidden", timeout: 10_000 });
  const dialogClosed = await input.isHidden();
  await page.waitForFunction(
    () => document.activeElement?.getAttribute("aria-label") === "Ask the analysis agent"
  );
  const focusReturned = await trigger.evaluate((node) => node === document.activeElement);

  page.__panopticlickQaStage = "desktop-home";
  await page.goto(`${baseUrl}/?qa=desktop-home`, { waitUntil: "domcontentloaded" });
  await page.locator("h1").first().waitFor({ state: "visible" });
  const screenshot = await page.screenshot({ type: "jpeg", quality: 60 });
  const result = {
    viewport: await page.evaluate(() => ({
      innerWidth,
      innerHeight,
      scrollWidth: document.documentElement.scrollWidth,
    })),
    h1Count: await page.locator("h1").count(),
    dialog: { inputFocused, dialogClosed, focusReturned },
    horizontalOverflow: await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth
    ),
    screenshotBytes: screenshot.length,
    cspViolations: await cspEvidence(page),
  };

  await context.close();
  return result;
}

async function runBlocker(browser, simulatedBlocking) {
  const context = await browser.newContext({
    viewport: { width: 1024, height: 900 },
  });
  if (simulatedBlocking) {
    await context.route("**/bait/**", async (route) => {
      if (route.request().url().endsWith("/bait/control.js")) {
        await route.continue();
      } else {
        await route.abort("blockedbyclient");
      }
    });
  }
  const page = await context.newPage();
  page.__panopticlickQaStage = simulatedBlocking
    ? "simulated-blocker"
    : "control-blocker";
  await watchPage(
    page,
    simulatedBlocking ? "blocker-simulated" : "blocker-control",
    { ignoreExpectedBaitFailures: simulatedBlocking }
  );
  await page.goto(
    `${baseUrl}/tests/blocker/?qa=${simulatedBlocking ? "blocked" : "control"}`,
    { waitUntil: "domcontentloaded" }
  );
  // The test deliberately adds transient script probes to <head>. Wait for the
  // client boundary's explicit hydration gate instead of racing it with an
  // arbitrary timeout.
  const startButton = page.getByRole("button", { name: "Start Blocker Test" });
  await startButton.waitFor({ state: "visible" });
  await startButton.click();
  const resultLine = simulatedBlocking
    ? page.getByText(
        /^(?:uBlock Origin|AdGuard|Brave Shields|Privacy Badger|Ghostery|Content blocker) detected$/,
        { exact: true }
      )
    : page.getByText("No ad blocker detected", { exact: true });
  await resultLine.waitFor({
    state: "visible",
    timeout: 30_000,
  });
  const result = {
    resultText: await resultLine.innerText(),
    resultVisible: await resultLine.isVisible(),
    horizontalOverflow: await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth
    ),
    cspViolations: await cspEvidence(page),
  };
  await context.close();
  return result;
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  try {
    if (qaMode === "full") {
      evidence.mobile = await runMobileLocalFlow(browser);
      evidence.desktop = await runDesktopAndDialog(browser);
    }
    evidence.blockerControl = await runBlocker(browser, false);
    evidence.blockerSimulated = await runBlocker(browser, true);
  } finally {
    await browser.close();
  }

  if (qaMode === "full") {
    if (evidence.mobile.initial.h1Count !== 1) issues.push("mobile homepage must have one h1");
    if (!evidence.mobile.initial.consentVisible) issues.push("consent banner is missing");
    if (!evidence.mobile.initial.reducedMotion) issues.push("reduced-motion context was not active");
    if (!evidence.mobile.initial.primaryAction.inFirstViewport) {
      issues.push(
        `mobile primary action is below the first viewport: ${JSON.stringify(
          evidence.mobile.initial.primaryAction
        )}`
      );
    }
    if (evidence.mobile.localOnlyScanRequests !== 0) {
      issues.push("local-only scan unexpectedly called the scan API");
    }
    if (!evidence.mobile.dossierUnlocked) issues.push("scan did not unlock dossier");
    if (!evidence.mobile.defenseVisible) issues.push("defense section did not unlock");
    if (
      !Number.isFinite(evidence.mobile.averageCPM) ||
      evidence.mobile.averageCPM <= 0 ||
      !Number.isFinite(evidence.mobile.perImpression) ||
      Math.abs(evidence.mobile.averageCPM / 1000 - evidence.mobile.perImpression) >
        0.00001
    ) {
      issues.push(
        `inconsistent valuation: ${evidence.mobile.averageCPM} CPM / ${evidence.mobile.perImpression} per impression`
      );
    }
    if (!evidence.mobile.restored) issues.push("saved scan did not restore after reload");
    if (!evidence.mobile.resetPersisted) issues.push("Scan again did not clear the restored case");
    const reducedDuration = evidence.mobile.cssAnimationDurationUnderReduce;
    const reducedDurationMs = reducedDuration.endsWith("ms")
      ? Number.parseFloat(reducedDuration)
      : Number.parseFloat(reducedDuration) * 1000;
    if (!Number.isFinite(reducedDurationMs) || reducedDurationMs > 1) {
      issues.push(
        `CSS animation was not reduced: ${evidence.mobile.cssAnimationDurationUnderReduce}`
      );
    }
    if (evidence.desktop.h1Count !== 1) issues.push("desktop homepage must have one h1");
    if (!Object.values(evidence.desktop.dialog).every(Boolean)) {
      issues.push(`dialog keyboard contract failed: ${JSON.stringify(evidence.desktop.dialog)}`);
    }
  }
  for (const [name, result] of Object.entries({
    ...(qaMode === "full"
      ? { mobile: evidence.mobile, desktop: evidence.desktop }
      : {}),
    blockerControl: evidence.blockerControl,
    blockerSimulated: evidence.blockerSimulated,
  })) {
    if (result.horizontalOverflow > 0) {
      issues.push(`${name} overflows by ${result.horizontalOverflow}px`);
    }
    if (result.cspViolations.length) issues.push(`${name} has CSP violations`);
  }
  if (!evidence.blockerControl.resultVisible) issues.push("blocker control run failed");
  if (!evidence.blockerSimulated.resultVisible) {
    issues.push("simulated blocker run did not detect blocked bait");
  }
  if (consoleErrors.length) issues.push("console errors detected");
  if (pageErrors.length) issues.push("uncaught page errors detected");

  evidence.consoleErrors = consoleErrors;
  evidence.pageErrors = pageErrors;
  console.log(JSON.stringify({ ok: issues.length === 0, issues, evidence }, null, 2));
  if (issues.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
