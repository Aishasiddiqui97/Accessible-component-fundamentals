/**
 * Scroll helpers for the chat message list.
 *
 * All functions operate on the scroll container element (an element whose
 * content overflows vertically), not on the window.
 */

/** Pixels from the bottom that still count as "at the bottom". */
export const BOTTOM_THRESHOLD_PX = 48;

/**
 * Distance (in pixels) between the current scroll position and the bottom
 * of the scroll container.
 */
export function getDistanceFromBottom(el: HTMLElement): number {
  return el.scrollHeight - el.scrollTop - el.clientHeight;
}

/** True when the user is at (or very close to) the bottom of the container. */
export function isNearBottom(el: HTMLElement, threshold = BOTTOM_THRESHOLD_PX): boolean {
  return getDistanceFromBottom(el) <= threshold;
}

/**
 * Scroll the container to the bottom. Wrapped in `requestAnimationFrame` so
 * it runs after the browser has performed layout for the current render —
 * this matters while tokens stream in and the content height changes on
 * every frame.
 */
export function scrollToBottom(el: HTMLElement, behavior: ScrollBehavior = "auto"): void {
  requestAnimationFrame(() => {
    el.scrollTo({ top: el.scrollHeight, behavior });
  });
}
