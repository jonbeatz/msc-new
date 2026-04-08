-- Site Settings: `stickyHeader` (Enable Sticky Header)
--
-- If this column is missing while the field exists in `globals/SiteSettings.ts`, SQLite
-- queries fail and `/admin/globals/site-settings` can return 404. Prefer:
--   python scripts/migrate-sqlite-site-settings-sticky-header.py
--
-- Manual one-liner (snake_case — usual for Payload + SQLite):

ALTER TABLE site_settings ADD COLUMN sticky_header INTEGER DEFAULT 1;

-- If you see "duplicate column", the migration already ran.
-- Rare: if your build uses camelCase on this table:
-- ALTER TABLE site_settings ADD COLUMN stickyHeader INTEGER DEFAULT 1;
