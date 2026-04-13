#!/usr/bin/env python3
"""
Repair payload.sqlite when SQLite reports:
  malformed database schema (bookings_updated_at_idx) - no such table: main.bookings

Typical causes: orphan indexes on `bookings` after a bad migration, or WAL files out of
sync with a replaced main file (delete *.sqlite-wal and *.sqlite-shm after stopping Node,
then re-upload payload.sqlite, or run this script).

Usage (repo root or pass path):
  python scripts/fix-sqlite-bookings-table.py
  python scripts/fix-sqlite-bookings-table.py /path/to/payload.sqlite
"""
from __future__ import annotations

import os
import sqlite3
import sys

DDL_BOOKINGS = """
CREATE TABLE IF NOT EXISTS "bookings" (
  `id` integer PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `phone` text NOT NULL,
  `appointment_date` text NOT NULL,
  `message` text,
  `source` text,
  `preferred_date_local` text,
  `preferred_time_local` text,
  `time_zone` text,
  `updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  `created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
);
"""

INDEXES = [
    "CREATE INDEX IF NOT EXISTS `bookings_created_at_idx` ON `bookings` (`created_at`);",
    "CREATE INDEX IF NOT EXISTS `bookings_email_idx` ON `bookings` (`email`);",
    "CREATE INDEX IF NOT EXISTS `bookings_updated_at_idx` ON `bookings` (`updated_at`);",
]


def main() -> int:
    db_path = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else "payload.sqlite")
    if not os.path.isfile(db_path):
        print(f"fix-sqlite-bookings-table: missing file: {db_path}", file=sys.stderr)
        return 1

    conn = sqlite3.connect(db_path)
    try:
        row = conn.execute(
            "SELECT 1 FROM sqlite_master WHERE type='table' AND name='bookings'"
        ).fetchone()
        has_table = row is not None

        if has_table:
            print("fix-sqlite-bookings-table: table `bookings` already exists - nothing to do.")
            return 0

        print("fix-sqlite-bookings-table: `bookings` missing — removing orphan indexes, then creating table.")
        conn.execute("PRAGMA writable_schema=ON")
        conn.execute("DELETE FROM sqlite_master WHERE type='index' AND tbl_name='bookings'")
        conn.execute("PRAGMA writable_schema=OFF")
        conn.commit()
        conn.execute("VACUUM")
        conn.executescript(DDL_BOOKINGS)
        for stmt in INDEXES:
            conn.execute(stmt)
        conn.commit()
        print("fix-sqlite-bookings-table: OK (bookings table + indexes).")
        return 0
    finally:
        conn.close()


if __name__ == "__main__":
    raise SystemExit(main())
