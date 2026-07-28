/**
 * Turns a collected fingerprint (plus optional server-side network
 * intelligence) into the list of evidence items shown in the redacted dossier.
 *
 * Kept as a plain function so the same shape can be persisted to localStorage
 * and restored on a later visit without re-running the collectors.
 */

import type { FingerprintPayload, NetworkIntelligence } from '@panopticlick/types';

export interface DossierEntry {
  id: string;
  label: string;
  value: string;
  /** Why an advertiser cares about this line */
  note: string;
  /** Server-enriched entries are labelled separately from browser-observed ones */
  source: 'browser' | 'network';
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function hashPreview(hash: string | undefined | null): string | null {
  if (!hash) return null;
  return `${hash.slice(0, 16)}…`;
}

export function buildDossier(
  fingerprint: FingerprintPayload,
  network?: NetworkIntelligence | null
): DossierEntry[] {
  const { hardware, software, capabilities } = fingerprint;
  const entries: DossierEntry[] = [
    {
      id: 'user-agent',
      label: 'User agent',
      value: truncate(software.userAgent, 72),
      note: 'Sent as a header on every single request — no JavaScript required.',
      source: 'browser',
    },
    {
      id: 'platform',
      label: 'Platform / vendor',
      value: `${software.platform || 'unknown'} · ${software.vendor || 'unknown'}`,
      note: 'Narrows you to an OS and browser family before anything else runs.',
      source: 'browser',
    },
    {
      id: 'screen',
      label: 'Display',
      value: `${hardware.screen.width}×${hardware.screen.height} @${hardware.screen.pixelRatio}x · ${hardware.screen.colorDepth}-bit`,
      note: 'Non-standard resolutions are rare enough to act as a near-unique tag.',
      source: 'browser',
    },
    {
      id: 'gpu',
      label: 'GPU renderer',
      value: hardware.gpu?.renderer
        ? truncate(hardware.gpu.renderer, 56)
        : 'blocked or unavailable',
      note: 'Names your graphics hardware, which usually names your device model.',
      source: 'browser',
    },
    {
      id: 'timezone',
      label: 'Timezone',
      value: `${software.timezone} (UTC${software.timezoneOffset <= 0 ? '+' : '-'}${Math.abs(software.timezoneOffset / 60)})`,
      note: 'Locates you to a region without ever asking for location permission.',
      source: 'browser',
    },
    {
      id: 'languages',
      label: 'Languages',
      value: software.languages.length > 0 ? software.languages.join(', ') : software.language,
      note: 'Language order leaks nationality and often bilingual background.',
      source: 'browser',
    },
    {
      id: 'fonts',
      label: 'Fonts detected',
      value: software.fonts ? `${software.fonts.count} of the probed set` : 'probe blocked',
      note: 'Installed fonts reveal your OS build, office suite, and design tools.',
      source: 'browser',
    },
    {
      id: 'canvas',
      label: 'Canvas signature',
      value:
        hashPreview(hardware.canvas?.hash) ??
        (hardware.canvas?.blocked ? 'blocked' : 'unavailable'),
      note: hardware.canvas?.spoofed
        ? 'Randomized per read — your protection is working here.'
        : 'A stable hash of how your machine draws text and shapes.',
      source: 'browser',
    },
    {
      id: 'audio',
      label: 'Audio signature',
      value: hardware.audio
        ? `${hashPreview(hardware.audio.hash)} · ${hardware.audio.sampleRate}Hz`
        : 'blocked or unavailable',
      note: 'Floating-point rounding in your audio stack differs per device.',
      source: 'browser',
    },
    {
      id: 'hardware',
      label: 'Cores / memory',
      value: `${hardware.cpu || 'unknown'} cores · ${
        hardware.memory ? `${hardware.memory} GB` : 'memory hidden'
      } · ${hardware.touchPoints} touch points`,
      note: 'Coarse hardware class, useful for guessing how much you can spend.',
      source: 'browser',
    },
    {
      id: 'privacy-signals',
      label: 'Privacy signals',
      value: `DNT ${software.doNotTrack ?? 'not set'} · GPC ${
        software.globalPrivacyControl === null
          ? 'not set'
          : software.globalPrivacyControl
            ? 'on'
            : 'off'
      }`,
      note: 'Legally meaningful in some states, widely ignored everywhere else.',
      source: 'browser',
    },
    {
      id: 'capabilities',
      label: 'Storage & APIs',
      value: [
        capabilities.localStorage && 'localStorage',
        capabilities.indexedDB && 'indexedDB',
        capabilities.serviceWorker && 'serviceWorker',
        capabilities.webRTC && 'webRTC',
        capabilities.webAssembly && 'wasm',
      ]
        .filter(Boolean)
        .join(', ') || 'heavily restricted',
      note: 'Every available storage API is another place to hide an identifier.',
      source: 'browser',
    },
  ];

  if (!network) return entries;

  entries.push(
    {
      id: 'network-org',
      label: 'Network operator',
      value: `${network.asnOrg || 'unknown'}${network.asn ? ` (${network.asn})` : ''}`,
      note: 'Your ASN separates home broadband from corporate, mobile, or hosting.',
      source: 'network',
    },
    {
      id: 'network-location',
      label: 'Observed location',
      value: [network.city, network.region, network.country].filter(Boolean).join(', ') ||
        'unresolved',
      note: 'Derived from your IP address at the edge — no permission prompt.',
      source: 'network',
    },
    {
      id: 'network-flags',
      label: 'Connection profile',
      value:
        [
          network.isVPN && 'VPN',
          network.isProxy && 'proxy',
          network.isTor && 'Tor',
          network.isDatacenter && 'datacenter',
        ]
          .filter(Boolean)
          .join(', ') || 'residential / no anonymizer detected',
      note: `Risk score ${network.riskScore}/100. Ad platforms price and filter on this.`,
      source: 'network',
    },
    {
      id: 'network-ip',
      label: 'IP address',
      value: `SHA-256 ${hashPreview(network.ipHash) ?? 'unavailable'}`,
      note: 'We only ever hold the hash. The ad industry holds the address itself.',
      source: 'network',
    }
  );

  return entries;
}
