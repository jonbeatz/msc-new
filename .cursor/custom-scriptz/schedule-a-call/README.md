# 📅 Schedule-A-Call Module

A premium, highly optimized standalone call scheduling widget with a streamlined single-screen interface (calendar picker + name/email/phone on one layout). Integrates into Payload CMS and Next.js, offering flexible database target paths.

## 🚀 Key Features

- **High-Speed Conversion UX:** Calendar selector and contact fields combined on one elegant display to minimize drag-offs.
- **Dual Backend Architecture:**
  - **Option A:** Store requests inside your existing `bookings` collection with `source: 'schedule-call'` to consolidate files.
  - **Option B:** Utilize the standalone `call-requests` database table schema for dedicated inbound lead separation.
- **Glassmorphic Brand Aesthetics:** Visual elements align with premium dark mode guidelines, bento boxes, and border outlines.
- **Automatic Environment Verification:** Snaps easily onto the workspace Resend configuration to alert admins and clients.

## 📦 File Structure

```
.cursor/custom-scriptz/schedule-a-call/
├── module.manifest.json                   # Metadata specifications
├── install.ps1                            # Portable installation controller
├── CURSOR.md                              # Technical guide & dual backend integration details
├── env.example.fragment                   # Env snippet block
└── collections/
    └── CallRequests.ts                    # Option B collection schema config
└── components/
    └── schedule-a-call-lightbox.tsx      # All-in-one lightbox scheduler component
└── lib/
    ├── call-request.ts                    # Client request routing library
    ├── same-origin-api.ts                 # Endpoint address builder
    ├── public-origin.ts                   # URL validation utilities
    ├── site-origin-defaults.ts            # Host defaults configurations
    ├── notifications.ts                   # Dynamic email setting receiver
    ├── email-brand.ts                     # Gold system CSS variables
    └── email-templates/
        └── email-templates.ts             # Rich custom email templates
```

## 🛠️ Dynamic Installation

Execute the installer script from your project root:

```powershell
.\.cursor\custom-scriptz\schedule-a-call\install.ps1
```

Once installed, configure your target backend in accordance with the specifications in `CURSOR.md`!

---
*My Studio Channel Personal Dev Profile Module.*
