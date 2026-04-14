"use client"

import type { ReactNode } from "react"
import { BookConsultationProvider } from "@/components/book-consultation-context"
import { ContactModalProvider } from "@/components/contact-modal-context"
import { ContactModal } from "@/components/contact-modal"

/**
 * Marketing site client shell: **Send a message** (Radix `Dialog`) + **Book a consultation**
 * (fixed overlay + dynamic calendar). Wrapped once in `app/(site)/layout.tsx` around all
 * `(site)` routes so modals work on every marketing page.
 *
 * **Not** mounted under `app/(payload)/layout.tsx` — `/admin` uses Payload’s own document;
 * duplicate `<html>`/providers there would break admin. No DOM conflict: both tools use
 * `position: fixed` / portals with distinct UI; only one is typically open at a time.
 * Provider order is arbitrary for hydration (all `"use client"`); children SSR matches
 * because portals render only after mount.
 */
export function SiteToolingProvider({ children }: { children: ReactNode }) {
  return (
    <ContactModalProvider>
      <BookConsultationProvider>
        {children}
        <ContactModal />
      </BookConsultationProvider>
    </ContactModalProvider>
  )
}
