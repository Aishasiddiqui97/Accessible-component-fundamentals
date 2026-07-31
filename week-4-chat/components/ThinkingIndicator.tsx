interface ThinkingIndicatorProps {
  readonly label?: string;
}

/**
 * Animated "thinking" indicator shown before the first streamed token arrives
 * and while an assistant message has not produced any text yet.
 */
export function ThinkingIndicator({
  label = "Thinking",
}: ThinkingIndicatorProps): React.ReactElement {
  return (
    <span role="status" aria-label={label} className="inline-flex items-center gap-2.5 py-1">
      <span aria-hidden="true" className="flex items-center gap-1">
        <span className="thinking-dot" />
        <span className="thinking-dot" />
        <span className="thinking-dot" />
      </span>
      <span className="text-sm text-neutral-500 dark:text-neutral-400">{label}</span>
    </span>
  );
}
