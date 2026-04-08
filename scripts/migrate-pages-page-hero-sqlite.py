"""
Add Pages `pageHero` group columns to SQLite (Payload with db.push: false).

Run from repo root:
  python scripts/migrate-pages-page-hero-sqlite.py

Copies legacy `featured_image_id` into `page_hero_image_id` when the new column is empty.
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "payload.sqlite"

ADD_COLUMNS: list[tuple[str, str]] = [
    ("page_hero_enabled", "INTEGER DEFAULT 1"),
    ("page_hero_image_id", "INTEGER"),
    ("page_hero_cta_link", "TEXT"),
    ("page_hero_eyebrow", "TEXT"),
    ("page_hero_headline_line1", "TEXT"),
    ("page_hero_headline_line2", "TEXT"),
    ("page_hero_headline_line3", "TEXT"),
    ("page_hero_sub", "TEXT"),
    ("page_hero_seo_title", "TEXT"),
    ("page_hero_seo_description", "TEXT"),
    ("page_hero_seo_image_id", "INTEGER"),
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

        # Migrate legacy hero image into group
        conn.execute(
            """
            UPDATE pages
            SET page_hero_image_id = featured_image_id
            WHERE featured_image_id IS NOT NULL
              AND (page_hero_image_id IS NULL OR page_hero_image_id = 0)
            """
        )
        conn.commit()
        print("Done. Restart dev server if it was running.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
