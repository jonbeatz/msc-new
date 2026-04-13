"use client"

import { useFormFields } from "@payloadcms/ui"
import { getPublicOriginClient } from "@/lib/public-origin"

const FALLBACK_SLUG = "msc1"

// ─── Shared link builder ──────────────────────────────────────────────────────

function buildHref(slug: string | undefined | null): string {
  const s = typeof slug === "string" ? slug.trim() : ""
  const resolved = s.length > 0 ? s : FALLBACK_SLUG
  return `${getPublicOriginClient()}/${encodeURIComponent(resolved)}`
}

// ─── Shared link renderer ─────────────────────────────────────────────────────

function PageLink({ slug }: { slug: string | undefined | null }) {
  const href = buildHref(slug)

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.35rem",
        fontWeight: 600,
        color: "#F5B841",
        textDecoration: "none",
        fontSize: "0.875rem",
      }}
    >
      View Page
      <span style={{ fontSize: "0.75rem", opacity: 0.85 }}>(opens new tab)</span>
    </a>
  )
}

// ─── Field component (edit/document view) ─────────────────────────────────────

/**
 * Rendered in the document sidebar via admin.components.Field.
 * Uses the live form state so it reflects unsaved edits.
 */
export function ViewPageLinkField() {
  const slug = useFormFields(([fields]) => {
    try {
      const v = fields?.slug?.value
      return typeof v === "string" ? v.trim() : ""
    } catch {
      return ""
    }
  })

  return (
    <div
      style={{
        marginBottom: "1rem",
        padding: "0.65rem 0.85rem",
        borderRadius: "0.5rem",
        border: "1px solid rgba(212,175,55,0.35)",
        background: "rgba(212,175,55,0.08)",
      }}
    >
      <PageLink slug={slug} />
    </div>
  )
}

// ─── Cell component (list view) ───────────────────────────────────────────────

/**
 * Rendered in the Pages list view column via admin.components.Cell.
 * Payload passes the full document row as `rowData`.
 */
export function ViewPageLinkCell({
  rowData,
}: {
  rowData?: Record<string, unknown>
}) {
  const slug = rowData?.slug as string | undefined

  return <PageLink slug={slug} />
}
