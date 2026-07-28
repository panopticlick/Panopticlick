#!/usr/bin/env node
/**
 * One-off generator for the OG images (1200x630 PNG) in apps/web/public/.
 *
 * Not wired into the build — run manually from the repo root when the
 * designs need to change:
 *
 *   node scripts/generate-og-images.mjs
 *
 * Renders the "investigative journalism" case-file design with satori
 * (element tree -> SVG) and @resvg/resvg-js (SVG -> PNG). Fonts come from
 * the @fontsource devDependencies (woff files; satori cannot read woff2).
 */

import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';

const require = createRequire(import.meta.url);
const scriptDir = dirname(fileURLToPath(import.meta.url));
const outDir = join(scriptDir, '..', 'apps', 'web', 'public');

// Design system palette (see apps/web/tailwind.config.ts)
const PAPER = '#f4f4f5';
const PAPER_300 = '#d4d4d8';
const INK = '#18181b';
const INK_200 = '#52525b';
const INK_300 = '#71717a';
const HIGHLIGHT = '#fde047';
const STAMP_RED = '#dc2626';

const WIDTH = 1200;
const HEIGHT = 630;

function fontFile(pkg, file) {
  return join(dirname(require.resolve(`${pkg}/package.json`)), 'files', file);
}

async function loadFonts() {
  const load = (pkg, file) => readFile(fontFile(pkg, file));
  return [
    { name: 'Merriweather', weight: 900, style: 'normal', data: await load('@fontsource/merriweather', 'merriweather-latin-900-normal.woff') },
    { name: 'Merriweather', weight: 700, style: 'normal', data: await load('@fontsource/merriweather', 'merriweather-latin-700-normal.woff') },
    { name: 'Merriweather', weight: 400, style: 'normal', data: await load('@fontsource/merriweather', 'merriweather-latin-400-normal.woff') },
    { name: 'JetBrains Mono', weight: 700, style: 'normal', data: await load('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-700-normal.woff') },
    { name: 'JetBrains Mono', weight: 400, style: 'normal', data: await load('@fontsource/jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff') },
    { name: 'Inter', weight: 400, style: 'normal', data: await load('@fontsource/inter', 'inter-latin-400-normal.woff') },
  ];
}

// Minimal createElement for satori's React-element input
const h = (type, props = {}, ...children) => ({
  type,
  props: {
    ...props,
    children: children.length <= 1 ? children[0] : children,
  },
});

const CARDS = [
  {
    file: 'og-image.png',
    caseNo: 'PNP-2026-001',
    tag: 'BROWSER FINGERPRINT TEST',
    headline: [
      { text: 'How much is' },
      { text: 'your browser', mark: true },
      { text: 'worth to advertisers?' },
    ],
    sub: 'Free fingerprint scan: your entropy, your ad-auction value, your defenses.',
  },
  {
    file: 'og-webrtc-test.png',
    caseNo: 'PNP-2026-002',
    tag: 'WEBRTC LEAK TEST',
    headline: [
      { text: 'WebRTC can leak' },
      { text: 'your real IP', mark: true },
      { text: 'behind any VPN.' },
    ],
    sub: 'One JavaScript call is enough. Test your browser in seconds.',
  },
  {
    file: 'og-dns-test.png',
    caseNo: 'PNP-2026-003',
    tag: 'DNS LEAK TEST',
    headline: [
      { text: 'Your DNS resolver' },
      { text: 'sees every site', mark: true },
      { text: 'you visit.' },
    ],
    sub: 'Find out who answers your DNS queries — and whether they are encrypted.',
  },
  {
    file: 'og-blocker-test.png',
    caseNo: 'PNP-2026-004',
    tag: 'AD BLOCKER TEST',
    headline: [
      { text: 'Does your ad blocker' },
      { text: 'actually block', mark: true },
      { text: 'the trackers?' },
    ],
    sub: 'We fire bait trackers at your browser and score what gets through.',
  },
  {
    file: 'og-hsts-demo.png',
    caseNo: 'PNP-2026-005',
    tag: 'HSTS SUPERCOOKIE DEMO',
    headline: [
      { text: 'The supercookie that' },
      { text: 'survives clearing', mark: true },
      { text: 'your cookies.' },
    ],
    sub: 'Live demonstration of HSTS-based tracking — it works in incognito too.',
  },
  {
    file: 'og-rtb-simulator.png',
    caseNo: 'PNP-2026-006',
    tag: 'RTB AUCTION SIMULATOR',
    headline: [
      { text: 'Watch advertisers' },
      { text: 'bid for your data', mark: true },
      { text: 'in real time.' },
    ],
    sub: 'A simulated programmatic auction, priced with real market CPM ranges.',
  },
];

function renderCard({ caseNo, tag, headline, sub }) {
  return h(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        backgroundColor: PAPER,
        padding: 20,
        fontFamily: 'Merriweather',
        color: INK,
      },
    },
    h(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          border: `4px solid ${INK}`,
          position: 'relative',
        },
      },
      // Meta row: case number + warning
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 44px 14px 44px',
            fontFamily: 'JetBrains Mono',
            fontSize: 21,
            letterSpacing: 2,
            color: INK_200,
          },
        },
        h('div', {}, `CASE FILE · ${caseNo}`),
        h('div', { style: { color: STAMP_RED, fontWeight: 700 } }, 'DO NOT DISTRIBUTE')
      ),
      // Masthead
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '0 44px',
            borderTop: `5px solid ${INK}`,
            borderBottom: `2px solid ${INK}`,
            padding: '10px 0 12px 0',
          },
        },
        h(
          'div',
          { style: { fontSize: 52, fontWeight: 900, letterSpacing: 4 } },
          'PANOPTICLICK'
        ),
        h(
          'div',
          {
            style: {
              fontFamily: 'JetBrains Mono',
              fontSize: 17,
              letterSpacing: 7,
              color: INK_300,
              marginTop: 6,
            },
          },
          'BUREAU OF DIGITAL INVESTIGATION'
        )
      ),
      // Headline block
      h(
        'div',
        {
          style: {
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            justifyContent: 'center',
            padding: '0 44px',
          },
        },
        // Redaction bars (decorative, in-flow so they never clip the headline)
        h(
          'div',
          { style: { display: 'flex', marginBottom: 18 } },
          h('div', { style: { width: 210, height: 14, backgroundColor: INK, marginRight: 10 } }),
          h('div', { style: { width: 120, height: 14, backgroundColor: INK } })
        ),
        ...headline.map((line) =>
          h(
            'div',
            { style: { display: 'flex', marginBottom: 4 } },
            h(
              'div',
              {
                style: {
                  fontSize: 58,
                  fontWeight: 900,
                  lineHeight: 1.15,
                  ...(line.mark
                    ? { backgroundColor: HIGHLIGHT, padding: '0 14px' }
                    : {}),
                },
              },
              line.text
            )
          )
        ),
        h(
          'div',
          {
            style: {
              fontFamily: 'JetBrains Mono',
              fontSize: 24,
              color: INK_200,
              marginTop: 22,
              maxWidth: 980,
              lineHeight: 1.4,
            },
          },
          sub
        )
      ),
      // Bottom strip
      h(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: HIGHLIGHT,
            borderTop: `4px solid ${INK}`,
            padding: '16px 44px',
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: 2,
          },
        },
        h('div', {}, 'panopticlick.org'),
        h('div', {}, tag)
      ),
      // CLASSIFIED stamp
      h(
        'div',
        {
          style: {
            position: 'absolute',
            top: 168,
            right: 52,
            transform: 'rotate(-12deg)',
            border: `6px solid ${STAMP_RED}`,
            color: STAMP_RED,
            fontFamily: 'JetBrains Mono',
            fontWeight: 700,
            fontSize: 32,
            letterSpacing: 6,
            padding: '8px 22px',
            opacity: 0.85,
          },
        },
        'CLASSIFIED'
      )
    )
  );
}

async function main() {
  const fonts = await loadFonts();

  for (const card of CARDS) {
    const svg = await satori(renderCard(card), {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    });

    const png = new Resvg(svg, {
      fitTo: { mode: 'width', value: WIDTH },
      background: PAPER,
    })
      .render()
      .asPng();

    const outPath = join(outDir, card.file);
    await writeFile(outPath, png);
    console.log(`wrote ${card.file} (${(png.length / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
