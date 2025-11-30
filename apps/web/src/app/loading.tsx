export default function Loading() {
  return (
    <div className="min-h-screen bg-paper grid-bg flex items-center justify-center">
      <div className="text-center">
        {/* Animated loading indicator */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-paper-300 rounded-full" />
          <div className="absolute inset-0 border-4 border-t-ink rounded-full animate-spin" />
        </div>

        <p className="font-mono text-sm text-ink-300">
          Loading investigation...
        </p>
      </div>
    </div>
  );
}
