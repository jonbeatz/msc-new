# ToDo — ideas & next session focus

Lightweight list for **Jon** and the agent: what you might work on next, without replacing **ReCall.md** (history) or **Restore-Points.md** (checkpoints).

**How to use**

- Add a bullet when you have an idea; bump items to the top when they’re “tomorrow” or “this week.”
- In chat, say: *“Check `ToDo.md`”* or paste a line from here so the agent picks it up.
- When something is done, move it to **Done (recent)** or delete—keep this file short.

**Source-of-truth order** for conflicts: `START-HERE.md` → `Agent-Runbook.md` → … (this file is **not** above those).

---

## Next session (2026-04-11)

1. **Email templates — review pass**  
   - Review Payload email HTML for **Leads** + **Bookings** (`collections/Leads.ts`, `collections/Bookings.ts`), dev preview at `/dev/email-preview` if enabled.  
   - Goal: consistency, dark-mode behavior, links, copy.

2. **Admin login — show password (eyeball toggle)**  
   - Add a **reveal password** control on the **Payload admin login** UI (eye icon).  
   - Likely: custom login component or CSS + small client script in Payload admin customization—confirm Payload 3 pattern for login view overrides.

---

## Backlog / later

*(Add quick bullets here.)*

---

## Done (recent)

- **Media (2026-04-11)** — Single static asset location: **`public/media`**, URLs **`/media/...`**. **`npm run media:consolidate`** and **`npm run media:sync`** are live in **`package.json`** (see **Jedi-List.md**, **Custom-Prompts** items 33–35). Legacy duplicate folders at repo root **`media/`** and under **`public/`** for old static images were removed; do not reintroduce alternate image roots.
