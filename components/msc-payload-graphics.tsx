import React from "react"

/**
 * Admin graphics (`admin.components.graphics`):
 * - `Logo` is used on the **login** screen.
 * - `Icon` is used in the **sidebar / navigation** chrome.
 * Both load the same public asset from `/media/` (see `public/media/msc-icon.png`).
 */
export function MscPayloadAdminLogo() {
  return (
    <div className="msc-payload-admin-graphic msc-payload-admin-graphic--logo">
      {/* eslint-disable-next-line @next/next/no-img-element -- Public `/media/` branding; keep a plain img for Payload admin graphics. */}
      <img
        src="/media/msc-icon.png"
        alt="My Studio Channel"
        width={200}
        height={200}
        decoding="async"
      />
    </div>
  )
}

export function MscPayloadAdminIcon() {
  return (
    <div className="msc-payload-admin-graphic msc-payload-admin-graphic--icon">
      {/* eslint-disable-next-line @next/next/no-img-element -- Public `/media/` branding; keep a plain img for Payload admin graphics. */}
      <img
        src="/media/msc-icon.png"
        alt="My Studio Channel"
        width={48}
        height={48}
        decoding="async"
      />
    </div>
  )
}
