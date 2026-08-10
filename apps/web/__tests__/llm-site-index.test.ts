import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));
const llmsContent = readFileSync(`${publicDir}llms.txt`, 'utf8');
const compatibilityContent = readFileSync(`${publicDir}llm.txt`, 'utf8');

describe('LLM site index', () => {
  it('keeps the standard and compatibility paths identical', () => {
    expect(compatibilityContent).toBe(llmsContent);
  });

  it('follows the llms.txt proposal structure', () => {
    expect(llmsContent).toMatch(/^# Panopticlick\n\n> .+/);
    expect(llmsContent).toContain('\n## Primary tools\n');
    expect(llmsContent).toContain('\n## Authority and methodology\n');
    expect(llmsContent).toContain('\n## Optional\n');
    expect(llmsContent).toMatch(
      /- \[Methodology\]\(https:\/\/panopticlick\.org\/methodology\/\):/,
    );
  });
});
