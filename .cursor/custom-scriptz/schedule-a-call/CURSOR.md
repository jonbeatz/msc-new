# 📔 Schedule-A-Call Module (Developer Runbook)

## Module Metadata
- **ID:** `schedule-a-call`
- **Location:** `.cursor/custom-scriptz/schedule-a-call/`
- **Dependencies:** `react-day-picker` (Calendar), `date-fns` (Date formatting), `lucide-react` (UI icons), `@payloadcms/email-resend` (Payload email)

---

## 🏗️ Architecture & Core Integration

This module offers a premium, high-speed single-step scheduled call modal designed to optimize conversion on marketing pages. It supports two alternative backend architecture options:

```
[User Browser]
       │
       ▼  (Inputs name, email, phone, date, time slot on one single screen)
[ScheduleACallLightbox]
       │
       ├───► [Option A: useBookingsOption={true}] ──► POST /api/bookings (stores as Booking, source: 'schedule-call')
       │
       └───► [Option B: useBookingsOption={false}] ──► POST /api/call-requests (stores in separate CallRequests collection)
```

---

## 📂 Module Layout & Inventory

```
.cursor/custom-scriptz/schedule-a-call/
├── module.manifest.json                   # Module metadata and dependency manifest
├── install.ps1                            # Portable installation controller
├── env.example.fragment                   # Env variable baseline snippet
├── package-scripts.json                   # Any npm scripts needed for merging
├── collections/
│   └── CallRequests.ts                    # Option B Schema config: Standalone call-requests collection
├── components/
│   └── schedule-a-call-lightbox.tsx      # All-in-one single-screen premium calendar + contact form lightbox
└── lib/
    ├── call-request.ts                    # Client request router supporting Option A / Option B endpoints
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
.\.cursor\custom-scriptz\schedule-a-call\install.ps1
```

### Manual Config & Setup Registration

#### Option A: Re-using the `bookings` collection
Excellent for consolidating all appointments under one schema with a distinguishing source tag.

1. Verify `Bookings` collection is registered in `payload.config.ts`.
2. Place the component with `useBookingsOption` enabled:
   ```tsx
   import { ScheduleACallLightbox } from "@/components/schedule-a-call-lightbox"

   export default function Section() {
     return <ScheduleACallLightbox useBookingsOption={true} />
   }
   ```

#### Option B: Standalone `call-requests` collection
Best for isolated workflows, simple tables, and separating raw inbound leads from standard consultations.

1. **Register the collection inside `payload.config.ts`:**
   ```typescript
   import { CallRequests } from './collections/CallRequests'

   export default buildConfig({
     collections: [
       // ... existing,
       CallRequests,
     ]
   })
   ```
2. **Place the component directly in code:**
   ```tsx
   import { ScheduleACallLightbox } from "@/components/schedule-a-call-lightbox"

   export default function Section() {
     return <ScheduleACallLightbox />
   }
   ```

---

## 🔒 Postflight & Verification Checkpoints

1. **Required Environment Variables (`.env.local`):**
   - Ensure `RESEND_API_KEY` is present.
   - Verify `NEXT_PUBLIC_SERVER_URL` matches your local running server (e.g. `http://localhost:3000`).
2. **Build Gate:**
   ```bash
   npm run verify:next
   ```
3. **Database Assertion (Option A / Option B):**
   - Schedule a test call.
   - Assert correct records appear either in `bookings` with `source: 'schedule-call'` or in the `call-requests` collection.
