"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ContactModalPackageInquiry = {
  name: string
  price: string
}

export type OpenContactModalOptions = {
  fromPackage?: ContactModalPackageInquiry
}

type ContactModalContextValue = {
  isOpen: boolean
  packageInquiry: ContactModalPackageInquiry | null
  openContactModal: (options?: OpenContactModalOptions) => void
  closeContactModal: () => void
}

const ContactModalContext = createContext<ContactModalContextValue | null>(
  null,
)

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [packageInquiry, setPackageInquiry] =
    useState<ContactModalPackageInquiry | null>(null)

  const openContactModal = useCallback((options?: OpenContactModalOptions) => {
    setPackageInquiry(options?.fromPackage ?? null)
    setOpen(true)
  }, [])

  const closeContactModal = useCallback(() => {
    setOpen(false)
    setPackageInquiry(null)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      packageInquiry,
      openContactModal,
      closeContactModal,
    }),
    [isOpen, packageInquiry, openContactModal, closeContactModal],
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
