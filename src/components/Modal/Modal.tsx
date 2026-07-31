import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { KeyboardEvent, MouseEvent as ReactMouseEvent, ReactNode, RefObject } from 'react'
import { useFocusTrap } from '../../hooks/useFocusTrap'
import { useHideBackground } from '../../hooks/useHideBackground'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import { getFocusableElements } from '../../utils/focus'
import { cn } from '../../utils/cn'

export interface ModalProps {
  /** Whether the dialog is currently open. The component is fully controlled. */
  open: boolean
  /** Called when the dialog should close (Escape, backdrop click, close button). */
  onClose: () => void
  /** Dialog title. Rendered as an <h2> and wired to `aria-labelledby`. */
  title: string
  /** Optional description rendered as a paragraph wired to `aria-describedby`. */
  description?: string
  /** Arbitrary dialog body content. */
  children: ReactNode
  /** Override the element referenced by `aria-labelledby`. */
  labelledBy?: string
  /** Override the element referenced by `aria-describedby`. */
  describedBy?: string
  /** Element to focus when the dialog opens. Defaults to the first focusable. */
  initialFocusRef?: RefObject<HTMLElement | null>
  /** Allow closing by clicking the backdrop. Defaults to true. */
  closeOnBackdropClick?: boolean
  /** Extra classes for the dialog surface. */
  className?: string
}

/**
 * Modal
 * -----
 * Implements the W3C ARIA Authoring Practices "Modal Dialog" pattern.
 *
 * Accessibility decisions:
 *  - `role="dialog"` + `aria-modal="true"` announces to assistive tech that
 *    this is a modal dialog and content behind it is inert.
 *  - `aria-labelledby` points at the title heading so screen readers announce
 *    "dialog, {title}" when focus enters.
 *  - `aria-describedby` points at the description paragraph so the dialog
 *    purpose is announced without reading the whole body.
 *  - `tabIndex={-1}` lets the dialog itself receive programmatic focus, which
 *    is the recommended way to move focus into a dialog (see APG).
 *  - Focus management: focus moves to the first focusable element on open,
 *    is trapped with `useFocusTrap`, and returns to the previously focused
 *    element (the trigger button) on close.
 *  - Escape closes the dialog (handled on the overlay so it works no matter
 *    where focus is inside the dialog).
 *  - The dialog is rendered in a portal to `document.body` so no ancestor
 *    stacking-context/`overflow` can clip or misplace it.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  labelledBy,
  describedBy,
  initialFocusRef,
  closeOnBackdropClick = true,
  className,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const generatedTitleId = useId()
  const generatedDescriptionId = useId()

  const titleId = labelledBy ?? generatedTitleId
  const descriptionId = describedBy ?? (description ? generatedDescriptionId : undefined)

  useFocusTrap(dialogRef, open)
  useLockBodyScroll(open)
  useHideBackground(dialogRef, open)

  // On open: remember the trigger element so we can return focus to it later,
  // then move focus into the dialog (first focusable, requested element, or
  // the dialog itself). A rAF defers the move until the portal is painted.
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement
    if (previouslyFocused instanceof HTMLElement) {
      previousFocusRef.current = previouslyFocused
    }

    const dialog = dialogRef.current
    if (!dialog) return

    const frame = window.requestAnimationFrame(() => {
      const target = initialFocusRef?.current ?? getFocusableElements(dialog)[0] ?? dialog
      target.focus()
    })

    return () => window.cancelAnimationFrame(frame)
  }, [open, initialFocusRef])

  // On close: return focus to the trigger button that opened the dialog.
  useEffect(() => {
    if (open) return

    const previouslyFocused = previousFocusRef.current
    previousFocusRef.current = null

    if (previouslyFocused && document.contains(previouslyFocused)) {
      previouslyFocused.focus()
    }
  }, [open])

  if (!open) return null

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Accessibility decision: Escape must close the dialog regardless of which
    // element inside it has focus, so it is handled on the overlay (bubbling).
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
    }
  }

  const handleBackdropClick = (event: ReactMouseEvent) => {
    // Only close when the click target is the backdrop itself, never when the
    // click originated inside the dialog and bubbled up to it.
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose()
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Dialog surface */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        className={cn(
          'relative z-10 max-h-full w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {children}
      </div>
    </div>,
    document.body,
  )
}
