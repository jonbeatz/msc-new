# 📧 Stay-In-The-Loop Module

A robust double opt-in newsletter signup and capture workflow for Payload CMS and Next.js. Offers a clean email modal (lightbox), dynamic verification email routing with Resend, custom server verification endpoints, and responsive gold-accented visual success notifications.

## 🚀 Key Features

- **Double Opt-In Verification Flow:** Fully secure sign-up process that validates visitor addresses before finalizing subscription.
- **Payload CMS Native Auth Integration:** Utilizes Payload CMS user-verification features to issue and authenticate secure tokens automatically.
- **Glassmorphism Email Templates:** Beautiful, responsive dark-gold confirmation design optimized for modern mail clients (Resend-driven).
- **SQLite-Safe Cascade Deletes:** Pre-deletion hook that clears references in locked documents and user preferences to avoid database errors.

## 📦 File Structure

```
.cursor/custom-scriptz/stay-in-the-loop/
├── module.manifest.json                   # Metadata configurations
├── install.ps1                            # Portable installation controller
├── CURSOR.md                              # Technical guide & double opt-in flow details
├── env.example.fragment                   # Env snippet block
└── collections/
    └── Leads.ts                           # Payload CMS leads auth collection
└── components/
    └── stay-in-the-loop-lightbox.tsx     # Trigger button and pop-up form component
└── lib/
    ├── same-origin-api.ts                 # Endpoint address builder
    ├── public-origin.ts                   # URL validation utilities
    ├── site-origin-defaults.ts            # Host defaults configurations
    ├── notifications.ts                   # Dynamic email setting receiver
    ├── email-brand.ts                     # Gold system CSS variables
    ├── payload-auth-delete-preflight.ts   # Cascade preflight database hook
    └── email-templates/
        └── email-templates.ts             # Rich custom email templates
```

## 🛠️ Dynamic Installation

Execute the installer script from your project root:

```powershell
.\.cursor\custom-scriptz\stay-in-the-loop\install.ps1
```

After installation completes, add your `RESEND_API_KEY` to `.env.local` and register the `Leads` collection inside `payload.config.ts`.

---
*My Studio Channel Personal Dev Profile Module.*
