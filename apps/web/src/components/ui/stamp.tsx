'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type StampVariant = 'classified' | 'verified' | 'exposed' | 'protected' | 'custom';

interface StampProps {
  variant?: StampVariant;
  children: React.ReactNode;
  className?: string;
  animated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<StampVariant, string> = {
  classified: 'border-stamp-red text-stamp-red',
  verified: 'border-stamp-blue text-stamp-blue',
  exposed: 'border-alert-red text-alert-red',
  protected: 'border-alert-green text-alert-green',
  custom: '',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-xs border-2',
  md: 'px-4 py-2 text-sm border-4',
  lg: 'px-6 py-3 text-lg border-4',
};

/**
 * Official stamp component
 * Mimics rubber stamps used on classified documents
 */
export function Stamp({
  variant = 'classified',
  children,
  className,
  animated = true,
  size = 'md',
}: StampProps) {
  const Component = animated ? motion.div : 'div';

  return (
    <Component
      className={cn(
        'inline-block font-mono uppercase tracking-wider rounded-sm',
        'transform -rotate-3 shadow-stamp',
        sizeStyles[size],
        variantStyles[variant],
        className
      )}
      {...(animated
        ? {
            initial: { scale: 2, rotate: -15, opacity: 0 },
            animate: { scale: 1, rotate: -5, opacity: 1 },
            transition: { type: 'spring', stiffness: 300, damping: 20 },
          }
        : {})}
    >
      {children}
    </Component>
  );
}

interface StampGroupProps {
  stamps: Array<{
    variant?: StampVariant;
    text: string;
  }>;
  className?: string;
  staggerDelay?: number;
}

/**
 * Group of stamps with staggered animation
 */
export function StampGroup({
  stamps,
  className,
  staggerDelay = 0.2,
}: StampGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {stamps.map((stamp, index) => (
        <motion.div
          key={index}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: index * staggerDelay }}
        >
          <Stamp variant={stamp.variant} animated={false}>
            {stamp.text}
          </Stamp>
        </motion.div>
      ))}
    </div>
  );
}

interface DateStampProps {
  date: Date | string;
  className?: string;
}

/**
 * Date stamp with timestamp
 */
export function DateStamp({ date, className }: DateStampProps) {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formatted = d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={cn(
        'inline-flex flex-col items-center px-3 py-2',
        'border-2 border-ink-200 rounded-sm font-mono text-xs',
        'transform -rotate-2',
        className
      )}
    >
      <span className="text-ink-200 uppercase">Recorded</span>
      <span className="font-bold">{formatted}</span>
      <span className="text-ink-300">{time}</span>
    </div>
  );
}

interface CaseNumberProps {
  number: string;
  className?: string;
}

/**
 * Case/File number stamp
 */
export function CaseNumber({ number, className }: CaseNumberProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1',
        'bg-ink text-paper font-mono text-sm',
        'rounded-sm shadow-sm',
        className
      )}
    >
      <span className="text-paper-300">CASE NO.</span>
      <span className="font-bold">{number}</span>
    </div>
  );
}
