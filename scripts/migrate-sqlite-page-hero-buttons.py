"""
Add `pageHero.buttons` group columns to SQLite (Payload with db.push: false).

Nested group fields use the prefix `page_hero_buttons_` on the `pages` table.

Run from repo root:
  python scripts/migrate-sqlite-page-hero-buttons.py

Then restart `next dev` / `next start`.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "payload.sqlite"

ADD_COLUMNS: list[tuple[str, str]] = [
    ("page_hero_buttons_show_primary_button", "INTEGER DEFAULT 1"),
    ("page_hero_buttons_primary_button_action", "TEXT DEFAULT 'lightbox'"),
    ("page_hero_buttons_primary_button_link", "TEXT"),
    ("page_hero_buttons_show_secondary_button", "INTEGER DEFAULT 1"),
    ("page_hero_buttons_secondary_button_label", "TEXT DEFAULT 'View Demos'"),
    ("page_hero_buttons_secondary_button_link", "TEXT DEFAULT '/#msc-demos'"),
]


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing database: {DB}")

    conn = sqlite3.connect(DB)
    try:
        existing = {
            row[1]
            for row in conn.execute("PRAGMA table_info(pages)").fetchall()
        }
        for col, ddl in ADD_COLUMNS:
            if col in existing:
                print(f"skip (exists): {col}")
                continue
            sql = f'ALTER TABLE pages ADD COLUMN "{col}" {ddl}'
            print(f"exec: {sql}")
            conn.execute(sql)
        conn.commit()

        # Prefer legacy hero CTA as custom primary link when the new field is empty
        conn.execute(
            """
            UPDATE pages
            SET page_hero_buttons_primary_button_link = page_hero_cta_link
            WHERE page_hero_cta_link IS NOT NULL
              AND TRIM(page_hero_cta_link) != ''
              AND (
                page_hero_buttons_primary_button_link IS NULL
                OR TRIM(page_hero_buttons_primary_button_link) = ''
              )
            """
        )
        conn.commit()
        print("Done. Restart the dev server if it was running.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
