# NovaMira / MSC PRO ENGINE — project & technical context

This document merges **product context**, **stack conventions**, and **v4.7.x-ready implementation notes** for the `msc-shows-core` plugin and NovaMira sites. Use it so assistants (Cursor, Gemini, etc.) understand scope without assuming Divi 5 or unmerged features.

**Repo note:** This workspace may show a plugin header version (e.g. `4.6.3`) while chat/docs refer to **v4.7.x** work (Stable / Dynamic / Logic Sync). **Always verify** `msc-shows-core.php` `Version:` and file contents before treating behavior as shipped.

---

## 1. What this is

NovaMira is a WordPress-based **media engine** for a studio-style site: shows/projects, cinematic grids, and admin tooling branded as **MSC PRO ENGINE** (plugin folder: `msc-shows-core`). It targets LocalWP (or similar) with **Divi 4**, **Advanced Custom Fields (ACF)**, a child theme, and optional **DiviGear** CPT modules for filterable grids.

---

## 2. Stack

| Layer | Choice |
|--------|--------|
| Core | WordPress 6.x |
| Builder | **Divi 4** — Classic Builder / `et_pb_*` shortcodes, Theme Builder as shipped with Divi 4. **Not** Divi 5 block JSON by default unless the project explicitly switches. |
| Data | ACF for Show Data and related fields; Featured Image aligned with thumbnails where the project defines it. |
| CPT | **Shows** + taxonomy **Show Categories** — registered in the plugin (`cpt-registration.php`). |
| Grids / filters | DiviGear CPT (**filter** + **item** modules) + plugin CSS/JS for layout, hover, empty states, etc. |
| Naming | PHP: `msc_` prefix; CSS: `msc-` / `nm-` to avoid collisions with Divi/WP. |

**Single plugin** owns most “Shows engine” behavior so it stays **portable** (logic not duplicated in the child theme once the plugin is active). See also `.cursorrules` and `.cursor/skills/Nova/SKILL.md`.

---

## 3. What `msc-shows-core` does (high level)

### 3.1 Admin (“Studio Mode”)

- Settings under WP Admin (e.g. **MSC Shows Core**), with tabs such as **Layout Tuning**, **System Status**, **Tutorials**.
- **Layout Tuning:** grid hints (columns, excerpt limits, hover zoom intensity/speed, etc.) stored in `msc_shows_core_settings`.
- **System Status:** connectivity (ACF, Divi, DiviGear), video library feed (YouTube URLs), **Environment** toggles for Engine theme (`studio_light` vs `saas_dark`) and accent (**MSC Red** vs **Jedi Green**). Theme/accent may save via AJAX (`msc_shows_core_save_engine_prefs` in v4.7.x work) so the UI updates without a full reload; PHP persists `msc_engine_theme_mode` and `msc_shows_accent_color` in the same options array.
- **Tutorials:** remote video metadata; mirrors front-end Vader lightbox patterns in admin where configured.

### 3.2 Frontend

- Enqueues `grid-style.css`, Magnific Popup, and scripts for grid behavior and **Vader** (YouTube iframe, lightbox) when the request needs them (singular Shows, archives, content with DiviGear markers, etc.).
- Inline CSS variables on `.msc-shows-core-wrap` for accent and hover tuning (`--msc-hover-scale`, `--msc-hover-speed`, etc.) tied to saved Layout Tuning values (see §5).
- Body classes for grid columns, hover zoom on/off, stability guard, etc.

### 3.3 Other includes (files to care about)

CPT/tax registration, admin menus, ACF registration and logic, list columns/extras, DiviGear auto category sync and category cache helpers, video library helpers, single-show template, Vader lightbox integration.

**Bootstrap:** `wp-content/plugins/msc-shows-core/msc-shows-core.php`  
**Admin UI & tabs:** `includes/admin-dashboard.php`  
**AJAX & admin POST:** `includes/admin-actions.php`  
**Engine prefs JS (v4.7.x):** `assets/js/msc-engine-prefs.js`  
**Admin CSS:** `assets/css/admin-style.css`  
**Frontend grid CSS:** `assets/css/grid-style.css`  
**Conventions:** `.cursorrules`, `.cursor/skills/Nova/SKILL.md`

---

## 4. Grid query logic (frontend “shows” list)

The plugin **does not** run its own public `WP_Query` / shortcode for the main grid. **DiviGear** builder modules drive the loop:

| Module | Role |
|--------|------|
| `dgcm_cptfilter` | Filter bar / query context |
| `dgcm_cptitem` | Card markup |

MSC Shows Core **hooks Divi**; it does **not** replace DiviGear’s query.

**Typical flow**

1. Divi (de)serializes module props / shortcode attrs (e.g. `post_type`, taxonomy mode, term CSVs).
2. `msc_shows_core_dgcm_track_filter_post_type` (`et_pb_module_shortcode_attributes`, priority **5**) stores `$props['post_type']` from the filter module in `$GLOBALS['msc_shows_core_dgcm_filter_post_type']` when `render_slug === 'dgcm_cptfilter'`.
3. Other filters (read-more label, auto-sync term merge) only **mutate module props**; they do **not** build `WP_Query` args in PHP.

There is **no** single canonical `WP_Query` in this plugin with `post_type`, `tax_query`, and `meta_query` for the front-end grid—those arguments live in **DiviGear’s** module output.

**Plugin-side queries that do exist**

| Where | Purpose |
|-------|---------|
| `admin-shows-extras.php` | **All Shows** admin list filter: `pre_get_posts` on `edit.php?post_type=shows` — if `msc_show_cat` set, `tax_query` with `taxonomy => show_category`, `field => term_id`, `terms => $term_id`. |
| `divigear-auto-category-sync.php` | **Not** a post query — `get_terms( array( 'taxonomy' => 'show_category', 'hide_empty' => false, 'fields' => 'ids', … ) )` to build CSVs merged into filter module props. |
| Main query / archives | `is_post_type_archive( 'shows' )`, `is_tax( 'show_category' )`, `is_singular( 'shows' )` mainly drive **asset enqueue** / **templates**, not a custom grid loop in PHP. |

**Child theme:** If a shortcode with `WP_Query` exists there, it is **outside** `msc-shows-core` unless added locally.

---

## 5. CSS variable injection (settings → inline CSS)

**File:** `msc-shows-core.php`  
**Function:** `msc_shows_core_enqueue_frontend_assets()`  
**Hook:** `wp_enqueue_scripts`, priority **20**.

**Helpers (same file):**

- `msc_shows_core_get_hover_zoom_for_css()` — `hover_zoom_intensity` from `msc_shows_core_settings`, clamped **0–4**.
- `msc_shows_core_get_hover_speed_for_css()` — `hover_transition_speed`, clamped **0–10** seconds.
- Accent hex from `global_accent_color` (fallback `#cc0000`).

Inline style is attached to the **`msc-shows-core-grid`** handle:

```php
wp_add_inline_style(
	'msc-shows-core-grid',
	':root .msc-shows-core-wrap{--msc-shows-accent:' . esc_html( $accent ) . ';--msc-hover-scale:' . $zoom_css . ';--msc-hover-speed:' . $speed_css . 's;}'
);
```

**Selector:** `:root .msc-shows-core-wrap` (in practice the **body** when that class is present).

| Variable | Source (option key) |
|----------|---------------------|
| `--msc-shows-accent` | `global_accent_color` (hex) |
| `--msc-hover-scale` | `hover_zoom_intensity` |
| `--msc-hover-speed` | `hover_transition_speed` + literal `s` suffix |

Body class `msc-shows-core-wrap` is added in `msc_shows_core_body_classes` (`body_class` filter) when frontend assets load.

**Note:** `frontend-logic.php` may build separate layout “ghost-kill” CSS from the same option array — that is **not** the hover/accent inline block above.

---

## 6. DiviGear “Auto category sync” (what it actually does)

**File:** `includes/divigear-auto-category-sync.php`  
**Main function:** `msc_shows_core_divigear_merge_show_category_terms`  
**Hook:** `add_filter( 'et_pb_module_shortcode_attributes', …, 4, 5 )`

- Does **not** run on plugin activation.
- Does **not** assign Show posts to categories on `save_post` or from metadata.
- Runs when Divi builds **Filterable CPT** module attributes.

**Conditions**

- Option `auto_category_sync` enabled (`msc_shows_core_settings`).
- Module is `dgcm_cptfilter`.
- `post_type` is `shows`.
- `post_display` is `by_tax`.
- Taxonomy for shows is `show_category` (via `tax_for_shows` / `show_category` checks in code).

**Behavior:** Loads all `show_category` term IDs via `msc_shows_core_get_show_category_term_ids_for_auto_sync()` (`get_terms`, `hide_empty => false`), merges with any already saved IDs in the module (drops invalid), writes a comma-separated ID list into `shows_terms_show_category` and aliased keys, sets `all_items` / `show_all` to `on` for “All”-style UI.

**Summary:** Auto-Sync = **sync the filter module’s term ID list** with the live taxonomy — **not** auto-assign posts to terms.

---

## 7. Admin styles: Jedi Green vs MSC Red and `<body>`

**Enqueue:** `includes/admin-dashboard.php`, `msc_shows_core_admin_assets()`  
- Handle: `msc-shows-core-admin` → **`assets/css/admin-style.css`** (single file for both themes; no separate red/green file).

**Tokens in CSS** (`admin-style.css`):

- `.msc-shows-core-admin` — default tokens; `--msc-accent` MSC red (`#e02b20`), `--msc-jedi-green` `#28a745`.
- `.msc-shows-core-admin--accent-jedi-green` — sets `--msc-accent: #28a745`.

**Accent selection:** `msc_shows_core_get_engine_accent_color()` reads `msc_shows_core_settings['msc_shows_accent_color']` → `msc_red` or `jedi_green`.

**`<body>`:** `admin_body_class` filter `msc_shows_core_admin_body_class_engine_accent` (priority **16**) appends `msc-engine-accent-jedi-green` or `msc-engine-accent-msc-red` on **MSC settings screens** only.

**Main wrap:** `msc_shows_core_render_settings_page()` outputs:

```html
<div class="wrap msc-shows-core-admin<?php echo esc_attr( $accent_mod . $dark_mod ); ?>">
```

`$accent_mod` is ` msc-shows-core-admin--accent-jedi-green` when accent is Jedi Green, else empty (default red via base `.msc-shows-core-admin`).

**Dark mode on `<body>`:** separate class `msc-engine-saas-dark` from `msc_shows_core_admin_body_class_engine_theme` when `msc_engine_theme_mode === 'saas_dark'`.

**Summary:** One admin CSS file; accent is **which classes** land on `body` and `.wrap.msc-shows-core-admin`, toggled by `msc_shows_accent_color` (and in v4.7.x work, updatable via AJAX in `msc-engine-prefs.js`).

---

## 8. v4.7.x discussion threads (may or may not match this repo)

These were described in project chat; **confirm in code** before relying on them:

- **“Static Pro” pass:** reduced motion on some admin/grid rules; follow-up re-enabled Layout Tuning sliders for hover scale/speed via CSS variables; play-button scale on grid/tutorial affordances — referenced as **v4.7.1 (Dynamic)** direction.
- **Plugin branding/version:** header strings bumped (e.g. v4.7.0 Stable, v4.7.1 Dynamic in discussion).
- **Light/dark “Logic Sync” (v4.7.2 in discussion):** Environment behavior so `msc-engine-saas-dark` and accent classes apply to `body` first, then `.wrap.msc-shows-core-admin`; avoid checkbox sync on tabs without Environment inputs; `input` + `change` on toggles; `--msc-accent` on `body` for Engine screens; AJAX persists `studio_light` | `saas_dark` and accent keys in `msc_shows_core_settings`.

---

## 9. Project rules / UX targets (Nova)

- **16:9** thumbnails on show grids; **red-pill** filter styling where used; **`#000000`** page background where design calls for it; accessible contrast; `loading="lazy"` where appropriate.
- **Security:** `defined( 'ABSPATH' ) || exit;` on plugin PHP; nonces for AJAX/admin actions.

---

## 10. How to brief an assistant (short)

> WordPress + Divi 4 + ACF + **msc-shows-core**; LocalWP; NovaMira MSC Media Engine; DiviGear for CPT grids.
> **Mandatory:** Follow the Hybrid Architecture in **@.cursorrules**, the logic in **@.cursor/skills/Nova/SKILL.md**, and the styling in **@.cursor/skills/NovaMira-Design/SKILL.md**.

Attach or reference **this file** plus `.cursorrules` / Nova `SKILL.md` for full conventions. For **glass / bento / SaaS-dark** dashboard aesthetics, also **`.cursor/skills/NovaMira-Design/SKILL.md`**.

> Follow the Hybrid Architecture in @.cursorrules, the logic in @.cursor/skills/Nova/SKILL.md, and the styling in @.cursor/skills/NovaMira-Design/SKILL.md.