'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, useReducedMotion } from 'framer-motion';
import { Eye, X } from 'lucide-react';
import { ChatPanel } from './chat-panel';

/**
 * Floating chat entry point for every route except the home page, which embeds
 * the interrogation panel as a section of the single-page narrative instead.
 */
export function ChatLauncher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion();

  if (pathname === '/') return null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/40" />
        <Dialog.Content asChild>
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="fixed inset-x-4 bottom-4 z-50 sm:left-auto sm:right-6 sm:w-[26rem]"
          >
            <div className="overflow-hidden rounded-sm shadow-document">
              <div className="flex items-center justify-between bg-ink px-4 py-2">
                <Dialog.Title className="font-mono text-xs uppercase tracking-widest text-paper">
                  Panopticlick — analysis desk
                </Dialog.Title>
                <Dialog.Close
                  className="rounded-sm p-1 text-paper-300 transition-colors hover:text-paper focus:outline-none focus-visible:ring-2 focus-visible:ring-paper"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </Dialog.Close>
              </div>
              <Dialog.Description className="sr-only">
                Ask follow-up questions about browser fingerprinting, tracking, and privacy.
              </Dialog.Description>
              <ChatPanel
                focusInputOnMount
                className="max-h-[calc(100dvh-5rem)] rounded-none border-0"
              />
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>

      <Dialog.Trigger asChild>
        <button
          type="button"
          className="fixed bottom-6 right-6 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-ink text-paper shadow-document transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-stamp-blue focus-visible:ring-offset-2"
          aria-label="Ask the analysis agent"
        >
          <Eye className="h-6 w-6" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
    </Dialog.Root>
  );
}
