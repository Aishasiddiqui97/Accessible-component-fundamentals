import { createContext, useCallback, useContext, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent, ReactNode, RefObject } from 'react'
import { cn } from '../../utils/cn'

export type TabsOrientation = 'horizontal' | 'vertical'
export type TabsActivation = 'automatic' | 'manual'

interface TabsContextValue {
  baseId: string
  orientation: TabsOrientation
  activation: TabsActivation
  selectedIndex: number
  tabRefs: RefObject<Array<HTMLButtonElement | null>>
  selectTab: (index: number, moveFocus: boolean) => void
  focusTab: (index: number) => void
  getTabId: (index: number) => string
  getPanelId: (index: number) => string
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext(): TabsContextValue {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs> parent')
  }
  return context
}

export interface TabsProps {
  /** Index of the tab selected by default (uncontrolled mode). */
  defaultValue?: number
  /** Controlled selected index. When provided, `onValueChange` must update it. */
  value?: number
  /** Called whenever the selected index changes. */
  onValueChange?: (index: number) => void
  /** Arrow keys: horizontal uses Left/Right, vertical uses Up/Down. */
  orientation?: TabsOrientation
  /** "automatic" activates on arrow focus; "manual" requires Enter/Space. */
  activation?: TabsActivation
  className?: string
  children: ReactNode
}

/**
 * Tabs
 * ----
 * Implements the W3C APG "Tabs with Automatic Activation" pattern.
 *
 * Key decisions:
 *  - Roving tabindex: only the selected tab is in the tab order
 *    (`tabIndex={0}`); the others are `tabIndex={-1}`. This is the APG
 *    requirement for tablists and keeps the tab order short.
 *  - `aria-selected` is set on tabs, `aria-controls` links a tab to its
 *    panel, `aria-labelledby` links a panel back to its tab.
 *  - Inactive panels use the native `hidden` attribute so they are removed
 *    from the accessibility tree and the tab order (stronger than
 *    `aria-hidden`, which would not stop keyboard focus).
 */
export function Tabs({
  defaultValue = 0,
  value,
  onValueChange,
  orientation = 'horizontal',
  activation = 'automatic',
  className,
  children,
}: TabsProps) {
  const [internalIndex, setInternalIndex] = useState(defaultValue)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const baseId = useId()

  const selectedIndex = value ?? internalIndex

  const selectTab = useCallback(
    (index: number, moveFocus: boolean) => {
      setInternalIndex(index)
      onValueChange?.(index)
      if (moveFocus) {
        tabRefs.current[index]?.focus()
      }
    },
    [onValueChange],
  )

  const focusTab = useCallback((index: number) => {
    tabRefs.current[index]?.focus()
  }, [])

  const contextValue = useMemo<TabsContextValue>(
    () => ({
      baseId,
      orientation,
      activation,
      selectedIndex,
      tabRefs,
      selectTab,
      focusTab,
      getTabId: (index: number) => `${baseId}-tab-${index}`,
      getPanelId: (index: number) => `${baseId}-panel-${index}`,
    }),
    [baseId, orientation, activation, selectedIndex, selectTab, focusTab],
  )

  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

export interface TabListProps {
  children: ReactNode
  className?: string
}

/**
 * TabList
 * -------
 * Renders `role="tablist"` and owns all keyboard navigation between tabs
 * (arrow keys, Home, End). The list itself is never focusable — only the
 * active tab is, per the roving tabindex model.
 */
export function TabList({ children, className }: TabListProps) {
  const context = useTabsContext()

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const { key } = event
    const tabCount = context.tabRefs.current.length
    if (tabCount === 0) return

    const vertical = context.orientation === 'vertical'
    let nextIndex: number | null = null

    // Accessibility decision (APG): arrow keys move focus between tabs.
    // Left/Right for a horizontal tablist, Up/Down for a vertical one.
    switch (key) {
      case 'ArrowRight':
        if (!vertical) nextIndex = (context.selectedIndex + 1) % tabCount
        break
      case 'ArrowLeft':
        if (!vertical) nextIndex = (context.selectedIndex - 1 + tabCount) % tabCount
        break
      case 'ArrowDown':
        if (vertical) nextIndex = (context.selectedIndex + 1) % tabCount
        break
      case 'ArrowUp':
        if (vertical) nextIndex = (context.selectedIndex - 1 + tabCount) % tabCount
        break
      case 'Home':
        nextIndex = 0
        break
      case 'End':
        nextIndex = tabCount - 1
        break
    }

    if (nextIndex === null) return

    event.preventDefault()
    if (context.activation === 'automatic') {
      context.selectTab(nextIndex, true)
    } else {
      // Manual activation: arrows only move focus; Enter/Space activates.
      context.focusTab(nextIndex)
    }
  }

  return (
    <div
      role="tablist"
      aria-orientation={context.orientation}
      onKeyDown={handleKeyDown}
      className={cn('flex gap-1 border-b border-slate-200', context.orientation === 'vertical' && 'flex-col border-b-0 border-r', className)}
    >
      {children}
    </div>
  )
}

export interface TabProps {
  /** Position in the tablist; must match the panel with the same index. */
  index: number
  children: ReactNode
  className?: string
  disabled?: boolean
}

/**
 * Tab
 * ---
 * Renders `role="tab"`. Rendered as a real <button> so Enter/Space work
 * natively (APG requires Enter/Space activation). `aria-selected`, the
 * roving tabindex and the `aria-controls`/`id` pair are all handled here.
 */
export function Tab({ index, children, className, disabled = false }: TabProps) {
  const context = useTabsContext()
  const isSelected = context.selectedIndex === index

  return (
    <button
      ref={(element) => {
        context.tabRefs.current[index] = element
      }}
      type="button"
      role="tab"
      id={context.getTabId(index)}
      aria-controls={context.getPanelId(index)}
      aria-selected={isSelected}
      disabled={disabled}
      tabIndex={isSelected ? 0 : -1}
      onClick={() => context.selectTab(index, true)}
      className={cn(
        'rounded-t-lg border-b-2 px-4 py-2 text-sm font-medium transition-colors',
        isSelected
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700',
        disabled && 'cursor-not-allowed opacity-50',
        context.orientation === 'vertical' && 'rounded-r-lg rounded-t-none border-b-0 border-r-2',
        className,
      )}
    >
      {children}
    </button>
  )
}

export interface TabPanelProps {
  /** Position in the tablist; must match the tab with the same index. */
  index: number
  children: ReactNode
  className?: string
}

/**
 * TabPanel
 * --------
 * Renders `role="tabpanel"`. `tabIndex={0}` lets keyboard users scroll long
 * panels with arrow keys. Inactive panels get the native `hidden` attribute,
 * which removes them from both the accessibility tree and the tab order.
 */
export function TabPanel({ index, children, className }: TabPanelProps) {
  const context = useTabsContext()
  const isActive = context.selectedIndex === index

  return (
    <div
      role="tabpanel"
      id={context.getPanelId(index)}
      aria-labelledby={context.getTabId(index)}
      tabIndex={0}
      hidden={!isActive}
      className={cn('mt-4 rounded-lg border border-slate-100 bg-white p-4 text-sm text-slate-600', className)}
    >
      {children}
    </div>
  )
}
