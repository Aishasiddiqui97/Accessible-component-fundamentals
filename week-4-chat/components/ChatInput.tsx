"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { ArrowUp, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface ChatInputProps {
  readonly onSubmit: (text: string) => void;
  readonly onStop: () => void;
  /** True while a request is in flight and a new send must not be issued. */
  readonly disabled: boolean;
  /** True when a request is actively generating (to show the stop affordance). */
  readonly isGenerating: boolean;
}

const MAX_ROWS = 8;
const SEND_ON_ENTER = true;

/**
 * Composer for the chat.
 *
 * - Auto-grows from 1 to MAX_ROWS lines as the user types.
 * - Enter sends, Shift+Enter inserts a newline.
 * - While generating, the button becomes a Stop control.
 * - Disabled while a request is in flight (the parent passes `disabled`).
 */
export function ChatInput({
  onSubmit,
  onStop,
  disabled,
  isGenerating,
}: ChatInputProps): React.ReactElement {
  const [value, setValue] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize to fit content, up to MAX_ROWS.
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea === null) {
      return;
    }
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_ROWS * 24)}px`;
  }, [value]);

  const submit = useCallback(() => {
    const text = value.trim();
    if (text === "" || disabled) {
      return;
    }
    onSubmit(text);
    setValue("");
  }, [value, disabled, onSubmit]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (SEND_ON_ENTER && event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
        event.preventDefault();
        submit();
      }
    },
    [submit],
  );

  const hasText = value.trim() !== "";

  return (
    <div className="border-t border-neutral-200 bg-white px-3 py-3 sm:px-4 sm:py-4 dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-end gap-2 rounded-2xl border border-neutral-300 bg-white p-2 shadow-sm focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-500/20 dark:border-neutral-700 dark:bg-neutral-900">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything…"
            rows={1}
            aria-label="Message input"
            disabled={disabled}
            className="max-h-[192px] min-h-[24px] flex-1 resize-none bg-transparent px-2 py-1.5 text-[0.9375rem] leading-6 text-neutral-900 outline-none placeholder:text-neutral-400 disabled:opacity-60 dark:text-neutral-100 dark:placeholder:text-neutral-500"
          />
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              title="Stop generating"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-300 text-neutral-500 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!hasText || disabled}
              aria-label={hasText ? "Send message" : "Send message (type a message first)"}
              title="Send (Enter)"
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neutral-900 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:bg-white dark:text-neutral-900",
                !hasText || disabled
                  ? "cursor-not-allowed opacity-40 dark:opacity-40"
                  : "hover:bg-neutral-700 dark:hover:bg-neutral-200",
              )}
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>
        <p className="mt-2 px-1 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
}
