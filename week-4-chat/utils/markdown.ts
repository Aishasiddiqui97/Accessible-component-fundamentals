/**
 * Streaming-safe Markdown buffering.
 *
 * Rendering partially-streamed Markdown through a markdown parser produces
 * visual breakage: an unclosed code fence makes the rest of the response
 * render as inline text. Instead of rendering the incomplete block, this
 * module holds it back until it is complete, so the rendered portion is
 * always syntactically valid.
 */

/** Matches a code fence delimiter at the start of a line (``` or ~~~). */
const FENCE_RE = /^\s*(`{3,}|~{3,})/;

/** The result of splitting a partial Markdown string into renderable and buffered parts. */
export interface BufferedMarkdown {
  /** Syntactically complete Markdown — safe to render immediately. */
  readonly rendered: string;
  /** The tail of an incomplete code fence. Render as plain text, not Markdown. */
  readonly buffered: string;
}

/**
 * Scan `source` and, if it ends inside an unclosed code fence, return the
 * complete prefix in `rendered` and the incomplete fence in `buffered`.
 * When every fence is balanced, `rendered` is the whole input and `buffered`
 * is empty.
 */
export function bufferIncompleteMarkdown(source: string): BufferedMarkdown {
  const lines = source.split("\n");

  let fenceActive = false;
  let fenceStartIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (line === undefined) {
      continue;
    }
    const match = FENCE_RE.exec(line);
    if (match === null) {
      continue;
    }

    if (fenceActive) {
      // A line that is only a fence (nothing but trailing whitespace after the
      // delimiter) closes the block. Anything else is treated as code content.
      const rest = line.slice(match[1]?.length ?? 0).trim();
      if (rest === "") {
        fenceActive = false;
        fenceStartIndex = -1;
      }
    } else {
      fenceActive = true;
      fenceStartIndex = index;
    }
  }

  if (fenceActive && fenceStartIndex >= 0) {
    return {
      rendered: lines.slice(0, fenceStartIndex).join("\n"),
      buffered: lines.slice(fenceStartIndex).join("\n"),
    };
  }

  return { rendered: source, buffered: "" };
}
