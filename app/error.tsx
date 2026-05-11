'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Something went wrong</h2>
        <p className="text-sm text-zinc-500 mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
