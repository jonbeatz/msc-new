"""Load GitHub token from repo .env files (no third-party deps)."""
from __future__ import annotations

import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

TOKEN_KEYS = (
    "GITHUB_PERSONAL_ACCESS_TOKEN",
    "GITHUB_TOKEN",
    "GH_TOKEN",
)


def parse_dotenv(path: Path) -> dict[str, str]:
    if not path.is_file():
        return {}
    out: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key:
            out[key] = value
    return out


def load_repo_env() -> dict[str, str]:
    """Merge .env then .env.local (.env.local wins). Does not overwrite os.environ."""
    merged: dict[str, str] = {}
    for name in (".env", ".env.local"):
        merged.update(parse_dotenv(ROOT / name))
    return merged


def get_github_token() -> str | None:
    """Token from process env first, then repo .env / .env.local."""
    for key in TOKEN_KEYS:
        val = os.environ.get(key, "").strip()
        if val:
            return val
    env = load_repo_env()
    for key in TOKEN_KEYS:
        val = env.get(key, "").strip()
        if val:
            return val
    return None


def apply_github_token_to_process() -> str | None:
    """Set GH_TOKEN + GITHUB_PERSONAL_ACCESS_TOKEN on os.environ for gh CLI / subprocess."""
    token = get_github_token()
    if not token:
        return None
    os.environ["GITHUB_PERSONAL_ACCESS_TOKEN"] = token
    os.environ["GITHUB_TOKEN"] = token
    os.environ["GH_TOKEN"] = token
    return token
