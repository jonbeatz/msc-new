#!/usr/bin/env python3
"""Verify TAVILY_API_KEY from .env.local against Tavily search API."""
from __future__ import annotations

import json
import sys
import urllib.error
import urllib.request

from github_env import load_repo_env


def main() -> int:
    key = load_repo_env().get("TAVILY_API_KEY", "").strip()
    if not key:
        print("FAIL: TAVILY_API_KEY not found in .env.local")
        return 1

    body = json.dumps(
        {"api_key": key, "query": "Payload CMS SQLite", "max_results": 1, "search_depth": "basic"}
    ).encode("utf-8")
    req = urllib.request.Request(
        "https://api.tavily.com/search",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")[:200]
        print(f"FAIL: Tavily API HTTP {exc.code}: {detail}")
        return 1

    results = data.get("results") or []
    print("PASS: Tavily API authenticated")
    print(f"  Token source: repo .env.local")
    print(f"  Query test returned {len(results)} result(s)")
    if results:
        print(f"  Sample: {results[0].get('title', '(no title)')[:60]}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
