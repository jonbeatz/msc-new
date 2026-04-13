"use client"

import type { ReactNode } from "react"
import { ContactModalProvider } from "@/components/contact-modal-context"
import { ContactModal } from "@/components/contact-modal"

/**
 * Client-only shell for marketing routes: contact modal, future lightboxes.
 */
export function SiteToolingProvider({ children }: { children: ReactNode }) {
  return (
    <ContactModalProvider>
      {children}
      <ContactModal />
    </ContactModalProvider>
  )
}
