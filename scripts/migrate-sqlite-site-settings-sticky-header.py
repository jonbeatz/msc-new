"""
Add `sticky_header` to `site_settings` when the Payload field `stickyHeader` exists
in config but SQLite was not migrated (`db.push: false`).

Without this column, `findGlobal` fails in admin and `/admin/globals/site-settings` returns 404.

Run:  python scripts/migrate-sqlite-site-settings-sticky-header.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

DB = Path(__file__).resolve().parents[1] / "payload.sqlite"
TABLE = "site_settings"
# Payload SQLite adapter typically uses snake_case column names.
COL_SNAKE = "sticky_header"
COL_CAMEL = "stickyHeader"


def existing_columns(conn: sqlite3.Connection, table: str) -> set[str]:
    rows = conn.execute(f'PRAGMA table_info("{table}")').fetchall()
    return {r[1] for r in rows}


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing database: {DB}")

    conn = sqlite3.connect(DB)
    try:
        tables = {
            r[0]
            for r in conn.execute(
                "SELECT name FROM sqlite_master WHERE type='table'"
            ).fetchall()
        }
        if TABLE not in tables:
            raise SystemExit(
                f'Table "{TABLE}" not found. Available: {sorted(tables)!r}'
            )

        cols = existing_columns(conn, TABLE)
        if COL_SNAKE in cols or COL_CAMEL in cols:
            print(
                f"Column already present ({COL_SNAKE!r} or {COL_CAMEL!r}); nothing to do."
            )
            return

        # Prefer snake_case (matches other site_settings columns in this project).
        conn.execute(
            f'ALTER TABLE "{TABLE}" ADD COLUMN "{COL_SNAKE}" INTEGER DEFAULT 1'
        )
        conn.commit()
        print(f'Added "{TABLE}"."{COL_SNAKE}" INTEGER DEFAULT 1')
    finally:
        conn.close()


if __name__ == "__main__":
    main()
