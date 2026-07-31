import { useEffect, useId, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '../../utils/cn'

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export interface DisclosureProps {
  /** Visible heading text rendered inside the trigger button. */
  title: string
  /** Collapsible content shown when the disclosure is open. */
  children: ReactNode
  /** Heading semantics for the wrapper (defaults to <h2>). */
  headingLevel?: HeadingLevel
  /** Initially open when uncontrolled. */
  defaultOpen?: boolean
  /** Controlled open state. */
  open?: boolean
  /** Called with the next state whenever the trigger is toggled. */
  onOpenChange?: (open: boolean) => void
  className?: string
  buttonClassName?: string
  contentClassName?: string
}

/**
 * Disclosure
 * ----------
 * Implements the W3C APG "Disclosure (Show/Hide)" pattern.
 *
 * Accessibility decisions:
 *  - The trigger is a native <button> wrapped in a real heading element
 *    (`<h2>` by default), which preserves the document outline for screen
 *    readers.
 *  - `aria-expanded` on the button announces the current state.
 *  - `aria-controls` links the button to the panel id.
 *  - The panel uses the native `hidden` attribute when closed so it is
 *    removed from the accessibility tree and the tab order.
 *  - Enter and Space work for free because the trigger is a <button>.
 *  - Decorative chevron is `aria-hidden="true"` so it is never announced.
 *  - On collapse, if focus happened to be inside the panel, it is moved back
 *    to the trigger so the user is never left in limbo.
 */
export function Disclosure({
  title,
  children,
  headingLevel = 2,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  buttonClassName,
  contentClassName,
}: DisclosureProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const generatedId = useId()
  const panelId = `disclosure-${generatedId}-panel`
  const buttonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const toggle = () => {
    const next = !open
    if (!isControlled) setInternalOpen(next)
    onOpenChange?.(next)
  }

  // Move focus back to the trigger when the panel collapses while focus is
  // inside it (otherwise the user would be focused on hidden content).
  useEffect(() => {
    if (open) return
    const content = contentRef.current
    const trigger = buttonRef.current
    if (!content || !trigger) return
    if (content.contains(document.activeElement)) {
      trigger.focus()
    }
  }, [open])

  const HeadingTag = `h${headingLevel}` as const

  return (
    <div className={cn('overflow-hidden rounded-xl border border-slate-200 bg-white', className)}>
      <HeadingTag className="m-0">
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className={cn(
            'flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50',
            buttonClassName,
          )}
        >
          <span>{title}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={cn('shrink-0 text-slate-400 transition-transform', open && 'rotate-180')}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </HeadingTag>
      <div
        ref={contentRef}
        id={panelId}
        hidden={!open}
        className={cn('border-t border-slate-100 px-4 py-3 text-sm leading-relaxed text-slate-600', contentClassName)}
      >
        {children}
      </div>
    </div>
  )
}
