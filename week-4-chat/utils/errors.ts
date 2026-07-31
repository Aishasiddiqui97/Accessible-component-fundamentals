import type { ChatError, ChatErrorKind } from "@/types/chat";

const GENERIC_MESSAGE = "Something went wrong while generating a response. Please try again.";

/**
 * Turn a raw error from `useChat` into a normalized, user-facing `ChatError`.
 *
 * Returns `null` for aborted generations — stopping is a normal user action,
 * not a failure, and must not surface an error banner.
 *
 * The message text is trusted to already be friendly: API/provider errors are
 * sanitized on the server (app/api/chat/route.ts). Only client-side failures
 * (network, timeout) are rewritten here.
 */
export function classifyChatError(error: Error | undefined): ChatError | null {
  if (error === undefined) {
    return null;
  }

  // User pressed Stop — keep the partial response, show nothing.
  if (error.name === "AbortError") {
    return null;
  }

  let kind: ChatErrorKind = "unknown";
  let message = error.message !== "" ? error.message : GENERIC_MESSAGE;

  if (error.name === "TimeoutError") {
    kind = "timeout";
    message = "The request timed out. Please try again.";
  } else if (
    error instanceof TypeError &&
    /fetch|network|load failed|failed to fetch/i.test(error.message)
  ) {
    kind = "network";
    message = "Could not reach the server. Check your connection and try again.";
  } else if (/authentication|api key/i.test(message)) {
    kind = "auth";
  } else if (/too many requests|rate limit/i.test(message)) {
    kind = "rate-limit";
  } else if (/timed out/i.test(message)) {
    kind = "timeout";
  } else if (/temporarily unavailable/i.test(message)) {
    kind = "provider-unavailable";
  } else if (/an error occurred|went wrong|returned an error/i.test(message)) {
    kind = "api";
  }

  return { kind, message, retryable: kind !== "auth" };
}
