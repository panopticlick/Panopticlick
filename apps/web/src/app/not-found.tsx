import Link from 'next/link';
import { Document, DocumentHeader, Stamp, Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-paper grid-bg flex items-center justify-center p-4">
      <Document variant="classified" watermark="404">
        <DocumentHeader
          title="Case File Not Found"
          subtitle="The investigation you're looking for doesn't exist"
          classification="unknown"
        />

        <div className="text-center py-8">
          <div className="font-mono text-8xl font-bold text-paper-300 mb-4">
            404
          </div>

          <p className="text-ink-200 mb-8 max-w-md mx-auto">
            The page you requested could not be found. It may have been
            classified, archived, or never existed in our records.
          </p>

          <div className="flex justify-center gap-4">
            <Link href="/">
              <Button variant="primary">Return to Homepage</Button>
            </Link>
            <Link href="/scan/">
              <Button variant="outline">Start a Scan</Button>
            </Link>
          </div>
        </div>

        <div className="flex justify-center gap-6 mt-8">
          <Stamp variant="classified">Missing</Stamp>
        </div>
      </Document>
    </div>
  );
}
