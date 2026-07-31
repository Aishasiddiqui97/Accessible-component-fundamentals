"use client";

import { AlertTriangle, RotateCcw, X } from "lucide-react";
import type { ChatError } from "@/types/chat";

interface ErrorBannerProps {
  readonly error: ChatError | null;
  readonly onRetry: () => void;
  readonly onDismiss: () => void;
}

/**
 * Friendly inline error shown when a generation fails (API error, network
 * failure or timeout). Aborted generations never reach this component.
 */
export function ErrorBanner({ error, onRetry, onDismiss }: ErrorBannerProps): React.ReactElement | null {
  if (error === null) {
    return null;
  }
  return (
    <div
      role="alert"
      className="fade-up flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900 shadow-sm dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">Something went wrong</p>
        <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200/90">{error.message}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {error.retryable && (
          <button
            type="button"
            onClick={onRetry}
            aria-label="Try again"
            title="Try again"
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-amber-800 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-200 dark:hover:bg-amber-900/50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Try again
          </button>
        )}
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss error"
          title="Dismiss"
          className="rounded-md p-1 text-amber-700 transition-colors hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:text-amber-300 dark:hover:bg-amber-900/50"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
