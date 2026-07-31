import {
  APICallError,
  convertToModelMessages,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

import { hasApiKey, maxTokens, model, systemPrompt, temperature } from "@/lib/ai";

/**
 * Route handler: `POST /api/chat`
 *
 * Receives the conversation from `useChat` (as `UIMessage[]`), streams a
 * Claude response token-by-token, and returns a Server-Sent Events (SSE)
 * response using the AI SDK's UI-message stream protocol.
 *
 * The Anthropic API key is resolved by the provider from the
 * `ANTHROPIC_API_KEY` environment variable and is only ever read on the
 * server — nothing key-related is exposed to the client.
 */

// Node.js runtime — required for the Anthropic provider and console logging.
export const runtime = "nodejs";

// Allow long generations on Vercel (serverless default is 10s).
export const maxDuration = 60;

const VALID_ROLES: ReadonlySet<UIMessage["role"]> = new Set([
  "system",
  "user",
  "assistant",
]);

/** Narrow unknown JSON values to plain objects. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Light structural validation of the message array sent by `useChat`. */
function isUIMessage(value: unknown): value is UIMessage {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.id === "string" &&
    VALID_ROLES.has(value.role as UIMessage["role"]) &&
    Array.isArray(value.parts)
  );
}

/** Result of parsing the request body, discriminated by `ok`. */
type ParsedChatRequest =
  | { ok: true; messages: UIMessage[] }
  | { ok: false; status: number; error: string };

/** Parse and validate the request body. */
function parseChatRequest(body: unknown): ParsedChatRequest {
  if (!isRecord(body)) {
    return { ok: false, status: 400, error: "Invalid request body." };
  }
  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, status: 400, error: "A non-empty 'messages' array is required." };
  }
  if (!messages.every(isUIMessage)) {
    return { ok: false, status: 400, error: "Invalid message shape." };
  }
  return { ok: true, messages };
}

/**
 * Map an unknown provider error to a friendly, user-facing message.
 * Server-side details are logged, never forwarded to the browser.
 */
function toClientErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return "The request timed out. Please try again.";
    }
  }
  if (APICallError.isInstance(error)) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return "Authentication with the AI provider failed. Please check the API key configuration.";
    }
    if (error.statusCode === 429) {
      return "You are sending too many requests right now. Please wait a moment and try again.";
    }
    if (error.statusCode !== undefined && error.statusCode >= 500) {
      return "The AI provider is temporarily unavailable. Please try again shortly.";
    }
    return "The AI provider returned an error. Please try again.";
  }
  return "Something went wrong while generating a response. Please try again.";
}

/** Build a plain-text error response (the transport surfaces the body text to the client). */
function errorResponse(status: number, message: string): Response {
  return new Response(message, { status });
}

export async function POST(req: Request): Promise<Response> {
  // Reject requests before any provider work when the server isn't configured.
  if (!hasApiKey) {
    console.error("[api/chat] ANTHROPIC_API_KEY is not set on the server.");
    return errorResponse(
      503,
      "The AI assistant is not configured yet. Ask the developer to set ANTHROPIC_API_KEY.",
    );
  }

  let messages: UIMessage[];
  try {
    const body: unknown = await req.json();
    const parsed = parseChatRequest(body);
    if (!parsed.ok) {
      return errorResponse(parsed.status, parsed.error);
    }
    messages = parsed.messages;
  } catch {
    return errorResponse(400, "The request body is not valid JSON.");
  }

  try {
    const result = streamText({
      model,
      // System prompt lives in lib/ai.ts.
      instructions: systemPrompt,
      // Convert the UI message format into the model message format.
      messages: await convertToModelMessages(messages),
      temperature,
      maxOutputTokens: maxTokens,
      // Forward the client abort signal so Stop() cancels the upstream call.
      abortSignal: req.signal,
      // Hard cap on a single generation (mirrors maxDuration).
      timeout: { totalMs: 60_000 },
      onError: (error) => {
        // Full details stay server-side.
        console.error("[api/chat] streaming error:", error);
      },
    });

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        // Sanitize anything that reaches the client.
        onError: (error) => toClientErrorMessage(error),
      }),
    });
  } catch (error) {
    console.error("[api/chat] failed to start stream:", error);
    return errorResponse(500, "The AI assistant failed to start a response. Please try again.");
  }
}
