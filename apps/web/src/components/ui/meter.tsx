'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface MeterProps {
  value: number; // 0-100
  max?: number;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  animated?: boolean;
}

const variantStyles = {
  default: 'bg-ink',
  danger: 'bg-alert-red',
  warning: 'bg-alert-orange',
  success: 'bg-alert-green',
};

const sizeStyles = {
  sm: 'h-2',
  md: 'h-4',
  lg: 'h-6',
};

/**
 * Meter/Progress bar component
 * Used for entropy visualization and scores
 */
export function Meter({
  value,
  max = 100,
  variant = 'default',
  showLabel = false,
  label,
  size = 'md',
  className,
  animated = true,
}: MeterProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1">
          {label && (
            <span className="font-mono text-xs text-ink-200 uppercase">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="font-mono text-xs font-bold">
              {value.toFixed(1)}/{max}
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'relative w-full bg-paper-200 rounded-sm overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-sm',
            variantStyles[variant]
          )}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

interface EntropyMeterProps {
  bits: number;
  maxBits?: number;
  showBits?: boolean;
  className?: string;
}

/**
 * Specialized entropy meter with tier coloring
 */
export function EntropyMeter({
  bits,
  maxBits = 60,
  showBits = true,
  className,
}: EntropyMeterProps) {
  // Determine variant based on entropy level
  let variant: 'success' | 'warning' | 'danger' = 'success';
  if (bits >= 40) variant = 'danger';
  else if (bits >= 25) variant = 'warning';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-baseline">
        <span className="font-serif text-sm">Entropy</span>
        {showBits && (
          <span className="font-mono text-lg font-bold">
            {bits.toFixed(1)} <span className="text-sm text-ink-200">bits</span>
          </span>
        )}
      </div>
      <div className="relative h-6 bg-paper-200 rounded-sm overflow-hidden">
        {/* Tier markers */}
        <div className="absolute inset-0 flex">
          <div className="w-1/3 border-r border-paper-300" />
          <div className="w-1/3 border-r border-paper-300" />
          <div className="w-1/3" />
        </div>

        {/* Fill */}
        <motion.div
          className={cn(
            'absolute inset-y-0 left-0 rounded-sm',
            variantStyles[variant]
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (bits / maxBits) * 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Tier labels */}
        <div className="absolute inset-0 flex items-center text-[10px] font-mono uppercase">
          <span className="w-1/3 text-center text-ink-300">Low</span>
          <span className="w-1/3 text-center text-ink-300">Medium</span>
          <span className="w-1/3 text-center text-ink-300">High</span>
        </div>
      </div>
    </div>
  );
}

interface ScoreMeterProps {
  score: number; // 0-100
  label: string;
  inverted?: boolean; // true = higher is worse
  className?: string;
}

/**
 * Score meter with A-F grading
 */
export function ScoreMeter({
  score,
  label,
  inverted = false,
  className,
}: ScoreMeterProps) {
  // Calculate grade
  const effectiveScore = inverted ? 100 - score : score;
  let grade: string;
  let variant: 'success' | 'warning' | 'danger';

  if (effectiveScore >= 90) {
    grade = 'A+';
    variant = 'success';
  } else if (effectiveScore >= 80) {
    grade = 'A';
    variant = 'success';
  } else if (effectiveScore >= 70) {
    grade = 'B';
    variant = 'success';
  } else if (effectiveScore >= 60) {
    grade = 'C';
    variant = 'warning';
  } else if (effectiveScore >= 50) {
    grade = 'D';
    variant = 'warning';
  } else {
    grade = 'F';
    variant = 'danger';
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-baseline">
        <span className="font-serif text-sm">{label}</span>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-sm text-ink-200">{score}/100</span>
          <span
            className={cn(
              'font-mono text-2xl font-bold',
              variant === 'success' && 'text-alert-green',
              variant === 'warning' && 'text-alert-orange',
              variant === 'danger' && 'text-alert-red'
            )}
          >
            {grade}
          </span>
        </div>
      </div>
      <Meter value={score} variant={variant} size="md" />
    </div>
  );
}

interface MultiMeterProps {
  meters: Array<{
    label: string;
    value: number;
    max?: number;
    variant?: 'default' | 'danger' | 'warning' | 'success';
  }>;
  className?: string;
}

/**
 * Multiple meters stacked
 */
export function MultiMeter({ meters, className }: MultiMeterProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {meters.map((meter, index) => (
        <Meter
          key={index}
          value={meter.value}
          max={meter.max}
          variant={meter.variant}
          label={meter.label}
          showLabel
          size="sm"
        />
      ))}
    </div>
  );
}
