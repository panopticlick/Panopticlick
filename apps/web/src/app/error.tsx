'use client';

import { useEffect } from 'react';
import { Document, DocumentHeader, Stamp, Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-paper grid-bg flex items-center justify-center p-4">
      <Document variant="dossier" watermark="ERROR">
        <DocumentHeader
          title="Investigation Error"
          subtitle="Something went wrong during the investigation"
          classification="error"
        />

        <div className="text-center py-8">
          <div className="text-6xl mb-4">⚠️</div>

          <h2 className="font-serif text-2xl font-bold mb-4">
            Unexpected Error
          </h2>

          <p className="text-ink-200 mb-4 max-w-md mx-auto">
            An error occurred while processing your request. This has been
            logged for investigation.
          </p>

          {error.digest && (
            <p className="font-mono text-xs text-ink-300 mb-6">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex justify-center gap-4">
            <Button variant="primary" onClick={reset}>
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => (window.location.href = '/')}
            >
              Go Home
            </Button>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Error</Stamp>
        </div>
      </Document>
    </div>
  );
}
