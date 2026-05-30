# 📅 Book-Consultation Module

A premium, interactive multi-step lightbox and booking workflow for Payload CMS and Next.js. Offers a step-by-step scheduler (calendar date picker ──► time slots selection ──► customer information ──► Resend dark-gold cinematic email receipt and admin alert).

## 🚀 Key Features

- **Double-Step Premium UX:** Interactive client-side step logic designed to boost booking conversions.
- **Responsive Dynamic Calendar:** Responsive grid alignment matching global system fonts and visual guidelines.
- **Branded Email Deliverability:** Sends a beautifully designed dark glassmorphism email receipt to the client and immediate notifications to admin users.
- **Payload CMS Native Sync:** Stores appointment date, local timezone, phone format, and custom message directly into a secure DB collection.

## 📦 File Structure

```
.cursor/custom-scriptz/book-consultation/
├── module.manifest.json                   # Metadata configuration
├── install.ps1                            # Portable installation controller
├── CURSOR.md                              # Technical architecture and developer guide
├── env.example.fragment                   # Env snippet block
├── config/
│   └── book-consultation.config.json      # Customizable slots, gold color codes
├── collections/
│   └── Bookings.ts                        # Payload collection config
├── components/
│   ├── book-consultation-context.tsx      # Provider & context hooks
│   └── book-consultation-lightbox.tsx     # Interactive premium form modal
└── lib/
    ├── booking.ts                         # Client fetch API layer
    ├── same-origin-api.ts                 # Endpoint address builder
    ├── public-origin.ts                   # URL validation utilities
    ├── site-origin-defaults.ts            # Host defaults configurations
    ├── notifications.ts                   # Site-settings dynamic notifications
    ├── email-brand.ts                     # Gold system CSS variables
    └── email-templates/
        └── email-templates.ts             # Rich custom email templates
```

## 🛠️ Dynamic Installation

Simply execute the installer script from your project root:

```powershell
.\.cursor\custom-scriptz\book-consultation\install.ps1
```

Once installed, ensure your `.env.local` has `RESEND_API_KEY` defined, and register the `Bookings` collection inside `payload.config.ts` along with the Resend email adapter!

---
*My Studio Channel Personal Dev Profile Module.*
