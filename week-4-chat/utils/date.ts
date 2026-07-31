/** Format an epoch-ms timestamp as a short local time (e.g. "2:31 PM"). */
export function formatMessageTime(timestamp: number): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

/** ISO-8601 string for the `dateTime` attribute of `<time>` elements. */
export function toIsoDateTime(timestamp: number): string {
  return new Date(timestamp).toISOString();
}
