/**
 * CSS selector that matches every element that can receive keyboard focus.
 * Mirrors the "focusable" list used by the W3C ARIA Authoring Practices
 * for focus-trapping implementations.
 */
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled]):not([aria-disabled="true"])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  'audio[controls]',
  'video[controls]',
  '[contenteditable]:not([contenteditable="false"])',
].join(',')

/** True when the element is rendered (not `display:none` / `visibility:hidden`). */
function isRendered(element: HTMLElement): boolean {
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

/**
 * Return every focusable element inside `container`, in DOM order.
 * Elements hidden with the `hidden` attribute or `aria-hidden` are skipped
 * so the focus trap can never move focus to something invisible.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (element) => isRendered(element) && element.getAttribute('aria-hidden') !== 'true',
  )
}
