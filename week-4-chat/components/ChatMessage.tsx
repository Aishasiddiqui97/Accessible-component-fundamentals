"use client";

import { memo } from "react";
import type { UIMessage } from "ai";
import type { ChatRole } from "@/types/chat";
import { Avatar } from "@/components/Avatar";
import { Markdown } from "@/components/Markdown";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { cn } from "@/utils/cn";
import { formatMessageTime, toIsoDateTime } from "@/utils/date";
import { getMessageText, getReasoningText } from "@/utils/message";

interface ChatMessageProps {
  readonly message: UIMessage;
  readonly timestamp?: number;
  /** True while this message's response is actively streaming. */
  readonly isStreaming?: boolean;
  /** Render the thinking indicator in place of (still empty) content. */
  readonly showThinking?: boolean;
}

/**
 * A single conversation turn.
 *
 * - User messages: right-aligned solid bubble.
 * - Assistant messages: left-aligned card with an avatar and rendered
 *   Markdown (streaming-safe).
 * - While the first token is pending, the assistant bubble shows the
 *   ThinkingIndicator so the transition into streamed text is seamless.
 */
function ChatMessageComponent({
  message,
  timestamp,
  isStreaming = false,
  showThinking = false,
}: ChatMessageProps): React.ReactElement {
  const role: ChatRole = message.role === "user" ? "user" : "assistant";
  const isUser = role === "user";
  const text = getMessageText(message);
  const reasoning = getReasoningText(message);

  return (
    <article
      aria-busy={showThinking ? true : undefined}
      aria-live={isStreaming && !isUser ? "polite" : undefined}
      className={cn("message-in flex w-full gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      <Avatar role={role} />
      <div
        className={cn(
          "flex min-w-0 max-w-[85%] flex-col gap-1 sm:max-w-[75%]",
          isUser ? "items-end" : "items-start",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-[0.9375rem] leading-relaxed shadow-sm",
            isUser
              ? "rounded-br-md bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
              : "rounded-bl-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900",
          )}
        >
          {showThinking ? (
            <ThinkingIndicator />
          ) : (
            <>
              {reasoning !== "" && (
                <details className="mb-2">
                  <summary className="cursor-pointer select-none text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    Thinking
                  </summary>
                  <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                    {reasoning}
                  </p>
                </details>
              )}
              {isUser ? (
                <p className="whitespace-pre-wrap break-words">{text}</p>
              ) : (
                <Markdown content={text} isStreaming={isStreaming} />
              )}
            </>
          )}
        </div>
        {timestamp !== undefined && (
          <time
            dateTime={toIsoDateTime(timestamp)}
            className={cn(
              "px-1 text-[11px] tabular-nums text-neutral-400 dark:text-neutral-500",
              isUser ? "text-right" : "text-left",
            )}
          >
            {formatMessageTime(timestamp)}
          </time>
        )}
      </div>
    </article>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
