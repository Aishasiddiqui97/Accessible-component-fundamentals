import type { UIMessage } from "ai";
import type { MessageTimestamps, PersistedChatState } from "@/types/chat";

/**
 * localStorage persistence for the conversation (bonus feature).
 *
 * The payload is versioned so future schema changes can migrate or discard
 * stale data. All operations are wrapped in try/catch because storage may be
 * unavailable (private browsing, full quota) — persistence must never take
 * the chat down.
 */

const STORAGE_KEY = "streaming-ai-chat:conversation";

/** Version of the persisted payload shape. */
const PAYLOAD_VERSION = 1 as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Validate that parsed JSON matches the expected persisted shape. */
function isPersistedChatState(value: unknown): value is PersistedChatState {
  if (!isRecord(value)) {
    return false;
  }
  return (
    value.version === PAYLOAD_VERSION &&
    Array.isArray(value.messages) &&
    isRecord(value.timestamps)
  );
}

/** Save the current conversation. No-op on the server / when storage fails. */
export function saveChatState(
  messages: UIMessage[],
  timestamps: MessageTimestamps,
): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const payload: PersistedChatState = {
      version: PAYLOAD_VERSION,
      messages,
      timestamps,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn("[chatStorage] failed to persist conversation", error);
  }
}

/** Restore a previously saved conversation, or `null` when none is stored. */
export function loadChatState(): PersistedChatState | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isPersistedChatState(parsed) ? parsed : null;
  } catch (error) {
    console.warn("[chatStorage] failed to restore conversation", error);
    return null;
  }
}

/** Remove the persisted conversation. */
export function clearChatState(): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn("[chatStorage] failed to clear conversation", error);
  }
}
