import { useEffect } from 'react'
import type { RefObject } from 'react'
import { getFocusableElements } from '../utils/focus'

/**
 * useFocusTrap
 * -----------
 * Accessibility decision: a modal dialog must keep keyboard focus inside it
 * (W3C APG "Dialog Modal" pattern). While `enabled`, Tab / Shift+Tab are
 * intercepted on the container and focus is wrapped between the first and
 * last focusable element. The browser can therefore never tab out into the
 * page behind the dialog.
 */
export function useFocusTrap(containerRef: RefObject<HTMLElement | null>, enabled: boolean): void {
  useEffect(() => {
    const container = containerRef.current
    if (!enabled || !container) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return

      const focusable = getFocusableElements(container)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      // No focusable content (e.g. a title-only dialog): keep focus on the
      // dialog itself instead of letting it escape to the background.
      if (!first || !last) {
        event.preventDefault()
        container.focus()
        return
      }

      const activeElement = document.activeElement
      const focusIsInside = activeElement instanceof Node && container.contains(activeElement)

      if (event.shiftKey) {
        // Shift+Tab on the first element wraps to the last element.
        if (!focusIsInside || activeElement === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (!focusIsInside || activeElement === last) {
        // Tab on the last element wraps to the first element.
        event.preventDefault()
        first.focus()
      }
    }

    container.addEventListener('keydown', handleKeyDown)
    return () => container.removeEventListener('keydown', handleKeyDown)
  }, [containerRef, enabled])
}
