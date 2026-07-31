"use client";

import { ArrowDown } from "lucide-react";

interface JumpToLatestProps {
  readonly visible: boolean;
  readonly onClick: () => void;
}

/**
 * Floating "Jump to latest" button. Appears when the user has scrolled away
 * from the bottom (even while tokens keep streaming) and, when clicked,
 * scrolls to the newest message and resumes auto-scrolling.
 */
export function JumpToLatest({ visible, onClick }: JumpToLatestProps): React.ReactElement | null {
  if (!visible) {
    return null;
  }
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center sm:bottom-6">
      <button
        type="button"
        onClick={onClick}
        aria-label="Jump to latest message"
        className="fade-up pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-1.5 text-sm font-medium text-neutral-700 shadow-md transition-colors hover:bg-neutral-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:ring-offset-neutral-950"
      >
        <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
        Jump to latest
      </button>
    </div>
  );
}
