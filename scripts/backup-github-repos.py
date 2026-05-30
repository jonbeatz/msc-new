#!/usr/bin/env python3
"""Clone + bundle backup for all jonbeatz GitHub repos."""
from __future__ import annotations

import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from datetime import datetime
from pathlib import Path

from github_env import apply_github_token_to_process, get_github_token

BASE = Path(r"D:\Cursor_Projectz\MSC_Clean_v2\msc-new\.cursor\GitHub-Repo-BackUps")
USER = "jonbeatz"


def run(cmd: list[str], cwd: Path | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=cwd,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
        env=os.environ.copy(),
    )


def fmt_bytes(n: int | None) -> str:
    if n is None:
        return "-"
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.2f} {unit}" if unit != "B" else f"{n} B"
        n /= 1024
    return f"{n:.2f} GB"


def dir_size(path: Path) -> int:
    total = 0
    for p in path.rglob("*"):
        if p.is_file():
            try:
                total += p.stat().st_size
            except OSError:
                pass
    return total


def fetch_repos_via_api(token: str) -> list[dict]:
    repos: list[dict] = []
    page = 1
    while page <= 10:
        req = urllib.request.Request(
            f"https://api.github.com/users/{USER}/repos"
            f"?per_page=100&page={page}&type=all&sort=updated",
            headers={
                "Authorization": f"Bearer {token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
                "User-Agent": "msc-new-github-backup",
            },
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            batch = json.loads(resp.read().decode("utf-8"))
        if not batch:
            break
        for r in batch:
            repos.append(
                {
                    "name": r["name"],
                    "isArchived": bool(r.get("archived")),
                    "isEmpty": r.get("size", 1) == 0 and not r.get("default_branch"),
                    "url": r.get("html_url"),
                }
            )
        if len(batch) < 100:
            break
        page += 1
    return repos


def fetch_repos() -> tuple[list[dict], str]:
    token = apply_github_token_to_process()
    if token:
        try:
            return fetch_repos_via_api(token), "GitHub API (.env token)"
        except urllib.error.HTTPError as exc:
            print(f"GitHub API failed ({exc.code}); falling back to gh CLI...", file=sys.stderr)

    proc = run(["gh", "repo", "list", USER, "--limit", "200", "--json", "name,isArchived,isEmpty,url"])
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip() or "gh repo list failed")
    return json.loads(proc.stdout), "gh CLI"


def main() -> int:
    BASE.mkdir(parents=True, exist_ok=True)
    apply_github_token_to_process()

    try:
        all_repos, repo_source = fetch_repos()
    except RuntimeError as exc:
        print(str(exc), file=sys.stderr)
        return 1

    skipped = [r for r in all_repos if r.get("isArchived") or r.get("isEmpty")]
    repos = sorted(
        [r for r in all_repos if not r.get("isArchived") and not r.get("isEmpty")],
        key=lambda r: r["name"].lower(),
    )

    print(f"Repo list source: {repo_source}")
    print(f"Backing up {len(repos)} repositories (skipping {len(skipped)} archived/empty)...")

    report: list[dict] = []

    for repo in repos:
        name = repo["name"]
        dest = BASE / name
        bundle = BASE / f"{name}.bundle"
        entry: dict = {
            "name": name,
            "clone": "pending",
            "fetch": "skipped",
            "bundle": "pending",
            "clone_size": None,
            "bundle_size": None,
            "error": None,
        }
        print(f"[{name}] starting...")

        try:
            if dest.exists():
                print(f"[{name}] existing folder — fetch --all")
                entry["clone"] = "existing"
                fetch = run(["git", "fetch", "--all", "--prune", "--tags"], cwd=dest)
                if fetch.returncode != 0:
                    raise RuntimeError(fetch.stderr.strip() or fetch.stdout.strip() or "git fetch failed")
                entry["fetch"] = "ok"
            else:
                print(f"[{name}] cloning...")
                clone = run(
                    ["git", "clone", f"https://github.com/{USER}/{name}.git", str(dest)],
                )
                if clone.returncode != 0:
                    raise RuntimeError(clone.stderr.strip() or clone.stdout.strip() or "git clone failed")
                fetch = run(["git", "fetch", "--all", "--prune", "--tags"], cwd=dest)
                if fetch.returncode != 0:
                    raise RuntimeError(fetch.stderr.strip() or fetch.stdout.strip() or "git fetch failed")
                entry["clone"] = "ok"
                entry["fetch"] = "ok"

            print(f"[{name}] bundle --all")
            if bundle.exists():
                bundle.unlink()
            bundle_proc = run(["git", "bundle", "create", str(bundle), "--all"], cwd=dest)
            if bundle_proc.returncode != 0:
                raise RuntimeError(
                    bundle_proc.stderr.strip() or bundle_proc.stdout.strip() or "git bundle failed"
                )
            entry["bundle"] = "ok"
            entry["clone_size"] = dir_size(dest)
            entry["bundle_size"] = bundle.stat().st_size
            print(f"[{name}] done ({fmt_bytes(entry['clone_size'])}, bundle {fmt_bytes(entry['bundle_size'])})")
        except Exception as exc:  # noqa: BLE001 — collect per-repo errors for report
            entry["error"] = str(exc)
            if entry["clone"] == "pending":
                entry["clone"] = "failed"
            if entry["bundle"] == "pending":
                entry["bundle"] = "failed"
            print(f"[{name}] ERROR: {exc}", file=sys.stderr)

        report.append(entry)

    report_path = BASE / "BACKUP-REPORT.md"
    lines = [
        "# GitHub Repo Backup Report",
        "",
        "| Field | Value |",
        "| --- | --- |",
        f"| Account | **{USER}** |",
        f"| Date | {datetime.now():%Y-%m-%d %H:%M:%S} |",
        f"| Destination | `{BASE}` |",
        f"| Repos backed up | **{len(report)}** |",
        f"| Repo list source | {repo_source} |",
        "",
        "## Skipped",
        "",
    ]
    for s in skipped:
        reason = "archived" if s.get("isArchived") else "empty"
        lines.append(f"- `{s['name']}` ({reason})")
    lines.extend(["", "## Results", "", "| Repo | Clone | Fetch | Bundle | Working copy | Bundle file | Notes |", "| --- | --- | --- | --- | --- | --- | --- |"])
    for r in report:
        notes = r["error"] or "-"
        lines.append(
            f"| `{r['name']}` | {r['clone']} | {r['fetch']} | {r['bundle']} | "
            f"{fmt_bytes(r['clone_size'])} | {fmt_bytes(r['bundle_size'])} | {notes} |"
        )
    lines.extend(
        [
            "",
            "## Restore from bundle",
            "",
            "```bash",
            "git clone path/to/REPO.bundle REPO-RESTORED",
            "cd REPO-RESTORED",
            "git fetch --all",
            "```",
        ]
    )
    report_path.write_text("\n".join(lines) + "\n", encoding="utf-8")

    errors = [r for r in report if r["error"]]
    print("\n=== BACKUP COMPLETE ===")
    print(f"Report: {report_path}")
    print(f"Total: {len(report)} | Errors: {len(errors)}")
    for r in report:
        status = "OK" if not r["error"] else "FAIL"
        print(
            f"  [{status}] {r['name']}: clone={r['clone']} bundle={r['bundle']} "
            f"({fmt_bytes(r['clone_size'])}, bundle {fmt_bytes(r['bundle_size'])})"
        )
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
