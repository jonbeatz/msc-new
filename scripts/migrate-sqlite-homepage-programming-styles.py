"""
Create `homepage_programming_styles` for `globals/Homepage.ts` (`programmingStyles` array)
when `db.push: false`.

Without this table, `findGlobal('homepage')` can fail after adding the field.

Run:  python scripts/migrate-sqlite-homepage-programming-styles.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / "payload.sqlite"
TABLE = "homepage_programming_styles"

DDL = """
CREATE TABLE `homepage_programming_styles` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` text PRIMARY KEY NOT NULL,
	`image_id` integer NOT NULL,
	`label` text,
	FOREIGN KEY (`_parent_id`) REFERENCES `homepage`(`id`) ON UPDATE no action ON DELETE cascade
);
"""


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing database: {DB}")

    conn = sqlite3.connect(DB)
    try:
        existing = {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if TABLE in existing:
            print(f"Table {TABLE!r} already exists; nothing to do.")
            return
        conn.executescript(DDL)
        conn.commit()
        print(f"Created {TABLE}.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
