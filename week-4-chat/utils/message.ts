import type { UIMessage } from "ai";

/** Concatenate all `text` parts of a message into a single string. */
export function getMessageText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<UIMessage["parts"][number], { type: "text" }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

/** Concatenate all `reasoning` parts of a message (extended thinking). */
export function getReasoningText(message: UIMessage): string {
  return message.parts
    .filter(
      (part): part is Extract<UIMessage["parts"][number], { type: "reasoning" }> =>
        part.type === "reasoning",
    )
    .map((part) => part.text)
    .join("");
}
