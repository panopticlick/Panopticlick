/** @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ChatLauncher } from '../src/components/ai/chat-launcher';

vi.mock('next/navigation', () => ({
  usePathname: () => '/tests/',
}));

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const MockMotionDiv = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<'div'>
  >(function MockMotionDiv(props, ref) {
    return <div ref={ref} {...props} />;
  });

  return {
    motion: {
      div: MockMotionDiv,
    },
    useReducedMotion: () => true,
  };
});

afterEach(() => {
  cleanup();
});

describe('ChatLauncher hydration gate', () => {
  it('renders a disabled, explicitly unhydrated trigger on the server', () => {
    const markup = renderToStaticMarkup(<ChatLauncher />);

    expect(markup).toContain('aria-label="Ask the analysis agent"');
    expect(markup).toContain('data-hydrated="false"');
    expect(markup).toContain('disabled=""');
  });

  it('enables the trigger after hydration on the client', async () => {
    render(<ChatLauncher />);

    const trigger = screen.getByRole('button', { name: 'Ask the analysis agent' });

    await waitFor(() => {
      expect(trigger.getAttribute('data-hydrated')).toBe('true');
      expect(trigger.hasAttribute('disabled')).toBe(false);
    });
  });
});
