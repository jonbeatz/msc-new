# FixNodeSite.md — Source of Truth
## Next.js 16 (Turbopack) → WordPress Theme Integration

**Stack:** Next.js 16.2.0 · React 19 · Turbopack · App Router · `output: 'export'` · WordPress 6.x · PHP 8.2 · LocalWP  
**Theme:** `wp-content/themes/MSC_Clean-Pro`  
**Source:** `_design_references/MSC-New/`  
**Build command:** `npm run build:wp-theme` (from the source directory)

---

## Table of Contents

1. [How It Works — Big Picture](#1-how-it-works--big-picture)
2. [Hydration Killer #1 — The Script Path Match (The Big One)](#2-hydration-killer-1--the-script-path-match-the-big-one)
3. [Hydration Killer #2 — Structural Integrity (Nothing Before the Doctype)](#3-hydration-killer-2--structural-integrity-nothing-before-the-doctype)
4. [Hydration Killer #3 — The Underscore Folder Block](#4-hydration-killer-3--the-underscore-folder-block)
5. [Hydration Killer #4 — Module Type Stripping](#5-hydration-killer-4--module-type-stripping)
6. [Static Export Config — `next.config.mjs`](#6-static-export-config--nextconfigmjs)
7. [The Build Pipeline — `build-wp-theme.mjs`](#7-the-build-pipeline--build-wp-themejs)
8. [PHP Template Rules — `template-msc-home.php`](#8-php-template-rules--template-msc-homephp)
9. [Quick Recovery Checklist](#9-quick-recovery-checklist)
10. [Spaceship Deployment Guide](#10-spaceship-deployment-guide)
11. [Diagnostic Toolkit](#11-diagnostic-toolkit)

> [!IMPORTANT]
> **Environment Setup:** If `npm` commands fail with a script execution error in PowerShell, run the following command once to unlock your tools:
> `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## 1. How It Works — Big Picture

```
_design_references/MSC-New/   ← Next.js source (App Router, Turbopack)
        │
        │  npm run build:wp-theme
        │  (runs: scripts/build-wp-theme.mjs)
        ▼
wp-content/themes/MSC_Clean-Pro/
    ├── assets/
    │   ├── next-assets/        ← was _next/, renamed to avoid server blocks
    │   │   └── static/chunks/  ← all Turbopack JS bundles
    │   ├── images/             ← merged from public/images/
    │   └── *.css               ← global stylesheets
    ├── partials/
    │   ├── index.html          ← full SSR HTML with __MSC_THEME_URI__ placeholders
    │   └── chunk-scripts.html  ← ordered <script> tags (turbopack first, _R_ last)
    ├── template-msc-home.php   ← serves the page; injects scripts + WP data
    ├── front-page.php          ← includes template-msc-home.php
    └── functions.php           ← WP hooks, customizer, fallback chunk markup
```

WordPress serves `template-msc-home.php` as the front page. That PHP file:
1. Reads `partials/index.html` (the SSR HTML)
2. Injects WordPress config data into `<head>`
3. Injects chunk `<script>` tags before `</body>` using **root-relative** paths
4. Echoes the assembled HTML — **nothing else**

React then boots on the client, reads the inline RSC flight data (`self.__next_f`), and hydrates the pre-rendered DOM.

---

## 2. Hydration Killer #1 — The Script Path Match (The Big One)

> **Symptom:** Console is completely silent. Scripts load (200 OK). `TURBOPACK: object` but `window.next: undefined`. No React. No errors.

### Root Cause

The Turbopack runtime tracks chunk-loading progress using a JavaScript `Map`. It stores Promise entries **keyed by root-relative paths**, built by its internal `q()` function:

```js
// Inside turbopack-*.js (baked at build time)
const t = "/wp-content/themes/MSC_Clean-Pro/assets/next-assets/";

function q(chunkRelPath) {
  return `${t}${chunkRelPath}`;  // → "/wp-content/.../next-assets/static/chunks/X.js"
}
```

When each chunk script executes, it resolves its own Promise via:

```js
D(currentScript.getAttribute("src")).resolve();
//   ↑ reads the raw src ATTRIBUTE value, not the DOM .src property
```

The runtime waits for ALL `otherChunks` before running module 94553 (`appBootstrap` → `hydrateRoot`):

```js
async registerChunk(scriptEl, { otherChunks, runtimeModuleIds }) {
  D(scriptEl.src).resolve();                          // mark self as loaded
  await Promise.all(otherChunks.map(path => T(path))); // ← HANGS if keys don't match
  runModule(94553);                                    // appBootstrap → hydrateRoot
}
```

### The Mismatch

| Promise **created** with | Promise **resolved** with | Match? |
|---|---|---|
| `q("static/chunks/X.js")` → `/wp-content/.../next-assets/static/chunks/X.js` | `getAttribute("src")` → `https://mscclean.local/wp-content/.../X.js` | ❌ Never |
| `q("static/chunks/X.js")` → `/wp-content/.../next-assets/static/chunks/X.js` | `getAttribute("src")` → `/wp-content/.../next-assets/static/chunks/X.js` | ✅ Match |

When `src` is an **absolute URL**, `getAttribute("src")` returns the full `https://host/path` string. The Map key is root-relative. They never match. The `await` hangs forever. `appBootstrap` is never called. React never hydrates. No error is thrown — the runtime silently catches the internal timeout.

### The Fix

In `template-msc-home.php`, chunk scripts use the **root-relative theme path**, not the full URI:

```php
// ✅ CORRECT — root-relative, matches Turbopack's q() output
$theme_root_path = '/wp-content/themes/MSC_Clean-Pro';
$chunk_scripts = str_replace('__MSC_THEME_URI__', $theme_root_path, $raw_chunks);

// ❌ WRONG — absolute URL, keys never match in Turbopack's Map
// $chunk_scripts = str_replace('__MSC_THEME_URI__', get_template_directory_uri(), $raw_chunks);
```

> **Note:** The main HTML (`partials/index.html`) still uses the absolute URI for fonts, images, CSS preloads, and RSC flight data — those do NOT go through Turbopack's chunk-tracking Map.

---

## 3. Hydration Killer #2 — Structural Integrity (Nothing Before the Doctype)

> **Symptom:** React never hydrates even though scripts execute. No errors shown.

### Root Cause

React's App Router calls `hydrateRoot(document, rscPayload)` — it reconciles the **entire document** from `<html>` downward. If the server-rendered `<body>` expected:

```html
<body class="font-sans antialiased">
  <div id="__next">…content…</div>
</body>
```

But the actual DOM has extra nodes inserted before `<div id="__next">`:

```html
<body class="font-sans antialiased">
  <div style="background:purple">PHP DEBUG BAR</div>  ← unexpected!
  <script>window.onerror = …</script>                 ← unexpected!
  <div id="__next">…content…</div>
</body>
```

...React encounters a structural mismatch and silently aborts hydration. The mismatch comes from PHP echoing raw HTML **before** `<!DOCTYPE html>`. The browser uses HTML5 error recovery to place those orphan nodes inside `<body>`, creating DOM nodes React never expected.

### The Fix

**Rule:** `echo $html` is the **only** output statement in `template-msc-home.php`. Everything else — debug bars, error catchers, config scripts, `__NEXT_DATA__`, chunk scripts — is injected into `$html` via `substr_replace` before the single echo.

```php
// ✅ CORRECT — inject purple bar INSIDE <body> via substr_replace
if (preg_match('/<body\b[^>]*>/i', $html, $m, PREG_OFFSET_CAPTURE)) {
    $after_body = $m[0][1] + strlen($m[0][0]);
    $html = substr_replace($html, $purple_bar, $after_body, 0);
}

// ❌ WRONG — outputs before <!DOCTYPE html>, browser puts it in <body>
echo '<div style="background:purple">PHP IS LIVE</div>';
echo $html;
```

```php
// ✅ CORRECT — inject error catchers into <head>
if (preg_match('/<head\b[^>]*>/i', $html, $m, PREG_OFFSET_CAPTURE)) {
    $after_head = $m[0][1] + strlen($m[0][0]);
    $html = substr_replace($html, $error_script, $after_head, 0);
}

// ❌ WRONG — outputs before <!DOCTYPE html>
echo '<script>window.onerror = …</script>';
echo $html;
```

---

## 4. Hydration Killer #3 — The Underscore Folder Block

> **Symptom:** All chunk JS files return 404. Network tab shows the correct URLs but nothing loads.

### Root Cause

Many Windows servers, IIS configurations, and some LocalWP setups block HTTP access to directories whose names begin with an underscore (`_`). Next.js outputs all static assets into `_next/static/`. The folder `assets/_next/` is blocked at the server level — requests never reach the files.

### The Fix

`build-wp-theme.mjs` renames the folder on disk and rewrites all internal bundle references:

**Step 1 — Rename the folder:**
```js
// In build-wp-theme.mjs
fs.renameSync(
  path.join(THEME_ASSETS, '_next'),        // was: assets/_next/
  path.join(THEME_ASSETS, 'next-assets')   // now: assets/next-assets/
);
```

**Step 2 — Rewrite all internal JS references (two passes):**
```js
function rewriteBundleInternals(dir, themeSlug) {
  // Pass 1: Long form (set by assetPrefix during build)
  //   /wp-content/themes/MSC_Clean-Pro/assets/_next/
  //   → /wp-content/themes/MSC_Clean-Pro/assets/next-assets/
  const longOld = `/wp-content/themes/${themeSlug}/assets/_next/`;
  const longNew = `/wp-content/themes/${themeSlug}/assets/next-assets/`;

  // Pass 2: Short form (Turbopack fallback paths, service workers)
  //   /_next/  → /wp-content/themes/MSC_Clean-Pro/assets/next-assets/
  const shortOld = `/_next/`;
  const shortNew = `/wp-content/themes/${themeSlug}/assets/next-assets/`;

  // Long form first — prevents double-replacement
  const out = s.split(longOld).join(longNew).split(shortOld).join(shortNew);
}
```

**Step 3 — Fix RSC flight data split paths:**

Next.js sometimes splits asset paths across two `self.__next_f.push()` calls. The whole-string replacement misses these fragments, so `buildPartialHtml` also applies a bare-segment sweep:

```js
out = out.replaceAll('_next/static/', 'next-assets/static/');
```

---

## 5. Hydration Killer #4 — Module Type Stripping

> **Symptom:** `JS Error: chunk path empty but not in a worker` — thrown for every chunk.

### Root Cause

Turbopack chunks call `TURBOPACK.push()` and pass `document.currentScript` as the first argument so the runtime can identify which chunk is loading:

```js
// In every chunk file
(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  "object" == typeof document ? document.currentScript : void 0,
  chunkId,
  ...moduleDefs
]);
```

`document.currentScript` returns the currently-executing `<script>` element — **but only for classic scripts**. For `<script type="module">` scripts, `document.currentScript` is **always `null`**.

The Turbopack runtime's `F()` handler then tries to extract the chunk's src from that captured value:

```js
function F(t) {
  let n = (function(e) {
    if ("string" == typeof e) return e;
    if (e) return { src: e.getAttribute("src") };   // ← works for classic scripts
    // e is null here for type="module" scripts:
    if ("u" > typeof TURBOPACK_NEXT_CHUNK_URLS) return { src: TURBOPACK_NEXT_CHUNK_URLS.pop() };
    throw Error("chunk path empty but not in a worker");  // ← boom
  })(t[0]);
}
```

Every `type="module"` chunk throws this error internally. The runtime swallows them, silently failing to register any modules.

### The Fix

Strip `type="module"` and replace with `type="text/javascript"`. Turbopack bundles are IIFE-wrapped (like webpack), not bare ES modules, so they execute correctly as classic scripts. `type="text/javascript"` also forces execution if the server sends an incorrect `text/plain` MIME type (a known LocalWP quirk on Windows).

```php
// In template-msc-home.php
$chunk_scripts = str_replace(
    '<script src=',
    '<script type="text/javascript" src=',
    $chunk_scripts
);
```

```js
// In buildChunkScriptsPartial (build-wp-theme.mjs)
// Strip async — scripts execute synchronously in body order
tag = tag.replace(/\s+async(?:="[^"]*"|='[^']*'|(?=[>\s]))/gi, '');
```

---

## 6. Static Export Config — `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required: generate static HTML/CSS/JS files instead of a Node server
  output: 'export',

  // Required: ensures all generated URLs have a trailing slash (WordPress-friendly)
  trailingSlash: true,

  // Critical: tells Next.js where assets will be served from in the browser.
  // Set by build-wp-theme.mjs via the MSC_WP_ASSET_PREFIX env variable.
  // This bakes the correct path into Turbopack's runtime bundle.
  // During `next dev` (no env var set), defaults to '' for localhost.
  assetPrefix: process.env.MSC_WP_ASSET_PREFIX || '',

  // Required: Next.js Image Optimization requires a server. Static export has none.
  images: {
    unoptimized: true,
  },

  // Optional: skip type errors during WP builds (types are checked separately)
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
```

**Why `assetPrefix` matters so deeply:**

`assetPrefix` is baked into the compiled Turbopack runtime as the variable `t`:

```js
// Inside turbopack-*.js after build
const t = "/wp-content/themes/MSC_Clean-Pro/assets/";
```

This is what `q(relPath)` uses to build chunk URLs. It must exactly match where the assets are served. The build script sets it via environment variable:

```js
// build-wp-theme.mjs
const buildEnv = {
  ...process.env,
  MSC_WP_ASSET_PREFIX: '/wp-content/themes/MSC_Clean-Pro/assets',
};
```

**`basePath` note:** This project does NOT use `basePath` because WordPress serves the front page at `/` (root). Do not add `basePath` unless the WordPress site is in a subdirectory.

---

## 7. The Build Pipeline — `build-wp-theme.mjs`

Run from `_design_references/MSC-New/`:

```bash
npm run build:wp-theme
```

### What It Does (7 Steps)

```
Step 0 — Clean        rm -rf .next/ out/
Step 1 — Build        node node_modules/next/dist/bin/next build
                      (with MSC_WP_ASSET_PREFIX env var set)
Step 2 — Copy         out/ → wp-content/themes/MSC_Clean-Pro/assets/
Step 3 — Rename       assets/_next → assets/next-assets
Step 4 — Rewrite      Patch all .js files: _next → next-assets (2 passes)
Step 5 — partial HTML Write partials/index.html (__MSC_THEME_URI__ placeholders, no chunk <script> tags)
Step 6 — chunk list   Write partials/chunk-scripts.html (ordered, turbopack first, _R_ last)
Step 7 — Images       Merge public/images/ → assets/images/; strip build junk
```

### Key Environment Variables

| Variable | Set by | Value | Purpose |
|---|---|---|---|
| `MSC_WP_ASSET_PREFIX` | `build-wp-theme.mjs` | `/wp-content/themes/MSC_Clean-Pro/assets` | Baked into Turbopack runtime as `t` |
| `NEXT_PUBLIC_WP_THEME_EXPORT` | `build-wp-theme.mjs` | `1` | Disables Vercel Analytics in WP context |
| `MSC_WP_CLEAN` | You (optional) | `0` | Set to skip the clean step (faster rebuilds) |

### Skip the Clean Step (Faster Iteration)

```bash
# Full clean build (~5 seconds)
npm run build:wp-theme

# Skip .next/ and out/ cleanup — much faster, safe if only PHP/CSS changed
MSC_WP_CLEAN=0 npm run build:wp-theme
```

### Chunk Script Order Rules

The build script enforces a strict loading order that matches Turbopack's internal dependency graph:

```
1. turbopack-*.js    ← MUST be first. Sets up TURBOPACK registry before any chunk pushes.
2. 0pqt~*.js        ← Framework chunks (React, React DOM)
3. 0vkgb7xyv-*.js   ← App Router runtime (contains hydrateRoot, createFromReadableStream)
4. ...other chunks...
5. 03~*.js          ← noModule fallback (skipped by modern browsers)
6. 0y~q2ur8.*.js    ← Entry point (id="_R_"). MUST be last. Triggers appBootstrap → hydrateRoot.
```

---

## 8. PHP Template Rules — `template-msc-home.php`

### The Three Immutable Rules

**Rule 1: Single echo.** `echo $html` is the only output. No HTML before or after it.

```php
// ✅
$html = file_get_contents($partial_index);
// ... inject everything via substr_replace ...
echo $html;

// ❌ — breaks hydration
echo '<div>debug</div>';
echo $html;
```

**Rule 2: Root-relative chunk src.** Use `/wp-content/themes/MSC_Clean-Pro` (no `https://host`).

```php
// ✅
$theme_root_path = '/wp-content/themes/MSC_Clean-Pro';
$chunk_scripts = str_replace('__MSC_THEME_URI__', $theme_root_path, $raw_chunks);

// ❌ — absolute URL breaks Turbopack's Promise Map
$chunk_scripts = str_replace('__MSC_THEME_URI__', get_template_directory_uri(), $raw_chunks);
```

**Rule 3: No navigation calls on boot.** Never call `window.next.router.replace()` or any App Router navigation API immediately after scripts load. App Router throws `"Router action dispatched before initialization"` if you dispatch before hydration completes.

```js
// ❌ — triggers immediately, before hydration, crashes the router
window.next && window.next.router && window.next.router.replace(pathname, pathname, { shallow: true });
```

### Injection Points

```php
// HEAD injections (right after <head>)
$html = substr_replace($html, $config_scripts . $guard_css . $next_data, $after_head, 0);

// BODY end (right before </body>)
$body_close = stripos($html, '</body>');
$html = substr_replace($html, $chunk_scripts, $body_close, 0);

// ← only then:
echo $html;
```

### `__NEXT_DATA__` Format

App Router does not deeply rely on `__NEXT_DATA__` (that is a Pages Router construct), but Next.js's client boot checks for it. Keep it minimal:

```php
$next_data = [
    'props'        => ['pageProps' => []],
    'page'         => '/',
    'query'        => [],
    'buildId'      => 'development',
    'nextExport'   => true,
    'autoExport'   => true,
    'isFallback'   => false,
    'scriptLoader' => [],
    'assetPrefix'  => home_url() . '/wp-content/themes/MSC_Clean-Pro/assets/next-assets',
];
echo '<script id="__NEXT_DATA__" type="application/json">' . wp_json_encode($next_data) . '</script>';
```

---

## 9. Quick Recovery Checklist

Use this when the site stops working after a theme or Next.js change.

### Step 1 — Navigate to the source directory

```bash
cd _design_references/MSC-New
```

### Step 2 — Install dependencies (first time or after package.json changes)

```bash
npm install
```

### Step 3 — Run the build

```bash
npm run build:wp-theme
```

Expected terminal output (healthy build):

```
[build-wp-theme] Clean: removed .next and out/
[build-wp-theme] Running next build with MSC_WP_ASSET_PREFIX="..."
✓ Compiled successfully in ~1100ms
✓ Generating static pages (3/3)
[build-wp-theme] Renamed assets/_next → assets/next-assets
[build-wp-theme]   Patched: turbopack-*.js (1 occurrence(s))
[build-wp-theme] Partial HTML: zero "_next/" segments remain.
[build-wp-theme] Moved turbopack runtime to position 0 (was N).
[build-wp-theme] Extracted 9 ordered chunk script tags (turbopack-first, no async).
[build-wp-theme] Done.
```

### Step 4 — Hard refresh in browser

```
Ctrl + F5   (Windows/Linux)
Cmd + Shift + R  (Mac)
```

### Step 5 — Verify in DevTools Console

Open DevTools → Console. You should see the `mscCleanProData` log from `MscRuntimeProbe`. You should **not** see any `JS Error:` or `Unhandled Rejection:` alerts.

### Triage Table

| Symptom | Likely Cause | Fix |
|---|---|---|
| All chunks 404 | `assets/_next` folder blocked or not renamed | Re-run build; check Step 3 log |
| `chunk path empty but not in a worker` | `type="module"` on chunk scripts | Check `template-msc-home.php` str_replace for `type="text/javascript"` |
| Console dead silent, TURBOPACK is object | Absolute URL src on chunks (Promise key mismatch) | Verify `$theme_root_path` not `$theme_uri` in chunk replacement |
| `Router action dispatched before initialization` | `window.next.router` called on page load | Remove any early navigation calls |
| React silent, no errors | Something output before `<!DOCTYPE html>` | Audit `template-msc-home.php` — ensure single `echo $html` |
| Build exits with status null | Node/npm spawn issue | Build script uses `node nextBin` directly, not `npm run build` |

---

## 10. Spaceship Deployment Guide

Spaceship (and most shared hosts) serve files from a `public_html/` or `public/` directory. The WordPress installation lives there. The Next.js source stays local — only the compiled theme goes to the server.

### What to Deploy

Only the WordPress theme directory needs to be uploaded:

```
wp-content/themes/MSC_Clean-Pro/
```

### Creating the Zip (Contents, Not Folder)

> **Critical:** Zip the **contents** of `MSC_Clean-Pro/`, not the folder itself. If you zip the folder, it uploads as `MSC_Clean-Pro/MSC_Clean-Pro/` and WordPress cannot find the theme.

**On Windows (PowerShell):**

```powershell
# Navigate INTO the theme directory
cd "F:\Websitez\MyStudioChannel\Local_WP\MSC_Clean\app\public\wp-content\themes\MSC_Clean-Pro"

# Zip the contents (everything inside) — NOT the folder
Compress-Archive -Path ".\*" -DestinationPath "..\MSC_Clean-Pro-deploy.zip" -Force
```

**On Mac/Linux:**

```bash
cd /path/to/wp-content/themes/MSC_Clean-Pro

# The . means "zip everything in the current directory"
zip -r ../MSC_Clean-Pro-deploy.zip .
```

### Upload via Spaceship File Manager or FTP

1. Upload `MSC_Clean-Pro-deploy.zip` to `public_html/wp-content/themes/`
2. Extract it there — it should create `public_html/wp-content/themes/MSC_Clean-Pro/`
3. In WordPress Admin → Appearance → Themes → activate **MSC Clean Pro**

### What NOT to Upload

```
_design_references/MSC-New/         ← source code, stays local
_design_references/MSC-New/out/     ← temporary build output, cleaned each build
_design_references/MSC-New/.next/   ← Next.js cache, cleaned each build
_design_references/MSC-New/node_modules/  ← never deploy node_modules
```

### Re-Deploy After a Content Change

```bash
# 1. Make changes in _design_references/MSC-New/
# 2. Build
cd _design_references/MSC-New
npm run build:wp-theme

# 3. Re-zip the theme
cd ../../wp-content/themes/MSC_Clean-Pro
# (run zip command above)

# 4. Upload and extract on Spaceship, overwriting old files
```

---

## 11. Diagnostic Toolkit

Use these when debugging a broken build. Add temporarily, remove before deploying.

### Probe 1 — Is PHP Running?

Add to `template-msc-home.php` (inside `<body>` via `substr_replace`):

```html
<div style="position:fixed;top:0;left:0;right:0;background:#6a1b9a;color:#fff;
            padding:10px;text-align:center;z-index:9999999;font-size:18px;">
  PHP LIVE — <?php echo date('H:i:s'); ?>
</div>
```

### Probe 2 — Are Scripts Reaching the Body?

```html
<script type="text/javascript">console.log('📍 Body reached');</script>
```

### Probe 3 — Did Turbopack Initialize?

```html
<script type="text/javascript">
  console.log(
    'POST-CHUNK PROBE',
    '| TURBOPACK:', typeof TURBOPACK,
    '| window.next:', typeof window.next,
    '| __next_f:', self.__next_f ? self.__next_f.length + ' items' : 'MISSING'
  );
</script>
```

Expected healthy output: `TURBOPACK: object | window.next: object | __next_f: 6 items`

- `TURBOPACK: undefined` → turbopack chunk not loading
- `window.next: undefined` → module 94553 (`appBootstrap`) never ran → Promise key mismatch (check chunk src paths)
- `__next_f: MISSING` → RSC flight data scripts were stripped

### Probe 4 — Did React Hydrate?

Add to `layout.tsx` temporarily:

```tsx
// components/react-alive-probe.tsx
"use client"
import { useEffect } from "react"
export function ReactAliveProbe() {
  useEffect(() => { alert("REACT IS ALIVE") }, [])
  return null
}
```

```tsx
// app/layout.tsx
import { ReactAliveProbe } from '@/components/react-alive-probe'
// Inside <div id="__next">:
<ReactAliveProbe />
```

Remove after confirming hydration.

### Probe 5 — Catch All JS Errors

Add to `<head>` via `substr_replace`:

```html
<script>
window.onerror = function(m, u, l, c, e) {
  alert('JS Error: ' + m + '\nat ' + u + ':' + l);
  return true;
};
window.addEventListener('unhandledrejection', function(ev) {
  var r = ev.reason;
  alert('Unhandled Rejection: ' + (r && r.message ? r.message : String(r)));
});
</script>
```

---

## Appendix — Key File Locations

| File | Purpose |
|---|---|
| `_design_references/MSC-New/next.config.mjs` | Next.js config: `output: 'export'`, `assetPrefix`, `images.unoptimized` |
| `_design_references/MSC-New/package.json` | Dependencies; `build:wp-theme` script |
| `_design_references/MSC-New/scripts/build-wp-theme.mjs` | Full build pipeline (7 steps) |
| `_design_references/MSC-New/app/layout.tsx` | Root layout: `<div id="__next">`, `suppressHydrationWarning` |
| `_design_references/MSC-New/components/msc-runtime-probe.tsx` | Client-side hydration diagnostics |
| `wp-content/themes/MSC_Clean-Pro/template-msc-home.php` | **Main template** — the single file that must obey all 3 rules |
| `wp-content/themes/MSC_Clean-Pro/functions.php` | WP hooks, fallback chunk markup, customizer |
| `wp-content/themes/MSC_Clean-Pro/partials/index.html` | SSR HTML (generated by build) |
| `wp-content/themes/MSC_Clean-Pro/partials/chunk-scripts.html` | Ordered chunk `<script>` tags (generated by build) |
| `wp-content/themes/MSC_Clean-Pro/assets/next-assets/` | All Turbopack JS/CSS bundles (generated by build) |

---

*Last updated: April 2026 — after successful React 19 + Next.js 16 + Turbopack hydration in WordPress.*
