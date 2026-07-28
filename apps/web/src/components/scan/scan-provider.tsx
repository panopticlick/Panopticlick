'use client';

import { createContext, useContext } from 'react';
import { useScan, type ScanController } from '@/lib/use-scan';

const ScanContext = createContext<ScanController | null>(null);

/**
 * Holds one scan state machine for the whole page so every section reads the
 * same report without prop drilling or a global store.
 */
export function ScanProvider({ children }: { children: React.ReactNode }) {
  const scan = useScan();
  return <ScanContext.Provider value={scan}>{children}</ScanContext.Provider>;
}

export function useScanContext(): ScanController {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScanContext must be used inside a <ScanProvider>');
  }
  return context;
}
