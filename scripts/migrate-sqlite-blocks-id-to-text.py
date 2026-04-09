"""
Migrate pages_blocks_* tables so their `id` PK is TEXT instead of INTEGER.

Payload 3 generates 24-char hex ObjectID strings for block row IDs, but these
tables were originally created with INTEGER PKs → SQLite rejects text values
with "datatype mismatch".

Migration strategy (SQLite does not support ALTER COLUMN):
  1. Rename old table to *_old
  2. Re-create with TEXT id (and TEXT _parent_id on feature_grid_items,
     which references feature_grid.id)
  3. INSERT INTO new … SELECT CAST(id AS TEXT), … FROM *_old
  4. Drop *_old

Run:  python scripts/migrate-sqlite-blocks-id-to-text.py
"""

from __future__ import annotations

import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "payload.sqlite"

# ---------------------------------------------------------------------------
# DDL for each block table — TEXT id, keep _parent_id INTEGER (refs pages.id)
# ---------------------------------------------------------------------------

BLOCK_TABLES: list[tuple[str, str, list[str]]] = [
    (
        "pages_blocks_feature_grid",
        """CREATE TABLE pages_blocks_feature_grid (
  id                TEXT NOT NULL PRIMARY KEY,
  _parent_id        INTEGER NOT NULL,
  _order            INTEGER NOT NULL DEFAULT 0,
  _path             TEXT,
  section_id        TEXT,
  title             TEXT,
  block_name        TEXT,
  _row_uid          TEXT,
  row_instance_uid  TEXT
)""",
        ["id", "_parent_id", "_order", "_path", "section_id", "title", "block_name", "_row_uid", "row_instance_uid"],
    ),
    (
        "pages_blocks_rich_text",
        """CREATE TABLE pages_blocks_rich_text (
  id                TEXT NOT NULL PRIMARY KEY,
  _parent_id        INTEGER NOT NULL,
  _order            INTEGER NOT NULL DEFAULT 0,
  _path             TEXT,
  section_id        TEXT,
  content           TEXT,
  block_name        TEXT,
  title             TEXT,
  _row_uid          TEXT,
  row_instance_uid  TEXT
)""",
        ["id", "_parent_id", "_order", "_path", "section_id", "content", "block_name", "title", "_row_uid", "row_instance_uid"],
    ),
    (
        "pages_blocks_video_player",
        """CREATE TABLE pages_blocks_video_player (
  id                TEXT NOT NULL PRIMARY KEY,
  _parent_id        INTEGER NOT NULL,
  _order            INTEGER NOT NULL DEFAULT 0,
  _path             TEXT,
  section_id        TEXT,
  title             TEXT,
  video_url         TEXT,
  video_file_id     INTEGER,
  block_name        TEXT,
  _row_uid          TEXT,
  row_instance_uid  TEXT
)""",
        ["id", "_parent_id", "_order", "_path", "section_id", "title", "video_url", "video_file_id", "block_name", "_row_uid", "row_instance_uid"],
    ),
    (
        "pages_blocks_page_hero",
        """CREATE TABLE pages_blocks_page_hero (
  id               TEXT NOT NULL PRIMARY KEY,
  _parent_id       INTEGER NOT NULL,
  _order           INTEGER NOT NULL DEFAULT 0,
  _path            TEXT,
  block_name       TEXT,
  enabled          INTEGER DEFAULT 1,
  image_id         INTEGER,
  cta_link         TEXT,
  eyebrow          TEXT,
  headline_line1   TEXT,
  headline_line2   TEXT,
  headline_line3   TEXT,
  sub              TEXT,
  seo_title        TEXT,
  seo_description  TEXT,
  seo_image_id     INTEGER
)""",
        ["id", "_parent_id", "_order", "_path", "block_name", "enabled", "image_id", "cta_link", "eyebrow", "headline_line1", "headline_line2", "headline_line3", "sub", "seo_title", "seo_description", "seo_image_id"],
    ),
]

# feature_grid_items references feature_grid.id, so _parent_id becomes TEXT too
ITEMS_TABLE = (
    "pages_blocks_feature_grid_items",
    """CREATE TABLE pages_blocks_feature_grid_items (
  id                TEXT NOT NULL PRIMARY KEY,
  _parent_id        TEXT NOT NULL,
  _order            INTEGER NOT NULL DEFAULT 0,
  icon              TEXT,
  text              TEXT,
  _item_uid         TEXT,
  item_instance_uid TEXT
)""",
    ["id", "_parent_id", "_order", "icon", "text", "_item_uid", "item_instance_uid"],
)


def migrate_table(
    conn: sqlite3.Connection,
    table: str,
    create_sql: str,
    columns: list[str],
) -> None:
    """Rename → recreate with TEXT id → copy data → drop backup."""
    old = f"{table}_old_int"
    cur = conn.cursor()

    # Check whether id is already TEXT (idempotent)
    cur.execute(f"PRAGMA table_info({table})")
    info = {r[1]: r[2] for r in cur.fetchall()}
    if not info:
        print(f"  SKIP (table not found): {table}")
        return
    if info.get("id", "INTEGER").upper() == "TEXT":
        print(f"  SKIP (already TEXT): {table}.id")
        return

    # Drop any leftover backup
    cur.execute(f'DROP TABLE IF EXISTS "{old}"')

    print(f"  Migrating {table} ...")
    cur.execute(f'ALTER TABLE "{table}" RENAME TO "{old}"')
    cur.execute(create_sql)

    # Only copy columns that exist in both old and new schema
    old_cols_info = conn.execute(f"PRAGMA table_info({old})").fetchall()
    old_col_names = {r[1] for r in old_cols_info}
    copy_cols = [c for c in columns if c in old_col_names]

    sel_parts = []
    for c in copy_cols:
        sel_parts.append(f'CAST("{c}" AS TEXT)' if c == "id" else f'"{c}"')
        # _parent_id also needs cast when target column is TEXT
        if c == "_parent_id":
            # Check if new table has TEXT _parent_id
            new_info = conn.execute(f"PRAGMA table_info({table})").fetchall()
            new_types = {r[1]: r[2] for r in new_info}
            if new_types.get("_parent_id", "").upper() == "TEXT":
                sel_parts[-1] = 'CAST("_parent_id" AS TEXT)'

    sel = ", ".join(sel_parts)
    ins_cols = ", ".join(f'"{c}"' for c in copy_cols)
    cur.execute(f'INSERT INTO "{table}" ({ins_cols}) SELECT {sel} FROM "{old}"')
    n = cur.rowcount
    cur.execute(f'DROP TABLE "{old}"')
    print(f"    Copied {n} rows.")


def main() -> None:
    if not DB.is_file():
        raise SystemExit(f"Missing database: {DB}")

    conn = sqlite3.connect(DB)
    try:
        conn.execute("PRAGMA foreign_keys = OFF")
        conn.execute("BEGIN")

        for table, create_sql, columns in BLOCK_TABLES:
            migrate_table(conn, table, create_sql, columns)

        # Items table (TEXT _parent_id too)
        table, create_sql, columns = ITEMS_TABLE
        migrate_table(conn, table, create_sql, columns)

        conn.execute("COMMIT")
        conn.execute("PRAGMA foreign_keys = ON")
        print("Done. Restart the dev server.")
    except Exception as exc:
        conn.execute("ROLLBACK")
        raise SystemExit(f"Migration failed (rolled back): {exc}") from exc
    finally:
        conn.close()


if __name__ == "__main__":
    main()
