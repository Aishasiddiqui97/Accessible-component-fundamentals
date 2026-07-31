"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageSquarePlus } from "lucide-react";
import type { MessageTimestamps } from "@/types/chat";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ErrorBanner } from "@/components/ErrorBanner";
import { EmptyState } from "@/components/EmptyState";
import { JumpToLatest } from "@/components/JumpToLatest";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThinkingIndicator } from "@/components/ThinkingIndicator";
import { useAutoScroll } from "@/hooks/useAutoScroll";
import { classifyChatError } from "@/utils/errors";
import { clearChatState, loadChatState, saveChatState } from "@/utils/chatStorage";
import { getMessageText } from "@/utils/message";

/**
 * The chat application shell.
 *
 * Responsibilities:
 * - Drive the AI SDK v7 `useChat` client (one `sendMessage({ text })` call per
 *   user turn; the SDK pushes the user message and opens the stream).
 * - Restore/persist the conversation (localStorage, versioned).
 * - Auto-scroll that stops when the user scrolls up.
 * - Map raw stream errors into friendly `ChatError` banners (aborting is not
 *   an error).
 * - Provide Stop / regenerate / new-chat controls with full keyboard support.
 */
export function Chat(): React.ReactElement {
  const {
    messages,
    setMessages,
    sendMessage,
    stop,
    regenerate,
    status,
    error,
  } = useChat({});

  const containerRef = useRef<HTMLDivElement>(null);
  const { isAtBottom, scrollToBottomNow } = useAutoScroll(containerRef, messages);

  const [timestamps, setTimestamps] = useState<MessageTimestamps>({});
  const [dismissedErrorKey, setDismissedErrorKey] = useState<string | null>(null);

  // Restore a persisted conversation exactly once, after hydration.
  useEffect(() => {
    const saved = loadChatState();
    if (saved !== null && saved.messages.length > 0) {
      setMessages(saved.messages);
      setTimestamps(saved.timestamps);
    }
  }, [setMessages]);

  // Persist whenever the conversation or its timestamps change. Empty states
  // are not persisted so "new chat" resets the storage cleanly.
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    saveChatState(messages, timestamps);
  }, [messages, timestamps]);

  // Stamp each message with the time it first appeared (user: on submit,
  // assistant: as soon as its placeholder enters the list).
  useEffect(() => {
    const now = Date.now();
    setTimestamps((previous) => {
      let changed = false;
      const next = { ...previous };
      for (const message of messages) {
        if (next[message.id] === undefined) {
          next[message.id] = now;
          changed = true;
        }
      }
      return changed ? next : previous;
    });
  }, [messages]);

  // Show a fresh banner whenever a new error arrives.
  const chatError = classifyChatError(error);
  const errorKey = chatError === null ? null : `${chatError.kind}:${chatError.message}`;
  useEffect(() => {
    if (errorKey !== null) {
      setDismissedErrorKey(null);
    }
  }, [errorKey]);
  const visibleError = chatError !== null && dismissedErrorKey !== errorKey ? chatError : null;

  const isGenerating = status === "submitted" || status === "streaming";
  // The v7 SDK has no `isAutoSubmitEnabled`; sending is unsafe only while a
  // request is in flight, so gate on the status directly.
  const canSend = !isGenerating;

  const lastMessage = messages[messages.length - 1];
  const lastIsAssistant = lastMessage?.role === "assistant";
  const lastAssistantText = lastIsAssistant ? getMessageText(lastMessage) : "";

  // Thinking row: before the assistant placeholder exists (submitted), or
  // while the last assistant message has no streamed text yet.
  const showStandaloneThinking =
    status === "submitted" && (lastMessage === undefined || !lastIsAssistant);

  const handleSubmit = useCallback(
    (text: string) => {
      scrollToBottomNow("auto");
      sendMessage({ text });
    },
    [sendMessage, scrollToBottomNow],
  );

  const handleStop = useCallback(() => {
    void stop();
  }, [stop]);

  const handleRegenerate = useCallback(() => {
    setDismissedErrorKey(null);
    void regenerate();
  }, [regenerate]);

  const handleNewChat = useCallback(() => {
    setMessages([]);
    setTimestamps({});
    setDismissedErrorKey(null);
    clearChatState();
    scrollToBottomNow("auto");
  }, [setMessages, scrollToBottomNow]);

  return (
    <div className="flex h-dvh flex-col bg-neutral-50 dark:bg-neutral-950">
      <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-500 text-sm font-bold text-white">
            AI
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-tight text-neutral-900 dark:text-neutral-100">
              FlyRank AI Chat
            </h1>
            <p className="text-xs leading-tight text-neutral-500 dark:text-neutral-400">
              Powered by Claude
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNewChat}
            disabled={messages.length === 0}
            aria-label="Start a new chat"
            title="New chat"
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 dark:focus-visible:ring-offset-neutral-950"
          >
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">New chat</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main
        ref={containerRef}
        className="relative flex-1 overflow-y-auto overscroll-contain"
        aria-label="Conversation"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 sm:px-6">
          {visibleError !== null && (
            <ErrorBanner
              error={visibleError}
              onRetry={handleRegenerate}
              onDismiss={() => setDismissedErrorKey(errorKey)}
            />
          )}

          {messages.length === 0 && !showStandaloneThinking ? (
            <EmptyState />
          ) : (
            <>
              {messages.map((message, index) => {
                const isLast = index === messages.length - 1;
                const assistantStreaming =
                  isLast && isGenerating && message.role === "assistant";
                return (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    timestamp={timestamps[message.id]}
                    isStreaming={assistantStreaming}
                    showThinking={assistantStreaming && lastAssistantText === ""}
                  />
                );
              })}

              {showStandaloneThinking && (
                <div className="message-in flex w-full gap-3">
                  <div className="flex min-w-0 items-center">
                    <div className="rounded-2xl rounded-bl-md border border-neutral-200 bg-white px-4 py-2.5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
                      <span className="sr-only">Assistant is thinking</span>
                      <ThinkingIndicator />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <JumpToLatest
          visible={messages.length > 0 && !isAtBottom}
          onClick={() => scrollToBottomNow("smooth")}
        />
      </main>

      <ChatInput
        onSubmit={handleSubmit}
        onStop={handleStop}
        disabled={!canSend}
        isGenerating={isGenerating}
      />
    </div>
  );
}
