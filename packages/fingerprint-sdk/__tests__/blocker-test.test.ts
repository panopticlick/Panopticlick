import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getBaitResources, quickBlockerDetect, runBlockerTests } from '../src/defense/blocker-test';

type ScriptBehavior = {
  type: 'load' | 'error';
  baitId?: string;
  control?: boolean;
};

class FakeScriptElement {
  src = '';
  async = false;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  remove = vi.fn();
}

function installFakeDom(behaviors: Record<string, ScriptBehavior>) {
  const originalDocument = globalThis.document;
  const runtime = globalThis as typeof globalThis & {
    __panopticlickBaitFlags?: Record<string, boolean>;
    __panopticlickControlLoaded?: boolean;
  };

  runtime.__panopticlickBaitFlags = {};
  delete runtime.__panopticlickControlLoaded;

  globalThis.document = {
    createElement: vi.fn(() => new FakeScriptElement()),
    head: {
      appendChild: vi.fn((script: FakeScriptElement) => {
        const behavior = behaviors[script.src];
        if (!behavior) {
          throw new Error(`No fake behavior registered for ${script.src}`);
        }

        queueMicrotask(() => {
          if (behavior.type === 'error') {
            script.onerror?.();
            return;
          }

          if (behavior.control) {
            runtime.__panopticlickControlLoaded = true;
          }

          if (behavior.baitId) {
            runtime.__panopticlickBaitFlags = runtime.__panopticlickBaitFlags || {};
            runtime.__panopticlickBaitFlags[behavior.baitId] = true;
          }

          script.onload?.();
        });

        return script;
      }),
    },
  } as unknown as Document;

  return () => {
    globalThis.document = originalDocument;
    delete runtime.__panopticlickBaitFlags;
    delete runtime.__panopticlickControlLoaded;
  };
}

describe('runBlockerTests', () => {
  let restoreDom: (() => void) | undefined;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
    vi.unstubAllGlobals();
  });

  it('marks a bait probe as blocked only after the control probe succeeds', async () => {
    // GitHub's Node test process has no browser navigator. Analysis must still
    // return a generic blocker result instead of throwing.
    vi.stubGlobal('navigator', undefined);

    const behaviors: Record<string, ScriptBehavior> = {
      '/bait/control.js': { type: 'load', control: true },
    };

    for (const resource of getBaitResources()) {
      behaviors[resource.url] = {
        type: resource.id === 'ga' ? 'error' : 'load',
        baitId: resource.id,
      };
    }

    restoreDom = installFakeDom(behaviors);

    const analysis = await runBlockerTests('', 25);
    const gaResult = analysis.results.find((result) => result.resource.id === 'ga');

    expect(analysis.inconclusive).toBe(false);
    expect(gaResult?.status).toBe('blocked');
    expect(gaResult?.blocked).toBe(true);
    expect(analysis.effectiveness).toBeGreaterThan(0);
  });

  it('returns an inconclusive analysis when the control probe fails', async () => {
    const behaviors: Record<string, ScriptBehavior> = {
      '/bait/control.js': { type: 'error', control: true },
    };

    restoreDom = installFakeDom(behaviors);

    const analysis = await runBlockerTests('', 25);

    expect(analysis.inconclusive).toBe(true);
    expect(analysis.measuredCount).toBe(0);
    expect(analysis.inconclusiveCount).toBe(getBaitResources().length);
    expect(analysis.results.every((result) => result.status === 'inconclusive')).toBe(true);
    expect(analysis.effectiveness).toBe(0);
  });

  it('requires the bait script to execute its flag before counting it as loaded', async () => {
    const firstResource = getBaitResources()[0];
    const behaviors: Record<string, ScriptBehavior> = {
      '/bait/control.js': { type: 'load', control: true },
      [firstResource.url]: { type: 'load' },
    };

    for (const resource of getBaitResources().slice(1)) {
      behaviors[resource.url] = { type: 'load', baitId: resource.id };
    }

    restoreDom = installFakeDom(behaviors);

    const analysis = await runBlockerTests('', 25);
    const firstResult = analysis.results.find((result) => result.resource.id === firstResource.id);

    expect(firstResult?.status).toBe('inconclusive');
    expect(firstResult?.blocked).toBe(false);
    expect(analysis.inconclusive).toBe(false);
    expect(analysis.inconclusiveCount).toBe(1);
  });
});

describe('quickBlockerDetect', () => {
  let restoreDom: (() => void) | undefined;

  afterEach(() => {
    restoreDom?.();
    restoreDom = undefined;
  });

  it('reports an inconclusive quick check when the control probe fails', async () => {
    restoreDom = installFakeDom({
      '/bait/control.js': { type: 'error', control: true },
    });

    await expect(quickBlockerDetect()).resolves.toEqual({
      detected: false,
      type: 'none',
      inconclusive: true,
    });
  });
});
