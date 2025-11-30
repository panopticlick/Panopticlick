'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DocumentProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dossier' | 'evidence' | 'classified';
  watermark?: string;
}

const variantStyles = {
  default: 'border-paper-300',
  dossier: 'border-l-4 border-l-ink border-paper-300',
  evidence: 'border-2 border-dashed border-ink-200',
  classified: 'border-2 border-stamp-red',
};

/**
 * Document container component
 * Creates the paper document aesthetic
 */
export function Document({
  children,
  className,
  variant = 'default',
  watermark,
}: DocumentProps) {
  return (
    <div
      className={cn(
        'document relative bg-paper border shadow-document rounded-sm p-6',
        'paper-texture',
        variantStyles[variant],
        className
      )}
    >
      {watermark && (
        <div className="watermark">{watermark}</div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface DocumentHeaderProps {
  title: string;
  subtitle?: string;
  classification?: 'unclassified' | 'confidential' | 'secret' | 'top-secret';
  caseNumber?: string;
  date?: Date | string;
  className?: string;
}

/**
 * Document header with classification
 */
export function DocumentHeader({
  title,
  subtitle,
  classification,
  caseNumber,
  date,
  className,
}: DocumentHeaderProps) {
  const classificationStyles = {
    unclassified: 'bg-ink-100 text-paper',
    confidential: 'bg-stamp-blue text-paper',
    secret: 'bg-alert-orange text-paper',
    'top-secret': 'bg-stamp-red text-paper',
  };

  return (
    <div className={cn('mb-6', className)}>
      {classification && (
        <div
          className={cn(
            'text-center py-1 font-mono text-xs uppercase tracking-widest mb-4',
            classificationStyles[classification]
          )}
        >
          {classification.replace('-', ' ')}
        </div>
      )}

      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-ink-200 font-mono text-sm mt-1">{subtitle}</p>
          )}
        </div>

        <div className="text-right">
          {caseNumber && (
            <div className="font-mono text-sm">
              <span className="text-ink-300">Case No. </span>
              <span className="font-bold">{caseNumber}</span>
            </div>
          )}
          {date && (
            <div className="font-mono text-xs text-ink-300 mt-1">
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-b border-ink-300" />
    </div>
  );
}

interface DocumentSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Document section with decorative heading
 */
export function DocumentSection({
  title,
  children,
  className,
}: DocumentSectionProps) {
  return (
    <section className={cn('my-8', className)}>
      <div className="section-heading">
        <h2>{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

interface EvidenceTagProps {
  label: string;
  value: string | number;
  className?: string;
}

/**
 * Evidence tag for data points
 */
export function EvidenceTag({ label, value, className }: EvidenceTagProps) {
  return (
    <div
      className={cn(
        'evidence-tag',
        className
      )}
    >
      <span className="text-ink-300">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

interface FileTabProps {
  tabs: Array<{ label: string; count?: number }>;
  activeIndex: number;
  onTabChange: (index: number) => void;
  className?: string;
}

/**
 * File folder tabs
 */
export function FileTabs({
  tabs,
  activeIndex,
  onTabChange,
  className,
}: FileTabProps) {
  return (
    <div className={cn('flex gap-1 -mb-px', className)}>
      {tabs.map((tab, index) => (
        <button
          key={index}
          onClick={() => onTabChange(index)}
          className={cn(
            'px-4 py-2 font-mono text-sm uppercase rounded-t-sm border-t border-x',
            'transition-colors',
            activeIndex === index
              ? 'bg-paper border-paper-300 text-ink'
              : 'bg-paper-200 border-transparent text-ink-300 hover:text-ink'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 text-xs">({tab.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}

interface PageNumberProps {
  current: number;
  total: number;
  className?: string;
}

/**
 * Page number footer
 */
export function PageNumber({ current, total, className }: PageNumberProps) {
  return (
    <div
      className={cn(
        'text-center font-mono text-xs text-ink-300 mt-8 pt-4 border-t border-paper-300',
        className
      )}
    >
      Page {current} of {total}
    </div>
  );
}

interface DocumentStackProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Stacked documents effect
 */
export function DocumentStack({ children, className }: DocumentStackProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Shadow documents */}
      <div className="absolute inset-0 bg-paper-200 rounded-sm transform rotate-2 translate-x-1 translate-y-1" />
      <div className="absolute inset-0 bg-paper-100 rounded-sm transform -rotate-1 translate-x-0.5 translate-y-0.5" />

      {/* Main document */}
      <div className="relative">{children}</div>
    </div>
  );
}
