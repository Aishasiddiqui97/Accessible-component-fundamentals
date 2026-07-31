"use client";

import { Square } from "lucide-react";

interface StopButtonProps {
  readonly onStop: () => void;
}

/**
 * Stops the in-flight generation. The partially streamed response stays in the
 * conversation and the user can immediately send another message.
 */
export function StopButton({ onStop }: StopButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onStop}
      aria-label="Stop generating"
      title="Stop generating"
      className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:focus-visible:ring-offset-neutral-950"
    >
      <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
      Stop generating
    </button>
  );
}
