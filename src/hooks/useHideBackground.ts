import { useEffect } from 'react'
import type { RefObject } from 'react'

/**
 * useHideBackground
 * -----------------
 * Accessibility decision: with `aria-modal="true"` screen readers must treat
 * everything outside the dialog as inert. Two complementary mechanisms are
 * applied to every top-level sibling of the dialog:
 *
 *  - `aria-hidden="true"` removes it from the accessibility tree.
 *  - the `inert` attribute removes it from the tab order as a hard guarantee.
 *
 * The `inert` attribute makes the focus trap a defense-in-depth measure
 * rather than the only thing protecting focus (matches modern W3C guidance).
 * Both attributes are restored to their previous state on cleanup.
 */
export function useHideBackground(dialogRef: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    const dialog = dialogRef.current
    if (!active || !dialog) return

    const restoreFunctions: Array<() => void> = []

    for (const child of Array.from(document.body.children)) {
      if (child === dialog || !(child instanceof HTMLElement)) continue
      if (dialog.contains(child)) continue

      const hadAriaHidden = child.hasAttribute('aria-hidden')
      const previousAriaHidden = child.getAttribute('aria-hidden')
      const hadInert = child.hasAttribute('inert')

      child.setAttribute('aria-hidden', 'true')
      child.setAttribute('inert', '')

      restoreFunctions.push(() => {
        if (hadAriaHidden) {
          child.setAttribute('aria-hidden', previousAriaHidden ?? 'true')
        } else {
          child.removeAttribute('aria-hidden')
        }
        if (!hadInert) child.removeAttribute('inert')
      })
    }

    return () => {
      restoreFunctions.forEach((restore) => restore())
    }
  }, [dialogRef, active])
}
