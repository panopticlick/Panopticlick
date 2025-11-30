'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface RedactedProps {
  children: React.ReactNode;
  revealed?: boolean;
  onReveal?: () => void;
  className?: string;
  revealDelay?: number;
  autoReveal?: boolean;
}

/**
 * Redacted text component with reveal animation
 * Creates the classified document effect
 */
export function Redacted({
  children,
  revealed: controlledRevealed,
  onReveal,
  className,
  revealDelay = 0,
  autoReveal = false,
}: RedactedProps) {
  const [internalRevealed, setInternalRevealed] = useState(false);
  const isRevealed = controlledRevealed ?? internalRevealed;

  const handleClick = useCallback(() => {
    if (!isRevealed) {
      setInternalRevealed(true);
      onReveal?.();
    }
  }, [isRevealed, onReveal]);

  return (
    <motion.span
      className={cn(
        'relative inline-block cursor-pointer transition-colors',
        isRevealed ? 'bg-highlight' : 'bg-redaction',
        className
      )}
      onClick={handleClick}
      initial={autoReveal ? { opacity: 0 } : false}
      animate={
        autoReveal
          ? {
              opacity: 1,
              transition: { delay: revealDelay / 1000 },
            }
          : {}
      }
      whileHover={!isRevealed ? { scale: 1.02 } : {}}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      aria-label={isRevealed ? undefined : 'Click to reveal redacted content'}
    >
      <AnimatePresence mode="wait">
        {isRevealed ? (
          <motion.span
            key="revealed"
            initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="text-ink px-1"
          >
            {children}
          </motion.span>
        ) : (
          <motion.span
            key="redacted"
            className="text-redaction px-1 select-none"
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

interface RedactedBlockProps {
  children: React.ReactNode;
  revealed?: boolean;
  onReveal?: () => void;
  className?: string;
  lines?: number;
}

/**
 * Redacted block for larger content
 */
export function RedactedBlock({
  children,
  revealed: controlledRevealed,
  onReveal,
  className,
  lines = 3,
}: RedactedBlockProps) {
  const [internalRevealed, setInternalRevealed] = useState(false);
  const isRevealed = controlledRevealed ?? internalRevealed;

  const handleClick = useCallback(() => {
    if (!isRevealed) {
      setInternalRevealed(true);
      onReveal?.();
    }
  }, [isRevealed, onReveal]);

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden cursor-pointer rounded-sm',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <AnimatePresence mode="wait">
        {isRevealed ? (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        ) : (
          <motion.div
            key="redacted"
            exit={{ opacity: 0 }}
            className="space-y-2"
          >
            {Array.from({ length: lines }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-redaction rounded-sm"
                style={{ width: `${85 + Math.random() * 15}%` }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface StaggeredRevealProps {
  items: React.ReactNode[];
  delayBetween?: number;
  className?: string;
}

/**
 * Reveal multiple redacted items with staggered timing
 */
export function StaggeredReveal({
  items,
  delayBetween = 200,
  className,
}: StaggeredRevealProps) {
  const [revealedCount, setRevealedCount] = useState(0);

  return (
    <div className={cn('space-y-1', className)}>
      {items.map((item, index) => (
        <Redacted
          key={index}
          revealed={index < revealedCount}
          onReveal={() => {
            if (index === revealedCount) {
              setTimeout(() => {
                setRevealedCount((c) => c + 1);
              }, delayBetween);
            }
          }}
          autoReveal={index === 0}
          revealDelay={index * delayBetween}
        >
          {item}
        </Redacted>
      ))}
    </div>
  );
}
