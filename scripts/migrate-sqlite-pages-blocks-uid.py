"""
Add stable-uid columns for Pages sections blocks (Payload `db.push: false`).

Schema field names: `rowInstanceUid`, `itemInstanceUid` → SQLite: `row_instance_uid`, `item_instance_uid`.

If you ran an older migration that added `_row_uid` / `_item_uid`, this adds the canonical columns too.

Run: python scripts/migrate-sqlite-pages-blocks-uid.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "payload.sqlite"

ALTER: list[tuple[str, str, str]] = [
    ("pages_blocks_rich_text", "row_instance_uid", "TEXT"),
    ("pages_blocks_feature_grid", "row_instance_uid", "TEXT"),
    ("pages_blocks_video_player", "row_instance_uid", "TEXT"),
    ("pages_blocks_feature_grid_items", "item_instance_uid", "TEXT"),
]


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing database: {DB}")

    conn = sqlite3.connect(DB)
    try:
        for table, col, ddl in ALTER:
            cols = {r[1] for r in conn.execute(f"PRAGMA table_info({table})").fetchall()}
            if col in cols:
                print(f"skip (exists): {table}.{col}")
                continue
            sql = f'ALTER TABLE "{table}" ADD COLUMN "{col}" {ddl}'
            print(sql)
            conn.execute(sql)
        conn.commit()
        print("Done. Restart dev server.")
    finally:
        conn.close()


if __name__ == "__main__":
    main()
