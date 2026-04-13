#!/usr/bin/env python3
"""
Rebuild `payload_locked_documents_rels` so `hero_slides_id` references
`homepage_hero_slides(id)` instead of the non-existent `hero_slides` table.

When that FK points at a missing table, SQLite reports errors like
`no such table: main.hero_slides` on unrelated DELETEs (e.g. bookings/leads),
and Payload surfaces them as 400s on bulk delete.

Idempotent: skips if the bad FK is already gone.

Usage (repo root):
  python scripts/migrate-sqlite-locked-docs-hero-slides-fk.py
"""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path


def main() -> int:
    root = Path(__file__).resolve().parent.parent
    db_path = root / "payload.sqlite"
    if not db_path.is_file():
        print(f"Skip: no database at {db_path}", file=sys.stderr)
        return 0

    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()
    cur.execute("PRAGMA foreign_key_list(payload_locked_documents_rels)")
    fk_rows = cur.fetchall()
    # (id, seq, table, from, to, on_update, on_delete, match)
    bad = [r for r in fk_rows if r[2] == "hero_slides"]
    if not bad:
        print("migrate-sqlite-locked-docs-hero-slides-fk: already fixed, nothing to do.")
        conn.close()
        return 0

    cur.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='homepage_hero_slides'")
    if cur.fetchone() is None:
        print(
            "migrate-sqlite-locked-docs-hero-slides-fk: homepage_hero_slides missing; run PAYLOAD_DB_PUSH=true once or restore DB.",
            file=sys.stderr,
        )
        conn.close()
        return 1

    cur.execute("SELECT COUNT(*) FROM payload_locked_documents_rels WHERE hero_slides_id IS NOT NULL")
    (non_null_hero,) = cur.fetchone()
    if non_null_hero:
        print(
            f"Warning: {non_null_hero} row(s) have hero_slides_id set; they will be preserved as text.",
            file=sys.stderr,
        )

    cur.execute("SELECT * FROM payload_locked_documents_rels")
    col_names = [d[0] for d in cur.description]
    rows = cur.fetchall()

    cur.execute("PRAGMA foreign_keys=OFF")
    cur.execute('DROP TABLE IF EXISTS "payload_locked_documents_rels"')

    cur.execute(
        """
        CREATE TABLE "payload_locked_documents_rels" (
            `id` integer PRIMARY KEY NOT NULL,
            `order` integer,
            `parent_id` integer NOT NULL,
            `path` text NOT NULL,
            `users_id` integer,
            `media_id` integer,
            `bookings_id` integer,
            `leads_id` integer,
            `pages_id` integer,
            `hero_slides_id` text,
            `projects_id` integer,
            FOREIGN KEY (`parent_id`) REFERENCES `payload_locked_documents`(`id`) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (`users_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (`bookings_id`) REFERENCES `bookings`(`id`) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (`leads_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (`pages_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
            FOREIGN KEY (`hero_slides_id`) REFERENCES `homepage_hero_slides`(`id`) ON UPDATE no action ON DELETE cascade
        )
        """
    )

    if rows:
        placeholders = ",".join(["?"] * len(col_names))
        # hero_slides_id was integer in old table; store as string for TEXT FK
        hero_idx = col_names.index("hero_slides_id")
        out_rows = []
        for row in rows:
            lst = list(row)
            v = lst[hero_idx]
            if v is not None:
                lst[hero_idx] = str(v)
            out_rows.append(tuple(lst))
        cols = ",".join(f'"{c}"' for c in col_names)
        cur.executemany(
            f'INSERT INTO "payload_locked_documents_rels" ({cols}) VALUES ({placeholders})',
            out_rows,
        )

    cur.execute("PRAGMA foreign_keys=ON")
    conn.commit()

    cur.execute("PRAGMA foreign_key_check(payload_locked_documents_rels)")
    bad_check = cur.fetchall()
    conn.close()

    if bad_check:
        print(f"foreign_key_check failed: {bad_check}", file=sys.stderr)
        return 1

    print("migrate-sqlite-locked-docs-hero-slides-fk: OK (hero_slides FK -> homepage_hero_slides).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
