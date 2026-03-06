"""Verify the sdist does not bundle sensitive files.

Runs against the installed package metadata (pyproject.toml) to confirm
the hatchling exclude list is present, and inspects any pre-built sdist
in dist/ if one exists.
"""

import tarfile
import re
from pathlib import Path

REPO_ROOT = Path(__file__).parent.parent

# Patterns that must never appear in a published sdist
SENSITIVE_PATTERNS = re.compile(
    r"(\.claude[/\\]|\.env$|\.pypirc|\.aws[/\\]|\.ssh[/\\]"
    r"|id_rsa|id_ed25519|\.pem$|\.key$|credentials\.json)"
)


def test_pyproject_excludes_claude_dir():
    """pyproject.toml must have .claude/ in the sdist exclude list."""
    text = (REPO_ROOT / "pyproject.toml").read_text(encoding="utf-8")
    assert '[tool.hatch.build.targets.sdist]' in text, \
        "Missing [tool.hatch.build.targets.sdist] section in pyproject.toml"
    assert '.claude/' in text, \
        ".claude/ must be listed in [tool.hatch.build.targets.sdist] exclude"


def test_gitignore_excludes_claude_dir():
    """.gitignore must exclude .claude/"""
    text = (REPO_ROOT / ".gitignore").read_text(encoding="utf-8")
    assert ".claude/" in text, ".claude/ must be listed in .gitignore"


def test_sdist_contains_no_sensitive_paths():
    """Any sdist in dist/ must not contain sensitive file paths."""
    dist_dir = REPO_ROOT / "dist"
    sdists = list(dist_dir.glob("*.tar.gz")) if dist_dir.exists() else []

    if not sdists:
        return  # Nothing to check; CI build step handles this separately

    for sdist in sdists:
        with tarfile.open(sdist, "r:gz") as tf:
            bad = [m.name for m in tf.getmembers() if SENSITIVE_PATTERNS.search(m.name)]
        assert not bad, (
            f"Sensitive paths found in {sdist.name}:\n" + "\n".join(bad)
        )
