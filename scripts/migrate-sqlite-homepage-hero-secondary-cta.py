"""
Add hero slide secondary CTA columns for `globals/Homepage.ts` when `db.push: false`.

Without `secondary_cta_label` / `secondary_cta_link`, `findGlobal('homepage')` can fail and
`/admin/globals/homepage` returns 404.

Run:  python scripts/migrate-sqlite-homepage-hero-secondary-cta.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / "payload.sqlite"
TABLE = "homepage_hero_slides"
COLS = [
    ("secondary_cta_label", "TEXT"),
    ("secondary_cta_link", "TEXT"),
]


def existing_columns(conn: sqlite3.Connection, table: str) -> set[str]:
    rows = conn.execute(f'PRAGMA table_info("{table}")').fetchall()
    return {r[1] for r in rows}


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing database: {DB}")

    conn = sqlite3.connect(DB)
    try:
        if TABLE not in {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }:
            raise SystemExit(f"Missing table {TABLE!r}")

        existing = existing_columns(conn, TABLE)
        for name, typ in COLS:
            if name in existing:
                print(f"Column {name!r} already exists; skip.")
                continue
            conn.execute(f'ALTER TABLE "{TABLE}" ADD COLUMN "{name}" {typ}')
            print(f"Added {TABLE}.{name} {typ}")
        conn.commit()
    finally:
        conn.close()


if __name__ == "__main__":
    main()
