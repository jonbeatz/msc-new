#!/usr/bin/env python3
"""
Re-link Homepage heroSlides to canonical hero Media files (not Demos-* previews).

The four active hero slides should use:
  hero-studio.jpg, show-artwork.jpg, on-air-bg.jpg, creator-in-mind.jpg

These files already live under public/media/ and are registered in the media table.
Run from repo root (dev server can stay up):

  python scripts/fix-homepage-hero-slide-images.py

Dry run:

  python scripts/fix-homepage-hero-slide-images.py --dry-run
"""
from __future__ import annotations

import argparse
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DB = ROOT / "payload.sqlite"

# Match slides by _order (1-based) → target media filename
SLIDE_ORDER_TO_FILENAME: dict[int, str] = {
    1: "hero-studio.jpg",
    2: "show-artwork.jpg",
    3: "on-air-bg.jpg",
    4: "creator-in-mind.jpg",
}

# Optional: align Media alt text with hero-section.tsx defaults
FILENAME_TO_ALT: dict[str, str] = {
    "hero-studio.jpg": "Professional multi-screen TV studio wall",
    "show-artwork.jpg": "Netflix-style show cards",
    "on-air-bg.jpg": "Creator on air",
    "creator-in-mind.jpg": "Creator with professional cinema camera in studio",
}


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print planned updates without writing payload.sqlite",
    )
    args = parser.parse_args()

    if not DB.is_file():
        raise SystemExit(f"Database not found: {DB}")

    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    filename_to_id: dict[str, int] = {}
    for fn in SLIDE_ORDER_TO_FILENAME.values():
        cur.execute("SELECT id FROM media WHERE filename = ?", (fn,))
        row = cur.fetchone()
        if not row:
            raise SystemExit(
                f"Missing media row for {fn!r}. Run: npm run media:sync"
            )
        filename_to_id[fn] = int(row["id"])

    print("Target media IDs:")
    for order, fn in SLIDE_ORDER_TO_FILENAME.items():
        print(f"  slide {order} -> {fn} (media id {filename_to_id[fn]})")

    cur.execute(
        """
        SELECT id, _order, eyebrow, image_id
        FROM homepage_hero_slides
        WHERE _order IN (1, 2, 3, 4)
        ORDER BY _order
        """
    )
    slides = cur.fetchall()
    if len(slides) != 4:
        raise SystemExit(
            f"Expected 4 hero slides at _order 1–4, found {len(slides)}"
        )

    print("\nCurrent assignments:")
    updates: list[tuple[int, str, str, int, str]] = []
    for s in slides:
        order = int(s["_order"])
        target_fn = SLIDE_ORDER_TO_FILENAME[order]
        target_id = filename_to_id[target_fn]
        cur.execute(
            "SELECT filename FROM media WHERE id = ?", (s["image_id"],)
        )
        current = cur.fetchone()
        current_fn = current["filename"] if current else "?"
        print(
            f"  order={order} eyebrow={s['eyebrow']!r} "
            f"image_id={s['image_id']} ({current_fn})"
        )
        if int(s["image_id"]) != target_id:
            updates.append(
                (target_id, str(s["id"]), target_fn, order, current_fn)
            )

    if not updates:
        print("\nNothing to update — hero slides already point at canonical images.")
        conn.close()
        return

    print("\nPlanned updates:")
    for target_id, slide_id, target_fn, order, current_fn in updates:
        print(
            f"  slide order {order} ({slide_id}): {current_fn} -> {target_fn} (id {target_id})"
        )

    if args.dry_run:
        print("\n--dry-run: no changes written.")
        conn.close()
        return

    for target_id, slide_id, _target_fn, _order, _current_fn in updates:
        cur.execute(
            "UPDATE homepage_hero_slides SET image_id = ? WHERE id = ?",
            (target_id, slide_id),
        )

    for fn, alt in FILENAME_TO_ALT.items():
        mid = filename_to_id[fn]
        cur.execute("UPDATE media SET alt = ? WHERE id = ?", (alt, mid))

    conn.commit()
    conn.close()
    print("\nDone. Reload http://localhost:3000/ (hard refresh if cached).")


if __name__ == "__main__":
    main()
