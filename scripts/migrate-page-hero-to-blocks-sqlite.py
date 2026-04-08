"""
Migrate legacy flat `page_hero_*` columns on `pages` into `pages_blocks_page_hero`
after `pageHero` became a blocks field (max 1 row).

Prerequisite: columns from `migrate-pages-page-hero-sqlite.py` (or equivalent).

Run:  python scripts/migrate-page-hero-to-blocks-sqlite.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "payload.sqlite"

DDL = """
CREATE TABLE IF NOT EXISTS `pages_blocks_page_hero` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  `_parent_id` INTEGER NOT NULL,
  `_order` INTEGER DEFAULT 0 NOT NULL,
  `_path` TEXT,
  `block_name` TEXT,
  `enabled` INTEGER DEFAULT 1,
  `image_id` INTEGER,
  `cta_link` TEXT,
  `eyebrow` TEXT,
  `headline_line1` TEXT,
  `headline_line2` TEXT,
  `headline_line3` TEXT,
  `sub` TEXT,
  `seo_title` TEXT,
  `seo_description` TEXT,
  `seo_image_id` INTEGER
);
"""

INSERT = """
INSERT INTO pages_blocks_page_hero (
  _parent_id, _order, _path, block_name,
  enabled, image_id, cta_link, eyebrow,
  headline_line1, headline_line2, headline_line3, sub,
  seo_title, seo_description, seo_image_id
)
SELECT
  p.id,
  0,
  'pageHero',
  NULL,
  COALESCE(p.page_hero_enabled, 1),
  p.page_hero_image_id,
  p.page_hero_cta_link,
  p.page_hero_eyebrow,
  p.page_hero_headline_line1,
  p.page_hero_headline_line2,
  p.page_hero_headline_line3,
  p.page_hero_sub,
  p.page_hero_seo_title,
  p.page_hero_seo_description,
  p.page_hero_seo_image_id
FROM pages p
WHERE NOT EXISTS (
  SELECT 1 FROM pages_blocks_page_hero h
  WHERE h._parent_id = p.id AND h._path = 'pageHero'
)
AND (
  p.page_hero_image_id IS NOT NULL
  OR TRIM(COALESCE(p.page_hero_eyebrow, '')) != ''
  OR TRIM(COALESCE(p.page_hero_headline_line1, '')) != ''
  OR TRIM(COALESCE(p.page_hero_sub, '')) != ''
);
"""


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing database: {DB}")

    conn = sqlite3.connect(DB)
    try:
        cols = {r[1] for r in conn.execute("PRAGMA table_info(pages)").fetchall()}
        if "page_hero_image_id" not in cols:
            print("pages.page_hero_* columns not found; run migrate-pages-page-hero-sqlite.py first (or add hero data in admin after deploy).")
            conn.execute(DDL)
            conn.commit()
            return

        conn.execute(DDL)
        conn.commit()
        cur = conn.execute(INSERT)
        conn.commit()
        print(f"Inserted {cur.rowcount} page hero block row(s).")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
