#!/usr/bin/env python3
"""Verify GITHUB_PERSONAL_ACCESS_TOKEN from .env against GitHub REST API."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request

from github_env import TOKEN_KEYS, get_github_token

USER = "jonbeatz"


def api_get(path: str, token: str) -> dict | list:
    req = urllib.request.Request(
        f"https://api.github.com{path}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
            "User-Agent": "msc-new-github-test",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def main() -> int:
    token = get_github_token()
    if not token:
        print("FAIL: No GitHub token in env or .env / .env.local")
        print("Set GITHUB_PERSONAL_ACCESS_TOKEN in .env.local")
        return 1

    source = "process env" if any(os.environ.get(k) for k in TOKEN_KEYS) else "repo .env.local"

    try:
        user = api_get("/user", token)
        repos = api_get(f"/users/{USER}/repos?per_page=100&type=all&sort=updated", token)
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        print(f"FAIL: GitHub API HTTP {exc.code}")
        print(body[:500])
        return 1

    login = user.get("login", "?")
    repo_count = len(repos) if isinstance(repos, list) else 0
    active = [
        r["name"]
        for r in repos
        if isinstance(r, dict) and not r.get("archived") and not r.get("disabled")
    ]

    print("PASS: GitHub API authenticated")
    print(f"  Token source: {source}")
    print(f"  Authenticated as: {login}")
    print(f"  Repos for {USER}: {repo_count} total, {len(active)} non-archived")
    print(f"  Sample: {', '.join(sorted(active)[:5])}{'...' if len(active) > 5 else ''}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
