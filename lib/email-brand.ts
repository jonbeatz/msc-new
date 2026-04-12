/**
 * Shared tokens for Payload HTML emails (Bookings, Leads).
 * Use inline styles in templates; many clients strip <style> on body.
 */
export const EMAIL_MSC_GOLD = "#FFD700"
export const EMAIL_BG_OUTER = "#0b0b0f"
export const EMAIL_BG_CARD = "#15151c"
/** Links and secondary gold (mailto, long URLs) — still on-brand with MSC PRO */
export const EMAIL_MSC_GOLD_LINK = "#D4AF37"

/**
 * iOS Mail / Gmail mobile can invert `color` in dark mode; pairing with
 * `-webkit-text-fill-color` keeps MSC gold and link gold readable.
 */
export const EMAIL_STYLE_MSC_GOLD_TEXT = `color:${EMAIL_MSC_GOLD} !important;-webkit-text-fill-color:${EMAIL_MSC_GOLD} !important;`
export const EMAIL_STYLE_MSC_GOLD_LINK = `color:${EMAIL_MSC_GOLD_LINK} !important;-webkit-text-fill-color:${EMAIL_MSC_GOLD_LINK} !important;`
/** Primary CTA on gold background — lock near-black label (not gold text) */
export const EMAIL_STYLE_BUTTON_ON_GOLD = `color:#101114 !important;-webkit-text-fill-color:#101114 !important;`
