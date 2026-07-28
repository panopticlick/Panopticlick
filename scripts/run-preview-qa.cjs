const { createReadStream, readFileSync } = require("node:fs");
const { stat } = require("node:fs/promises");
const { createServer } = require("node:http");
const path = require("node:path");
const { spawn } = require("node:child_process");

const port = Number(process.env.QA_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error(`Invalid QA_PORT: ${process.env.QA_PORT}`);
}

const baseUrl = `http://127.0.0.1:${port}`;
const outputRoot = path.resolve(process.cwd(), "apps/web/out");

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff2", "font/woff2"],
]);

function universalHeaders() {
  const headerPath = path.join(outputRoot, "_headers");
  const headers = {};
  let inUniversalBlock = false;

  for (const rawLine of readFileSync(headerPath, "utf8").split(/\r?\n/)) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith("#")) continue;
    if (!/^\s/.test(rawLine)) {
      inUniversalBlock = rawLine.trim() === "/*";
      continue;
    }
    if (!inUniversalBlock) continue;

    const separator = rawLine.indexOf(":");
    if (separator < 0) continue;
    headers[rawLine.slice(0, separator).trim()] = rawLine
      .slice(separator + 1)
      .trim();
  }

  return headers;
}

const sharedHeaders = universalHeaders();

async function resolveStaticFile(requestUrl) {
  const url = new URL(requestUrl, baseUrl);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return null;
  }

  const relative = pathname.endsWith("/")
    ? `${pathname.slice(1)}index.html`
    : pathname.slice(1);
  const candidate = path.resolve(outputRoot, relative || "index.html");
  if (candidate !== outputRoot && !candidate.startsWith(`${outputRoot}${path.sep}`)) {
    return null;
  }

  try {
    const metadata = await stat(candidate);
    if (metadata.isFile()) return candidate;
    if (metadata.isDirectory()) {
      const indexFile = path.join(candidate, "index.html");
      if ((await stat(indexFile)).isFile()) return indexFile;
    }
  } catch {
    // Fall through to the extensionless static-export variant.
  }

  if (!path.extname(candidate)) {
    try {
      const htmlFile = `${candidate}.html`;
      if ((await stat(htmlFile)).isFile()) return htmlFile;
    } catch {
      // A normal 404 is handled by the caller.
    }
  }
  return null;
}

function waitForExit(child) {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => resolve({ code, signal }));
  });
}

async function run() {
  const server = createServer(async (request, response) => {
    const file = await resolveStaticFile(request.url || "/");
    if (!file) {
      response.writeHead(404, {
        ...sharedHeaders,
        "Content-Type": "text/plain; charset=utf-8",
      });
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      ...sharedHeaders,
      "Cache-Control": "no-store",
      "Content-Type":
        contentTypes.get(path.extname(file).toLowerCase()) ||
        "application/octet-stream",
    });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(file).pipe(response);
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  try {
    const qa = spawn(process.execPath, ["scripts/qa-preview.cjs"], {
      cwd: process.cwd(),
      env: { ...process.env, QA_BASE_URL: baseUrl },
      stdio: "inherit",
    });
    const result = await waitForExit(qa);
    if (result.code !== 0) process.exitCode = result.code || 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
