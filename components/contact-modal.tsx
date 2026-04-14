"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ContactMessageForm } from "@/components/contact-message-form"
import { useContactModal } from "@/components/contact-modal-context"

export function ContactModal() {
  const { isOpen, closeContactModal, packageInquiry } = useContactModal()

  const packageRequestNote = packageInquiry
    ? `${packageInquiry.price} package was requested — ${packageInquiry.name}.`
    : null

  return (
    <Dialog open={isOpen} onOpenChange={(next) => !next && closeContactModal()}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,720px)] overflow-y-auto border-[#D4AF37]/25 bg-[#0c0d12] p-6 shadow-2xl sm:max-w-lg"
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">Send a message</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            We&apos;ll get back to you within 24 hours.
          </DialogDescription>
        </DialogHeader>
        <ContactMessageForm
          key={
            packageInquiry
              ? `pkg:${packageInquiry.name}:${packageInquiry.price}`
              : "contact-modal-general"
          }
          idPrefix="contact-modal"
          className="pt-2"
          initialSubject={
            packageInquiry
              ? `${packageInquiry.name} (${packageInquiry.price})`
              : undefined
          }
          packageRequestNote={packageRequestNote}
          leadSource={packageInquiry ? "packages" : "contact"}
          onSuccess={closeContactModal}
        />
      </DialogContent>
    </Dialog>
  )
}
