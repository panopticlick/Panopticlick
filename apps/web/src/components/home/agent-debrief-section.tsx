'use client';

import { ChatPanel } from '@/components/ai/chat-panel';
import { useScanContext } from '@/components/scan/scan-provider';
import type { AIChatContext } from '@/lib/api-client';
import { SectionShell } from './section-shell';

function formatCaseContext(
  report: ReturnType<typeof useScanContext>['report']
): AIChatContext | undefined {
  if (!report) return undefined;

  const oneIn = report.comparison.similarDevices.oneIn;
  return {
    entropyBits: report.entropy.totalBits,
    averageCPM: report.valuation.averageCPM,
    defenseScore: report.defenses.score,
    personas: report.valuation.personas.slice(0, 5).map((persona) => persona.name),
    // Keep the current production worker useful until the expanded context
    // schema reaches every isolate.
    entropy: report.entropy.totalBits,
    uniqueness:
      oneIn > 1
        ? `1 in ${new Intl.NumberFormat('en-US').format(oneIn)}`
        : report.comparison.overallUniqueness.description,
  };
}

/**
 * The home-page AI surface reuses the same transcript as the floating dialog,
 * but attaches only deterministic, already-visible case metrics.
 */
export function AgentDebriefSection() {
  const { report, hasResult, source } = useScanContext();
  const context = formatCaseContext(report);

  return (
    <SectionShell
      id="agent-debrief"
      fileNumber="07"
      title="Question the analysis agent"
      subtitle="Turn the case file into plain-language answers. Follow-ups stay in the same transcript."
      tone="paper-100"
    >
      <div className="border-y-2 border-ink bg-paper py-1 shadow-document">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-paper-300 px-4 py-3 font-mono text-xs uppercase tracking-widest">
          <span>Agent debrief / recorded</span>
          <span
            className={hasResult ? 'text-stamp-blue' : 'text-ink-300'}
            aria-live="polite"
          >
            {hasResult
              ? `${source === 'restored' ? 'Reopened' : 'Current'} case file attached`
              : 'General briefing — no case file attached'}
          </span>
        </div>

        <ChatPanel context={context} className="rounded-none border-0" />

        <p className="border-t border-dashed border-paper-300 px-4 py-3 font-mono text-[11px] leading-relaxed text-ink-300">
          Analysis may contain errors. Verify defensive changes in your browser and use the
          methodology file for calculation details.
        </p>
      </div>
    </SectionShell>
  );
}
