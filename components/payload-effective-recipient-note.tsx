"use client"

import { useMemo } from "react"
import { useFormFields } from "@payloadcms/ui"

type EmailRow = { email?: string | null }

export function PayloadEffectiveRecipientNote() {
  const { listText, fallbackText } = useFormFields(([fields]) => {
    const notificationRows = fields?.notificationEmails?.value as
      | EmailRow[]
      | undefined
    const fallbackValue = fields?.adminFallbackEmail?.value as string | undefined

    const emails = Array.isArray(notificationRows)
      ? notificationRows
          .map((row) => (typeof row?.email === "string" ? row.email.trim() : ""))
          .filter(Boolean)
      : []

    return {
      listText: emails.join(", "),
      fallbackText:
        typeof fallbackValue === "string" && fallbackValue.trim().length > 0
          ? fallbackValue.trim()
          : "jonbeatz@gmail.com",
    }
  })

  const message = useMemo(() => {
    if (listText.length > 0) {
      return `Currently sending to: ${listText}`
    }
    return `Currently sending to Fallback: ${fallbackText}`
  }, [fallbackText, listText])

  return (
    <div
      style={{
        marginTop: "0.25rem",
        marginBottom: "0.75rem",
        padding: "0.75rem 0.9rem",
        borderRadius: "0.6rem",
        border: "1px solid rgba(212,175,55,0.35)",
        background: "rgba(212,175,55,0.08)",
        color: "#FCEFC8",
        fontSize: "0.875rem",
        lineHeight: 1.5,
      }}
    >
      <strong style={{ color: "#D4AF37", marginRight: "0.35rem" }}>
        Effective Recipient List
      </strong>
      <span>{message}</span>
    </div>
  )
}

