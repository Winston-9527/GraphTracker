import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm text-zinc-500">Loading GraphTracker...</p>
      </div>
    </div>
  );
}
