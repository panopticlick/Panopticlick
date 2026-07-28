"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Stamp } from "@/components/ui";
import { cn } from "@/lib/utils";

interface SectionShellProps {
  id: string;
  /** File number shown above the heading, e.g. '03' */
  fileNumber: string;
  title: string;
  subtitle?: string;
  /** Renders the sealed placeholder instead of the children */
  locked?: boolean;
  /**
   * Plain-language description of what the sealed section will contain. Shown as
   * real text (not just redaction bars) so it reaches screen readers and search
   * engines too.
   */
  lockedSummary?: string;
  tone?: "paper" | "paper-100";
  className?: string;
  children: React.ReactNode;
}

/**
 * Scroll-reveal wrapper for the single-page narrative. Handles the locked state
 * before a scan exists, the in-view entrance, and the reduced-motion downgrade
 * (opacity only, no travel).
 */
export function SectionShell({
  id,
  fileNumber,
  title,
  subtitle,
  locked = false,
  lockedSummary,
  tone = "paper",
  className,
  children,
}: SectionShellProps) {
  const reducedMotion = useReducedMotion();

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn(
        "scroll-mt-20 py-14",
        tone === "paper-100" ? "bg-paper-100" : "bg-paper",
        className,
      )}
    >
      <div className="container mx-auto max-w-4xl px-4">
        <header className="mb-8">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-300">
            File {fileNumber}
            {locked && " — sealed"}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-1 font-serif text-3xl font-bold tracking-tight"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-ink-200">{subtitle}</p>
          )}
        </header>

        {locked ? (
          <LockedPanel summary={lockedSummary} />
        ) : (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: reducedMotion ? 0.2 : 0.5,
              ease: "easeOut",
            }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

function LockedPanel({ summary }: { summary?: string }) {
  return (
    <div className="relative rounded-sm border-2 border-dashed border-ink-200 bg-paper p-6">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex-1 space-y-2" aria-hidden="true">
          {[0, 1, 2, 3].map((line) => (
            <div
              key={line}
              className="h-4 rounded-sm bg-redaction"
              style={{ width: `${85 + ((line * 37) % 15)}%` }}
            />
          ))}
        </div>
        <Stamp
          variant="denied"
          animated={false}
          className="self-start md:self-center"
        >
          Pending investigation
        </Stamp>
      </div>

      {summary && <p className="mt-6 text-sm text-ink-200">{summary}</p>}
    </div>
  );
}
