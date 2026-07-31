import { useCallback, useState } from 'react'

export interface UseDisclosureResult {
  open: boolean
  setOpen: (open: boolean) => void
  toggle: () => void
}

/**
 * useDisclosure
 * -------------
 * Small state helper that powers every "open/close" interaction in the app
 * (modal trigger buttons). Keeps a single source of truth for boolean state.
 */
export function useDisclosure(initialOpen = false): UseDisclosureResult {
  const [open, setOpen] = useState(initialOpen)

  const toggle = useCallback(() => {
    setOpen((current) => !current)
  }, [])

  return { open, setOpen, toggle }
}
