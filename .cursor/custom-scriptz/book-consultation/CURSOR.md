# 📔 Book-Consultation Module (Developer Runbook)

## Module Metadata
- **ID:** `book-consultation`
- **Location:** `.cursor/custom-scriptz/book-consultation/`
- **Dependencies:** `react-day-picker` (Calendar), `date-fns` (Date formatting), `lucide-react` (UI icons), `@payloadcms/email-resend` (Payload email)

---

## 🏗️ Architecture & Flow Overview

```
[User Browser]
       │  (1) Triggers Modal via useBookConsultation()
       ▼
[BookConsultationLightbox]
       │  (2) Form Validation (US Phone, Email Regex)
       │  (3) Calculates date/time ISO from inputs + timezone
       ▼
[submitBookingRequest] (client lib)
       │  (4) POST /api/bookings (or optional WP-JSON backup API)
       ▼
[Payload CMS Hook (afterChange)]
       │  (5) Saves booking entry to MongoDB/Postgres
       │  (6) Compiles cinematic gold HTML templates (User / Admin)
       │  (7) Dispatches parallel Resend email requests
       ▼
[Resend Email Delivery] ──► Confirms to user & alerts admin recipients
```

---

## 📂 Module Layout & Inventory

```
.cursor/custom-scriptz/book-consultation/
├── module.manifest.json                   # Module configuration and manifest
├── install.ps1                            # PowerShell installer script
├── env.example.fragment                   # Env variable baseline snippet
├── package-scripts.json                   # Any npm scripts needed for merging
├── config/
│   └── book-consultation.config.json      # Customizable time slot, gold color configurations
├── collections/
│   └── Bookings.ts                        # Payload CMS bookings collection schema & hook
├── components/
│   ├── book-consultation-context.tsx      # React Context Provider (<BookConsultationProvider>)
│   └── book-consultation-lightbox.tsx     # Full multi-step modal with Tailwind CSS UI
└── lib/
    ├── booking.ts                         # Client-side endpoint submission router
    ├── same-origin-api.ts                 # Cross-platform relative/absolute API URI builder
    ├── site-origin-defaults.ts            # Absolute host backup definitions
    ├── public-origin.ts                   # Environment host parsing wrapper
    ├── notifications.ts                   # Global `site-settings` recipient dynamic pull helper
    ├── email-brand.ts                     # Visual branding hex codes & inline style guidelines
    └── email-templates/
        └── email-templates.ts             # Cinematic responsive dark-gold email templates
```

---

## 🛠️ Installation & Activation Steps

### Automated Install
Run the following PowerShell command in the project directory:
```powershell
.\.cursor\custom-scriptz\book-consultation\install.ps1
```

### Manual Config Registrations
To fully integrate this module into the Payload Next.js codebase, register the following files:

1. **Payload Collections Setup (`payload.config.ts`):**
   ```typescript
   import { Bookings } from './collections/Bookings'
   import { resendAdapter } from '@payloadcms/email-resend'

   export default buildConfig({
     collections: [
       // ... existing collections,
       Bookings,
     ],
     email: resendAdapter({
       defaultFromAddress: 'onboarding@resend.dev', // Replace with custom domain address
       defaultFromName: 'My Studio Channel',
       apiKey: process.env.RESEND_API_KEY || '',
     }),
   })
   ```

2. **Wrap App Shell (`app/(site)/layout.tsx`):**
   ```tsx
   import { BookConsultationProvider } from "@/components/book-consultation-context"

   export default function RootLayout({ children }) {
     return (
       <html lang="en">
         <body>
           <BookConsultationProvider>
             {children}
           </BookConsultationProvider>
         </body>
       </html>
     )
   }
   ```

3. **Trigger Modal in Code:**
   ```tsx
   import { useBookConsultation } from "@/components/book-consultation-context"

   export function CallToActionButton() {
     const { openBookConsultation } = useBookConsultation()

     return (
       <button onClick={() => openBookConsultation({ interestedPackage: "Pro Creator" })}>
         Secure Private Studio Session
       </button>
     )
   }
   ```

---

## 🔒 Postflight & Verification Checkpoints

1. **Required Environment Variables (`.env.local`):**
   - Verify `RESEND_API_KEY` is present.
   - Verify `NEXT_PUBLIC_SERVER_URL` or `PAYLOAD_PUBLIC_SERVER_URL` matches your running server host.
2. **Build Test:**
   ```bash
   npm run verify:next
   ```
3. **HTTP Smoke Test:**
   - Submit a test booking.
   - Assert the MongoDB / Postgres `bookings` collection successfully captures the record.
   - Inspect local/console outputs to verify that Resend sent the `Booking Confirmed` and `New Booking Alert` emails without errors.
