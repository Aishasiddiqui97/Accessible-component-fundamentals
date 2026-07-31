import type { UIMessage } from "ai";

/**
 * Shared domain types for the chat interface.
 *
 * The chat message shape itself is the AI SDK's `UIMessage` (from `useChat`).
 * This module adds the app-specific types: error classification, timestamps
 * and the localStorage persistence payload.
 */

export type { UIMessage };

/** The two participant roles rendered in the UI. */
export type ChatRole = "user" | "assistant";

/**
 * Machine-readable categories used to render friendly error messages.
 * `aborted` is intentionally excluded from the visible error banner — an
 * aborted generation is a normal user action, not a failure.
 */
export type ChatErrorKind =
  | "api"
  | "network"
  | "timeout"
  | "auth"
  | "rate-limit"
  | "provider-unavailable"
  | "unknown";

/** A normalized, user-facing error produced from a raw `Error`. */
export interface ChatError {
  /** Machine-readable category, used for icon/emphasis decisions. */
  readonly kind: ChatErrorKind;
  /** Friendly message safe to show to the user. */
  readonly message: string;
  /** Whether retrying is likely to help. */
  readonly retryable: boolean;
}

/** Timestamp map: message id -> epoch milliseconds. */
export type MessageTimestamps = Readonly<Record<string, number>>;

/** Versioned payload stored in localStorage. */
export interface PersistedChatState {
  readonly version: 1;
  readonly messages: UIMessage[];
  readonly timestamps: MessageTimestamps;
}

/** Message id prefix used when generating stable, unique ids. */
export const MESSAGE_ID_PREFIX = "msg-" as const;
