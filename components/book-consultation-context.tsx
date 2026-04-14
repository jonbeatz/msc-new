"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import { BookConsultationLightbox } from "@/components/book-consultation-lightbox"

export type BookConsultationOpenOptions = {
  /** Prefills the optional message (e.g. package name from pricing cards). */
  interestedPackage?: string
}

type BookConsultationContextValue = {
  isOpen: boolean
  openBookConsultation: (options?: BookConsultationOpenOptions) => void
  closeBookConsultation: () => void
}

const BookConsultationContext =
  createContext<BookConsultationContextValue | null>(null)

export function BookConsultationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setOpen] = useState(false)
  const [interestedPackage, setInterestedPackage] = useState<
    string | undefined
  >()

  const openBookConsultation = useCallback(
    (options?: BookConsultationOpenOptions) => {
      setInterestedPackage(options?.interestedPackage)
      setOpen(true)
    },
    [],
  )

  const closeBookConsultation = useCallback(() => {
    setOpen(false)
    setInterestedPackage(undefined)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      openBookConsultation,
      closeBookConsultation,
    }),
    [isOpen, openBookConsultation, closeBookConsultation],
  )

  return (
    <BookConsultationContext.Provider value={value}>
      {children}
      <BookConsultationLightbox interestedPackage={interestedPackage} />
    </BookConsultationContext.Provider>
  )
}

export function useBookConsultation(): BookConsultationContextValue {
  const ctx = useContext(BookConsultationContext)
  if (!ctx) {
    throw new Error(
      "useBookConsultation must be used within BookConsultationProvider",
    )
  }
  return ctx
}
