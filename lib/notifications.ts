import type { PayloadRequest } from "payload"

type NotificationEmailRow = {
  email?: string | null
}

type SiteSettingsNotifications = {
  enableAdminNotifications?: boolean | null
  notificationEmails?: NotificationEmailRow[] | null
  adminFallbackEmail?: string | null
  systemFromEmail?: string | null
}

export type NotificationConfig = {
  enableAdminNotifications: boolean
  adminRecipients: string[]
  systemFromEmail: string
}

const DEFAULT_ADMIN_EMAIL = "jonbeatz@gmail.com"
const DEFAULT_FROM_EMAIL = "onboarding@resend.dev"

export async function getNotificationConfig(
  req: PayloadRequest
): Promise<NotificationConfig> {
  try {
    const settings = (await req.payload.findGlobal({
      slug: "site-settings",
      req,
      depth: 0,
    })) as SiteSettingsNotifications

    const fromEmail =
      typeof settings.systemFromEmail === "string" &&
      settings.systemFromEmail.trim().length > 0
        ? settings.systemFromEmail.trim()
        : DEFAULT_FROM_EMAIL

    const fallbackEmail =
      typeof settings.adminFallbackEmail === "string" &&
      settings.adminFallbackEmail.trim().length > 0
        ? settings.adminFallbackEmail.trim()
        : DEFAULT_ADMIN_EMAIL

    const listedEmails = Array.isArray(settings.notificationEmails)
      ? settings.notificationEmails
          .map((row) =>
            typeof row?.email === "string" ? row.email.trim() : ""
          )
          .filter(Boolean)
      : []

    return {
      enableAdminNotifications: settings.enableAdminNotifications !== false,
      adminRecipients: listedEmails.length > 0 ? listedEmails : [fallbackEmail],
      systemFromEmail: fromEmail,
    }
  } catch {
    return {
      enableAdminNotifications: true,
      adminRecipients: [DEFAULT_ADMIN_EMAIL],
      systemFromEmail: DEFAULT_FROM_EMAIL,
    }
  }
}

