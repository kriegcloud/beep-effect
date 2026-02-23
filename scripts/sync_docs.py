#!/usr/bin/env python3
"""
Sync permission documentation from external sources.

Fetches documentation from docs.anthropic.com and docs.github.com,
converts to markdown, and saves locally in docs/permissions/.
"""

import argparse
import hashlib
import logging
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

import html2text
import requests
from bs4 import BeautifulSoup

# Documentation sources configuration
DOC_SOURCES = {
    "claude": {
        "url": "https://code.claude.com/docs/en/sub-agents.md",
        "output": "docs/permissions/claude-permissions.md",
        "title": "Claude Code Sub-agents",
        "format": "markdown",  # Skip HTML conversion
    },
    "copilot": {
        "url": "https://docs.github.com/en/copilot/concepts/agents/about-copilot-cli#allowing-tools-to-be-used-without-manual-approval",
        "output": "docs/permissions/copilot-permissions.md",
        "title": "GitHub Copilot CLI Tool Permissions",
    },
}

# Retry configuration
MAX_RETRIES = 3
RETRY_DELAY_BASE = 2  # seconds, exponential backoff

logger = logging.getLogger(__name__)


def fetch_url(url: str, timeout: int = 30) -> Optional[str]:
    """
    Fetch content from URL with retry logic.

    Args:
        url: URL to fetch
        timeout: Request timeout in seconds

    Returns:
        HTML content as string, or None if fetch failed
    """
    headers = {
        "User-Agent": "agent-sync-docs/1.0 (https://github.com/anthropics/coding-agent-settings-sync)"
    }

    for attempt in range(MAX_RETRIES):
        try:
            response = requests.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            return response.text
        except requests.exceptions.HTTPError as e:
            if e.response.status_code == 404:
                logger.error(f"URL not found (404): {url}")
                return None
            elif e.response.status_code == 429:
                delay = RETRY_DELAY_BASE ** (attempt + 1)
                logger.warning(f"Rate limited, waiting {delay}s before retry...")
                time.sleep(delay)
            elif e.response.status_code >= 500:
                delay = RETRY_DELAY_BASE ** (attempt + 1)
                logger.warning(f"Server error {e.response.status_code}, retrying in {delay}s...")
                time.sleep(delay)
            else:
                logger.error(f"HTTP error fetching {url}: {e}")
                return None
        except requests.exceptions.RequestException as e:
            delay = RETRY_DELAY_BASE ** (attempt + 1)
            logger.warning(f"Network error (attempt {attempt + 1}/{MAX_RETRIES}): {e}")
            if attempt < MAX_RETRIES - 1:
                time.sleep(delay)

    logger.error(f"Failed to fetch {url} after {MAX_RETRIES} attempts")
    return None


def html_to_markdown(html: str) -> str:
    """
    Convert HTML to markdown using html2text.

    Args:
        html: HTML content

    Returns:
        Markdown content
    """
    # Parse HTML to extract main content
    soup = BeautifulSoup(html, "html.parser")

    # Try to find main content area (common patterns)
    main_content = (
        soup.find("main")
        or soup.find("article")
        or soup.find(class_="content")
        or soup.find(class_="markdown-body")
        or soup.find(id="content")
        or soup.body
    )

    if main_content is None:
        main_content = soup

    # Remove navigation, footer, sidebar elements
    for tag in main_content.find_all(["nav", "footer", "aside", "header"]):
        tag.decompose()

    # Remove script and style tags
    for tag in main_content.find_all(["script", "style"]):
        tag.decompose()

    # Convert to markdown
    h = html2text.HTML2Text()
    h.ignore_links = False
    h.ignore_images = True
    h.ignore_emphasis = False
    h.body_width = 0  # No line wrapping

    return h.handle(str(main_content)).strip()


def add_frontmatter(content: str, source_url: str, title: str) -> str:
    """
    Add YAML frontmatter to markdown content.

    Args:
        content: Markdown content
        source_url: Original source URL
        title: Document title

    Returns:
        Markdown with frontmatter
    """
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    frontmatter = f"""---
title: {title}
source_url: {source_url}
fetched_at: {timestamp}
---

"""
    return frontmatter + content


def content_hash(content: str) -> str:
    """Calculate SHA256 hash of content."""
    return hashlib.sha256(content.encode()).hexdigest()


def read_existing_content(path: Path) -> Optional[str]:
    """
    Read existing file content, stripping frontmatter for comparison.

    Args:
        path: Path to file

    Returns:
        Content without frontmatter, or None if file doesn't exist
    """
    if not path.exists():
        return None

    content = path.read_text(encoding="utf-8")

    # Strip frontmatter for comparison
    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            return parts[2].strip()

    return content.strip()


def sync_doc(
    source_id: str,
    config: dict,
    base_dir: Path,
    dry_run: bool = False,
    force: bool = False,
) -> bool:
    """
    Sync a single documentation source.

    Args:
        source_id: Identifier for the source (e.g., 'claude', 'copilot')
        config: Source configuration dict
        base_dir: Base directory for output
        dry_run: If True, don't write files
        force: If True, write even if content unchanged

    Returns:
        True if sync was successful (or skipped), False on error
    """
    url = config["url"]
    output_path = base_dir / config["output"]
    title = config.get("title", source_id)

    logger.info(f"Syncing {source_id} from {url}")

    # Fetch content
    html = fetch_url(url)
    if html is None:
        return False

    # Convert to markdown (or use as-is if already markdown)
    content_format = config.get("format", "html")
    if content_format == "markdown":
        markdown = html.strip()
    else:
        try:
            markdown = html_to_markdown(html)
        except Exception as e:
            logger.error(f"Error parsing HTML from {url}: {e}")
            return False

    # Check if content changed
    existing = read_existing_content(output_path)
    new_hash = content_hash(markdown)
    existing_hash = content_hash(existing) if existing else None

    if not force and existing_hash == new_hash:
        logger.info(f"  No changes detected for {source_id}")
        return True

    # Add frontmatter
    final_content = add_frontmatter(markdown, url, title)

    if dry_run:
        if existing is None:
            logger.info(f"  Would create: {output_path}")
        else:
            logger.info(f"  Would update: {output_path}")
        return True

    # Write file
    try:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_text(final_content, encoding="utf-8")
        if existing is None:
            logger.info(f"  Created: {output_path}")
        else:
            logger.info(f"  Updated: {output_path}")
        return True
    except PermissionError:
        logger.error(f"Permission denied writing to {output_path}")
        return False
    except FileNotFoundError:
        logger.error(f"Could not find directory for {output_path}")
        return False
    except OSError as e:
        logger.error(f"Error writing {output_path}: {e}")
        return False


def main() -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Sync permission documentation from external sources"
    )
    parser.add_argument(
        "--docs-dir",
        type=Path,
        default=Path(__file__).parent.parent,
        help="Base directory for documentation output (default: project root)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without writing files",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-sync even if content unchanged",
    )
    parser.add_argument(
        "--source",
        nargs="*",
        choices=list(DOC_SOURCES.keys()),
        help="Specific sources to sync (default: all)",
    )
    parser.add_argument(
        "-v", "--verbose",
        action="store_true",
        help="Verbose output",
    )

    args = parser.parse_args()

    # Configure logging
    log_level = logging.DEBUG if args.verbose else logging.INFO
    logging.basicConfig(
        level=log_level,
        format="%(message)s",
    )

    # Determine which sources to sync
    sources = args.source if args.source else list(DOC_SOURCES.keys())

    if args.dry_run:
        logger.info("Dry run mode - no files will be written\n")

    # Sync each source
    success_count = 0
    error_count = 0

    for source_id in sources:
        config = DOC_SOURCES[source_id]
        if sync_doc(source_id, config, args.docs_dir, args.dry_run, args.force):
            success_count += 1
        else:
            error_count += 1

    # Summary
    logger.info("")
    logger.info(f"Sync complete: {success_count} succeeded, {error_count} failed")

    return 0 if error_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())