"""
After switching `pageHero` from `blocks` back to a `group`, copy row data from
`pages_blocks_page_hero` into `pages.page_*` hero columns and remove block rows.

Run:  python scripts/sync-page-hero-block-to-group-sqlite.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / "payload.sqlite"


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing {DB}")

    conn = sqlite3.connect(DB)
    try:
        tables = {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if "pages_blocks_page_hero" not in tables:
            print("No pages_blocks_page_hero table; nothing to sync.")
            return

        rows = conn.execute(
            """
            SELECT _parent_id, enabled, image_id, cta_link, eyebrow,
                   headline_line1, headline_line2, headline_line3, sub,
                   seo_title, seo_description, seo_image_id
            FROM pages_blocks_page_hero
            WHERE _path = 'pageHero'
            """
        ).fetchall()

        for r in rows:
            (
                parent_id,
                enabled,
                image_id,
                cta_link,
                eyebrow,
                h1,
                h2,
                h3,
                sub,
                seo_title,
                seo_desc,
                seo_img,
            ) = r
            conn.execute(
                """
                UPDATE pages SET
                  page_hero_enabled = ?,
                  page_hero_image_id = ?,
                  page_hero_cta_link = ?,
                  page_hero_eyebrow = ?,
                  page_hero_headline_line1 = ?,
                  page_hero_headline_line2 = ?,
                  page_hero_headline_line3 = ?,
                  page_hero_sub = ?,
                  page_hero_seo_title = ?,
                  page_hero_seo_description = ?,
                  page_hero_seo_image_id = ?
                WHERE id = ?
                """,
                (
                    1 if enabled else 0,
                    image_id,
                    cta_link,
                    eyebrow,
                    h1,
                    h2,
                    h3,
                    sub,
                    seo_title,
                    seo_desc,
                    seo_img,
                    parent_id,
                ),
            )

        conn.execute("DELETE FROM pages_blocks_page_hero")
        conn.commit()
        print(f"Synced {len(rows)} hero block row(s) into pages.* columns and cleared block table.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
