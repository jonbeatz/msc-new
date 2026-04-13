"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type ContactModalContextValue = {
  isOpen: boolean
  openContactModal: () => void
  closeContactModal: () => void
}

const ContactModalContext = createContext<ContactModalContextValue | null>(
  null,
)

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const openContactModal = useCallback(() => setOpen(true), [])
  const closeContactModal = useCallback(() => setOpen(false), [])

  const value = useMemo(
    () => ({ isOpen, openContactModal, closeContactModal }),
    [isOpen, openContactModal, closeContactModal],
  )

  return (
    <ContactModalContext.Provider value={value}>
      {children}
    </ContactModalContext.Provider>
  )
}

export function useContactModal(): ContactModalContextValue {
  const ctx = useContext(ContactModalContext)
  if (!ctx) {
    throw new Error("useContactModal must be used within ContactModalProvider")
  }
  return ctx
}
