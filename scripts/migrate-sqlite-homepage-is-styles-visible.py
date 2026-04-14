"""
Migration: add is_styles_visible column to homepage table.

The `isStylesVisible` checkbox field was added to globals/Homepage.ts
(Show Programming Styles Section toggle) but the SQLite schema was never
updated.  Drizzle now selects this column and the query fails with:
  SQLITE_ERROR: no such column: is_styles_visible

Fix: ALTER TABLE to add the column with the same default Payload uses
(checkbox defaultValue: true → INTEGER 1).
"""
import sqlite3
import sys
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "payload.sqlite")

def main():
    if not os.path.exists(DB_PATH):
        print(f"[migrate] ERROR: database not found at {DB_PATH}")
        sys.exit(1)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if column already exists
    cursor.execute("PRAGMA table_info(homepage)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"[migrate] homepage columns: {columns}")

    if "is_styles_visible" in columns:
        print("[migrate] SKIP: is_styles_visible already exists in homepage table.")
        conn.close()
        return

    print("[migrate] Adding is_styles_visible column to homepage table ...")
    cursor.execute(
        "ALTER TABLE homepage ADD COLUMN is_styles_visible INTEGER DEFAULT 1"
    )
    conn.commit()

    # Verify
    cursor.execute("PRAGMA table_info(homepage)")
    columns_after = [row[1] for row in cursor.fetchall()]
    print(f"[migrate] homepage columns after: {columns_after}")

    if "is_styles_visible" in columns_after:
        print("[migrate] SUCCESS: is_styles_visible added.")
    else:
        print("[migrate] ERROR: column was not added!")
        conn.close()
        sys.exit(1)

    conn.close()

if __name__ == "__main__":
    main()
