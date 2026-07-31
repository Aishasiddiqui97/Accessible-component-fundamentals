import { useEffect } from 'react'

/**
 * useLockBodyScroll
 * -----------------
 * Accessibility decision: while a modal is open the page behind it must not
 * scroll (the dialog should stay centered). The previous value of
 * `body.style.overflow` is stored and restored on close so we never clobber
 * styles that existed before the dialog opened.
 */
export function useLockBodyScroll(locked: boolean): void {
  useEffect(() => {
    if (!locked) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [locked])
}
