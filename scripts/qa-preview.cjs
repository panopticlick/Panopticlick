const { chromium } = require("playwright");

const baseUrl = process.env.QA_BASE_URL;
if (!baseUrl) {
  throw new Error("Set QA_BASE_URL to the Pages preview or production origin.");
}

const issues = [];
const evidence = {};

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));
  await page.addInitScript(() => {
    window.__panopticlickCspViolations = [];
    document.addEventListener("securitypolicyviolation", (event) => {
      window.__panopticlickCspViolations.push({
        directive: event.effectiveDirective,
        blocked: event.blockedURI,
      });
    });
  });

  await page.goto(`${baseUrl}/?mobile-qa=1`, { waitUntil: "networkidle" });
  const consentRegion = page.locator("#site-consent-banner");
  await consentRegion.waitFor({ state: "visible", timeout: 10_000 });
  evidence.initial = {
    title: await page.title(),
    h1Count: await page.locator("h1").count(),
    viewport: await page.evaluate(() => ({
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    })),
    consentVisible: await consentRegion.isVisible(),
  };

  await page.getByRole("button", { name: "Local-only" }).click();
  await page.getByRole("button", { name: "Start Investigation" }).click();
  await page
    .getByRole("button", { name: "Authorize the investigation" })
    .click();
  await page
    .getByText("12 exhibits", { exact: false })
    .waitFor({ state: "visible", timeout: 30_000 });
  await page.locator("#valuation").scrollIntoViewIfNeeded();

  const valuationText = await page.locator("#valuation").innerText();
  const averageCPM = Number(
    valuationText.match(
      /AVERAGE MODELED CLEARING VALUE\s+\$([0-9.]+)/,
    )?.[1],
  );
  const perImpression = Number(
    valuationText.match(/approximately \$([0-9.]+) for one impression/)?.[1],
  );
  await page.locator("#defense").scrollIntoViewIfNeeded();
  await page
    .getByText("Protection score", { exact: true })
    .waitFor({ state: "visible", timeout: 10_000 });
  evidence.home = {
    dossierUnlocked: await page
      .getByText("12 exhibits", { exact: false })
      .isVisible(),
    averageCPM,
    perImpression,
    defenseVisible: /protection score/i.test(
      await page.locator("#defense").innerText(),
    ),
    horizontalOverflow: await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  };

  await page.goto(`${baseUrl}/tests/blocker/?mobile-qa=1`, {
    waitUntil: "networkidle",
  });
  await page.getByRole("button", { name: "Start Blocker Test" }).click();
  await page
    .getByText("No ad blocker detected", { exact: true })
    .waitFor({ state: "visible", timeout: 30_000 });
  evidence.blocker = {
    noBlockerResult: await page
      .getByText("No ad blocker detected", { exact: true })
      .isVisible(),
    horizontalOverflow: await page.evaluate(
      () => document.documentElement.scrollWidth - innerWidth,
    ),
  };

  evidence.cspViolations = await page.evaluate(
    () => window.__panopticlickCspViolations || [],
  );
  evidence.consoleErrors = consoleErrors;
  evidence.pageErrors = pageErrors;

  if (evidence.initial.h1Count !== 1) issues.push("homepage must have one h1");
  if (!evidence.initial.consentVisible) issues.push("consent banner is missing");
  if (!evidence.home.dossierUnlocked) issues.push("scan did not unlock dossier");
  if (
    !Number.isFinite(evidence.home.averageCPM) ||
    evidence.home.averageCPM <= 0 ||
    !Number.isFinite(evidence.home.perImpression) ||
    Math.abs(evidence.home.averageCPM / 1000 - evidence.home.perImpression) >
      0.00001
  ) {
    issues.push(
      `inconsistent valuation: ${evidence.home.averageCPM} CPM / ${evidence.home.perImpression} per impression`,
    );
  }
  if (!evidence.home.defenseVisible) issues.push("defense section is missing");
  if (!evidence.blocker.noBlockerResult) {
    issues.push("blocker control run did not produce the no-blocker result");
  }
  if (evidence.home.horizontalOverflow > 0) {
    issues.push(`homepage overflows by ${evidence.home.horizontalOverflow}px`);
  }
  if (evidence.blocker.horizontalOverflow > 0) {
    issues.push(
      `blocker page overflows by ${evidence.blocker.horizontalOverflow}px`,
    );
  }
  if (evidence.cspViolations.length) issues.push("CSP violations detected");
  if (consoleErrors.length) issues.push("console errors detected");
  if (pageErrors.length) issues.push("uncaught page errors detected");

  console.log(JSON.stringify({ ok: issues.length === 0, issues, evidence }, null, 2));
  await browser.close();
  if (issues.length) process.exitCode = 1;
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
