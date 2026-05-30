#!/usr/bin/env python3
"""
DEPRECATED — use: npm run sync:mcp-env  (scripts/sync-mcp-env.js)

Copy GITHUB_PERSONAL_ACCESS_TOKEN from repo .env into Cursor global MCP config.

Updates: %USERPROFILE%\\.cursor\\mcp.json → mcpServers.github.env

Run after changing .env, then restart Cursor (or reload MCP servers).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from github_env import get_github_token

MCP_JSON = Path.home() / ".cursor" / "mcp.json"


def main() -> int:
    token = get_github_token()
    if not token:
        print("FAIL: GITHUB_PERSONAL_ACCESS_TOKEN not found in .env / .env.local")
        return 1

    if not MCP_JSON.is_file():
        print(f"FAIL: MCP config not found: {MCP_JSON}")
        return 1

    data = json.loads(MCP_JSON.read_text(encoding="utf-8"))
    servers = data.get("mcpServers") or {}
    github = servers.get("github")
    if not github:
        print("FAIL: mcpServers.github missing in mcp.json")
        return 1

    env = github.setdefault("env", {})
    old = env.get("GITHUB_PERSONAL_ACCESS_TOKEN", "")
    env["GITHUB_PERSONAL_ACCESS_TOKEN"] = token

    MCP_JSON.write_text(json.dumps(data, indent=2) + "\n", encoding="utf-8")

    if old.startswith("YOUR_") or old == "REPLACE_WITH_GITHUB_PERSONAL_ACCESS_TOKEN":
        print(f"PASS: Updated placeholder token in {MCP_JSON}")
    elif old == token:
        print(f"PASS: Token already synced in {MCP_JSON}")
    else:
        print(f"PASS: Refreshed GitHub token in {MCP_JSON}")

    print("Next: Restart Cursor or reload MCP so user-github picks up the new token.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
