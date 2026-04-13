-- Live (cPanel Terminal): run ONLY if SQLite errors with
--   malformed database schema (bookings_updated_at_idx) - no such table: main.bookings
-- Stop the Node app first. Prefer: remove payload.sqlite-wal and payload.sqlite-shm, then
-- re-upload payload.sqlite from PC; use this SQL if you must repair in place.
-- Usage: sqlite3 ./payload.sqlite < scripts/fix-sqlite-bookings-table.sql

PRAGMA writable_schema=ON;
DELETE FROM sqlite_master WHERE type='index' AND tbl_name='bookings';
PRAGMA writable_schema=OFF;
VACUUM;

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

CREATE INDEX IF NOT EXISTS `bookings_created_at_idx` ON `bookings` (`created_at`);
CREATE INDEX IF NOT EXISTS `bookings_email_idx` ON `bookings` (`email`);
CREATE INDEX IF NOT EXISTS `bookings_updated_at_idx` ON `bookings` (`updated_at`);
