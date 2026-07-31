"use client";

import { memo, useCallback, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";
import { bufferIncompleteMarkdown } from "@/utils/markdown";
import { cn } from "@/utils/cn";

interface MarkdownProps {
  readonly content: string;
  readonly isStreaming?: boolean;
}

/**
 * Streaming-safe Markdown renderer.
 *
 * While a response streams, incomplete Markdown is held back by
 * `bufferIncompleteMarkdown` so partially-streamed code fences are never
 * rendered through the parser (which would visually break the layout). The
 * buffered tail is shown as plain preformatted text until the fence closes.
 */
export function Markdown({ content, isStreaming = false }: MarkdownProps): React.ReactElement {
  const { rendered, buffered } = bufferIncompleteMarkdown(content);

  return (
    <div className="markdown-body prose prose-sm prose-neutral max-w-none dark:prose-invert">
      {rendered !== "" && (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={components}
        >
          {rendered}
        </ReactMarkdown>
      )}
      {buffered !== "" && (
        <div
          className="mt-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-900"
          aria-label="Code block in progress"
        >
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
            {buffered}
          </pre>
        </div>
      )}
      {rendered === "" && buffered === "" && isStreaming && (
        <span className="text-neutral-400 dark:text-neutral-500" aria-hidden="true">
          ·
        </span>
      )}
    </div>
  );
}

/** Convert React children (possibly nested) into a plain code string. */
function nodeToString(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(nodeToString).join("");
  }
  return "";
}

/** A fenced code block: header with language + copy, body with syntax colors. */
function CodeBlock({
  className,
  children,
}: {
  readonly className?: string;
  readonly children?: ReactNode;
}): React.ReactElement {
  const language = /language-([\w+-]+)/.exec(className ?? "")?.[1];
  const code = nodeToString(children).replace(/\n$/, "");
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      // Fallback for browsers/clipboard policies that reject the async API.
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-900 dark:border-neutral-700">
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-xs text-neutral-400">{language ?? "code"}</span>
        <button
          type="button"
          onClick={() => void copyToClipboard()}
          aria-label={copied ? "Code copied" : "Copy code to clipboard"}
          title={copied ? "Copied" : "Copy code"}
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs text-neutral-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-3">
        {/* Children are already syntax-highlighted by rehype-highlight. */}
        <code className={cn("hljs block font-mono text-[0.8125rem] leading-relaxed", className)}>
          {children}
        </code>
      </pre>
    </div>
  );
}

/**
 * Custom `code` renderer. Block-level code (tagged with `hljs` by
 * rehype-highlight) becomes a CodeBlock; inline code keeps inline styling.
 */
function Code({
  className,
  children,
}: {
  readonly className?: string;
  readonly children?: ReactNode;
}): React.ReactElement {
  const isBlock = (className?.includes("hljs") ?? false) || nodeToString(children).includes("\n");
  if (isBlock) {
    return <CodeBlock className={className}>{children}</CodeBlock>;
  }
  return (
    <code
      className={cn(
        "rounded-md border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100",
        className,
      )}
    >
      {children}
    </code>
  );
}

/**
 * `pre` is replaced with a passthrough fragment: block code is rendered by
 * CodeBlock (which owns its own `<pre>`), avoiding double wrapping.
 */
function Pre({ children }: { readonly children?: ReactNode }): React.ReactElement {
  return <>{children}</>;
}

// Defined at module scope so react-markdown receives stable references.
const components: Components = {
  code: Code,
  pre: Pre,
};

export default memo(Markdown);
