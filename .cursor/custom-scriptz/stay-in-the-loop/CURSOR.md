# 📔 Stay-In-The-Loop Module (Developer Runbook)

## Module Metadata
- **ID:** `stay-in-the-loop`
- **Location:** `.cursor/custom-scriptz/stay-in-the-loop/`
- **Dependencies:** `lucide-react` (UI icons), `@payloadcms/email-resend` (Payload email)

---

## 🏗️ Architecture & Double Opt-In Flow

```
[User Browser]
       │  (1) Inputs Email in StayInTheLoopLightbox
       ▼
[POST /api/leads]
       │  (2) Creates a temporary password & lead entry (unverified)
       │  (3) Triggers Payload CMS auth verification email
       ▼
[Resend Email Delivery]
       │  (4) Dispatches dark-gold Verification link containing unique token
       ▼
[User Clicks Verification Link]
       │  (5) GET /api/leads/verify/:token
       │  (6) Leads Custom Endpoint verifies token & updates lead state
       ▼
[Relative Redirect: /?verified=success]
       │  (7) Client detects query param & launches a premium gold success Toast
```

---

## 📂 Module Layout & Inventory

```
.cursor/custom-scriptz/stay-in-the-loop/
├── module.manifest.json                   # Module configuration and manifest
├── install.ps1                            # PowerShell installer script
├── env.example.fragment                   # Env variable baseline snippet
├── package-scripts.json                   # Any npm scripts needed for merging
├── collections/
│   └── Leads.ts                           # Payload CMS Leads collection schema & verification endpoint
├── components/
│   └── stay-in-the-loop-lightbox.tsx     # Lightbox trigger button, verification state handler, & pop-up form
└── lib/
    ├── same-origin-api.ts                 # Cross-platform relative/absolute API URI builder
    ├── site-origin-defaults.ts            # Absolute host backup definitions
    ├── public-origin.ts                   # Environment host parsing wrapper
    ├── notifications.ts                   # Global `site-settings` recipient dynamic pull helper
    ├── email-brand.ts                     # Visual branding hex codes & inline style guidelines
    ├── payload-auth-delete-preflight.ts   # Safe SQLite cascade row cleaner pre-deletion hook
    └── email-templates/
        └── email-templates.ts             # Cinematic responsive dark-gold email templates
```

---

## 🛠️ Installation & Activation Steps

### Automated Install
Run the following PowerShell command in the project directory:
```powershell
.\.cursor\custom-scriptz\stay-in-the-loop\install.ps1
```

### Manual Config Registrations
To fully integrate this module into the Payload Next.js codebase, register the following files:

1. **Payload Collections Setup (`payload.config.ts`):**
   ```typescript
   import { Leads } from './collections/Leads'
   import { resendAdapter } from '@payloadcms/email-resend'

   export default buildConfig({
     collections: [
       // ... existing collections,
       Leads,
     ],
     email: resendAdapter({
       defaultFromAddress: 'onboarding@resend.dev', // Replace with custom domain address
       defaultFromName: 'My Studio Channel',
       apiKey: process.env.RESEND_API_KEY || '',
     }),
   })
   ```

2. **Embed Newsletter Button (`app/(site)/page.tsx` or your footer):**
   ```tsx
   import { StayInTheLoopLightbox } from "@/components/stay-in-the-loop-lightbox"

   export default function FooterSection() {
     return (
       <div>
         <h4>Stay in Touch</h4>
         <StayInTheLoopLightbox />
       </div>
     )
   }
   ```

---

## 🔒 Postflight & Verification Checkpoints

1. **Required Environment Variables (`.env.local`):**
   - Verify `RESEND_API_KEY` is present.
   - Verify `NEXT_PUBLIC_SERVER_URL` matches your running server host (e.g. `http://localhost:3000`).
2. **Build Test:**
   ```bash
   npm run verify:next
   ```
3. **Double Opt-In Flow Smoke Test:**
   - Input a test email inside `StayInTheLoopLightbox`.
   - Assert a new record gets created under `leads` database table with `_verified: false`.
   - Check local log output to find the Resend verification URL: `/api/leads/verify/<token>`.
   - Paste the link into your browser. You should be redirected back to homepage with `/?verified=success`, displaying the gold toast.
   - Confirm the database record now shows `_verified: true`.
