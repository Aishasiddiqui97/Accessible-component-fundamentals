import { useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { Disclosure } from './Disclosure'
import { cn } from '../../utils/cn'

export type AccordionType = 'single' | 'multiple'

export interface AccordionItem {
  /** Stable unique id used for the open state tracking. */
  id: string
  title: string
  content: ReactNode
}

export interface AccordionProps {
  items: AccordionItem[]
  /**
   * "single" allows at most one open item (opening one closes the others);
   * "multiple" allows any number open at the same time.
   */
  type?: AccordionType
  /** Item ids open on first render. */
  defaultValue?: string[]
  className?: string
  itemClassName?: string
}

/**
 * Accordion
 * ---------
 * A group of Disclosures sharing a single state store. Reuses the
 * `Disclosure` component for correct, accessible button markup.
 *
 * Beyond the Disclosure pattern it also implements the keyboard behavior of
 * the W3C APG "Accordion" pattern: ArrowUp / ArrowDown move focus between the
 * trigger buttons, Home / End jump to the first / last trigger. Space/Enter
 * on a trigger toggles its panel (native <button> behavior).
 */
export function Accordion({ items, type = 'multiple', defaultValue = [], className, itemClassName }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>(() => [...defaultValue])
  const listRef = useRef<HTMLDivElement>(null)

  const toggleItem = (id: string) => {
    setOpenIds((current) => {
      if (current.includes(id)) {
        return current.filter((openId) => openId !== id)
      }
      if (type === 'single') {
        return [id]
      }
      return [...current, id]
    })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const list = listRef.current
    if (!list) return

    const triggers = Array.from(list.querySelectorAll<HTMLButtonElement>('button[aria-expanded]'))
    if (triggers.length === 0) return

    const active = document.activeElement
    const currentIndex = active instanceof HTMLButtonElement ? triggers.indexOf(active) : -1

    let nextIndex: number | null = null
    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % triggers.length
        break
      case 'ArrowUp':
        nextIndex = currentIndex === -1 ? triggers.length - 1 : (currentIndex - 1 + triggers.length) % triggers.length
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = triggers.length - 1
        break
    }

    if (nextIndex !== null) {
      event.preventDefault()
      triggers[nextIndex]?.focus()
    }
  }

  return (
    <div ref={listRef} onKeyDown={handleKeyDown} className={cn('space-y-3', className)}>
      {items.map((item) => (
        <Disclosure
          key={item.id}
          title={item.title}
          open={openIds.includes(item.id)}
          onOpenChange={() => toggleItem(item.id)}
          className={itemClassName}
        >
          {item.content}
        </Disclosure>
      ))}
    </div>
  )
}
