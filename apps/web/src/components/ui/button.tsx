'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-sm font-mono text-sm uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-highlight focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-ink text-paper hover:bg-ink-50 active:bg-ink-100',
        primary:
          'bg-highlight text-ink hover:bg-highlight-400 active:bg-highlight-300',
        outline:
          'border-2 border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
        ghost:
          'text-ink hover:bg-paper-200 active:bg-paper-300',
        danger:
          'bg-alert-red text-paper hover:bg-red-600 active:bg-red-700',
        success:
          'bg-alert-green text-paper hover:bg-green-600 active:bg-green-700',
        stamp:
          'border-4 border-current text-stamp-red transform -rotate-2 hover:rotate-0 transition-transform',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };

interface ActionButtonProps extends ButtonProps {
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

/**
 * Action button with icon support
 */
export function ActionButton({
  icon,
  iconPosition = 'left',
  children,
  ...props
}: ActionButtonProps) {
  return (
    <Button {...props}>
      {icon && iconPosition === 'left' && (
        <span className="mr-2">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2">{icon}</span>
      )}
    </Button>
  );
}

interface StartScanButtonProps {
  onClick: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Prominent start scan button
 */
export function StartScanButton({
  onClick,
  loading,
  className,
}: StartScanButtonProps) {
  return (
    <Button
      variant="primary"
      size="xl"
      onClick={onClick}
      loading={loading}
      className={cn(
        'relative overflow-hidden',
        'before:absolute before:inset-0 before:bg-white/20',
        'before:translate-x-[-100%] hover:before:translate-x-[100%]',
        'before:transition-transform before:duration-500',
        className
      )}
    >
      {loading ? 'Scanning...' : 'Start Investigation'}
    </Button>
  );
}
