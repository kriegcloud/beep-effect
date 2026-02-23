"""Tests for sync_docs.py documentation sync script."""

import sys
from pathlib import Path
from unittest.mock import patch

import pytest

# Add scripts directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / "scripts"))

from sync_docs import (
    DOC_SOURCES,
    add_frontmatter,
    content_hash,
    fetch_url,
    html_to_markdown,
    read_existing_content,
    sync_doc,
)


class TestHtmlToMarkdown:
    """Tests for HTML to markdown conversion."""

    def test_basic_conversion(self):
        """Converts basic HTML to markdown."""
        html = "<html><body><h1>Title</h1><p>Paragraph text.</p></body></html>"
        result = html_to_markdown(html)
        assert "# Title" in result
        assert "Paragraph text." in result

    def test_extracts_main_content(self):
        """Extracts content from main element."""
        html = """
        <html>
            <body>
                <nav>Navigation</nav>
                <main><h1>Main Content</h1></main>
                <footer>Footer</footer>
            </body>
        </html>
        """
        result = html_to_markdown(html)
        assert "Main Content" in result
        assert "Navigation" not in result
        assert "Footer" not in result

    def test_removes_scripts_and_styles(self):
        """Removes script and style tags."""
        html = """
        <html>
            <body>
                <script>alert('test');</script>
                <style>.test { color: red; }</style>
                <p>Content</p>
            </body>
        </html>
        """
        result = html_to_markdown(html)
        assert "Content" in result
        assert "alert" not in result
        assert "color" not in result

    def test_preserves_links(self):
        """Preserves hyperlinks in markdown format."""
        html = '<p><a href="https://example.com">Link text</a></p>'
        result = html_to_markdown(html)
        assert "[Link text]" in result
        assert "https://example.com" in result


class TestAddFrontmatter:
    """Tests for YAML frontmatter generation."""

    def test_adds_frontmatter(self):
        """Adds YAML frontmatter to content."""
        content = "# Test\n\nSome content."
        result = add_frontmatter(content, "https://example.com", "Test Title")

        assert result.startswith("---")
        assert "title: Test Title" in result
        assert "source_url: https://example.com" in result
        assert "fetched_at:" in result
        assert content in result

    def test_frontmatter_format(self):
        """Frontmatter is valid YAML format."""
        result = add_frontmatter("content", "https://test.com", "Title")
        lines = result.split("\n")

        # Check frontmatter structure
        assert lines[0] == "---"
        frontmatter_end = lines.index("---", 1)
        assert frontmatter_end > 0


class TestContentHash:
    """Tests for content hashing."""

    def test_same_content_same_hash(self):
        """Same content produces same hash."""
        content = "Test content"
        assert content_hash(content) == content_hash(content)

    def test_different_content_different_hash(self):
        """Different content produces different hash."""
        assert content_hash("content1") != content_hash("content2")

    def test_hash_is_sha256(self):
        """Hash is 64-character hex string (SHA256)."""
        result = content_hash("test")
        assert len(result) == 64
        assert all(c in "0123456789abcdef" for c in result)


class TestReadExistingContent:
    """Tests for reading existing content."""

    def test_returns_none_for_missing_file(self, tmp_path):
        """Returns None when file doesn't exist."""
        result = read_existing_content(tmp_path / "nonexistent.md")
        assert result is None

    def test_reads_file_content(self, tmp_path):
        """Reads and returns file content."""
        file_path = tmp_path / "test.md"
        file_path.write_text("# Test\n\nContent here.")

        result = read_existing_content(file_path)
        assert "# Test" in result
        assert "Content here" in result

    def test_strips_frontmatter(self, tmp_path):
        """Strips YAML frontmatter from content."""
        file_path = tmp_path / "test.md"
        file_path.write_text(
            "---\ntitle: Test\nsource_url: https://test.com\n---\n\n# Actual Content"
        )

        result = read_existing_content(file_path)
        assert "title:" not in result
        assert "source_url:" not in result
        assert "# Actual Content" in result


class TestFetchUrl:
    """Tests for URL fetching with mocked HTTP."""

    def test_fetch_success(self, requests_mock):
        """Successfully fetches URL content."""
        requests_mock.get("https://test.com/doc", text="<html>Test</html>")

        result = fetch_url("https://test.com/doc")
        assert result == "<html>Test</html>"

    def test_fetch_404_returns_none(self, requests_mock):
        """Returns None for 404 errors."""
        requests_mock.get("https://test.com/missing", status_code=404)

        result = fetch_url("https://test.com/missing")
        assert result is None

    def test_fetch_retries_on_server_error(self, requests_mock):
        """Retries on 5xx errors."""
        # First two calls fail, third succeeds
        requests_mock.get(
            "https://test.com/flaky",
            [
                {"status_code": 500},
                {"status_code": 503},
                {"text": "<html>Success</html>"},
            ],
        )

        with patch("sync_docs.time.sleep"):  # Skip actual delays
            result = fetch_url("https://test.com/flaky")

        assert result == "<html>Success</html>"

    def test_fetch_gives_up_after_max_retries(self, requests_mock):
        """Returns None after max retries."""
        requests_mock.get("https://test.com/down", status_code=500)

        with patch("sync_docs.time.sleep"):
            result = fetch_url("https://test.com/down")

        assert result is None


class TestSyncDoc:
    """Integration tests for sync_doc function."""

    SAMPLE_HTML = """
    <html>
        <body>
            <main>
                <h1>Documentation</h1>
                <p>This is test documentation.</p>
            </main>
        </body>
    </html>
    """

    def test_creates_new_file(self, tmp_path, requests_mock):
        """Creates new file when none exists."""
        requests_mock.get("https://docs.example.com/test", text=self.SAMPLE_HTML)

        config = {
            "url": "https://docs.example.com/test",
            "output": "docs/test.md",
            "title": "Test Doc",
        }

        result = sync_doc("test", config, tmp_path)

        assert result is True
        output_file = tmp_path / "docs" / "test.md"
        assert output_file.exists()

        content = output_file.read_text()
        assert "title: Test Doc" in content
        assert "source_url: https://docs.example.com/test" in content
        assert "Documentation" in content

    def test_dry_run_no_write(self, tmp_path, requests_mock):
        """Dry run doesn't write files."""
        requests_mock.get("https://docs.example.com/test", text=self.SAMPLE_HTML)

        config = {
            "url": "https://docs.example.com/test",
            "output": "docs/test.md",
            "title": "Test Doc",
        }

        result = sync_doc("test", config, tmp_path, dry_run=True)

        assert result is True
        output_file = tmp_path / "docs" / "test.md"
        assert not output_file.exists()

    def test_skips_unchanged_content(self, tmp_path, requests_mock):
        """Skips write when content unchanged."""
        requests_mock.get("https://docs.example.com/test", text=self.SAMPLE_HTML)

        config = {
            "url": "https://docs.example.com/test",
            "output": "docs/test.md",
            "title": "Test Doc",
        }

        # First sync creates file
        sync_doc("test", config, tmp_path)
        output_file = tmp_path / "docs" / "test.md"
        original_mtime = output_file.stat().st_mtime

        # Second sync should skip (content unchanged)
        result = sync_doc("test", config, tmp_path)

        assert result is True
        # File should not be modified
        assert output_file.stat().st_mtime == original_mtime

    def test_force_updates_unchanged(self, tmp_path, requests_mock):
        """Force flag updates even when content unchanged."""
        requests_mock.get("https://docs.example.com/test", text=self.SAMPLE_HTML)

        config = {
            "url": "https://docs.example.com/test",
            "output": "docs/test.md",
            "title": "Test Doc",
        }

        # First sync
        sync_doc("test", config, tmp_path)
        output_file = tmp_path / "docs" / "test.md"
        original_mtime = output_file.stat().st_mtime

        # Modify file mtime to be in the past
        import os
        os.utime(output_file, (original_mtime - 10, original_mtime - 10))

        # Force sync should update file even though content is same
        result = sync_doc("test", config, tmp_path, force=True)

        assert result is True
        # File should have been written (mtime updated)
        assert output_file.stat().st_mtime > original_mtime - 10

    def test_returns_false_on_fetch_error(self, tmp_path, requests_mock):
        """Returns False when fetch fails."""
        requests_mock.get("https://docs.example.com/missing", status_code=404)

        config = {
            "url": "https://docs.example.com/missing",
            "output": "docs/test.md",
            "title": "Test Doc",
        }

        result = sync_doc("test", config, tmp_path)

        assert result is False

    def test_markdown_format_skips_html_conversion(self, tmp_path, requests_mock):
        """Markdown format uses content as-is without HTML conversion."""
        markdown_content = "# Test Header\n\nThis is **markdown** content."
        requests_mock.get("https://docs.example.com/test.md", text=markdown_content)

        config = {
            "url": "https://docs.example.com/test.md",
            "output": "docs/test.md",
            "title": "Test Markdown Doc",
            "format": "markdown",
        }

        result = sync_doc("test", config, tmp_path)

        assert result is True
        output_file = tmp_path / "docs" / "test.md"
        content = output_file.read_text()

        # Content should be preserved as-is (not HTML-converted)
        assert "# Test Header" in content
        assert "**markdown**" in content
        assert "title: Test Markdown Doc" in content


class TestDocSources:
    """Tests for DOC_SOURCES configuration."""

    def test_has_required_sources(self):
        """Configuration includes claude and copilot sources."""
        assert "claude" in DOC_SOURCES
        assert "copilot" in DOC_SOURCES

    def test_sources_have_required_fields(self):
        """Each source has url, output, and title."""
        for source_id, config in DOC_SOURCES.items():
            assert "url" in config, f"{source_id} missing 'url'"
            assert "output" in config, f"{source_id} missing 'output'"
            assert "title" in config, f"{source_id} missing 'title'"

    def test_urls_are_https(self):
        """All URLs use HTTPS."""
        for source_id, config in DOC_SOURCES.items():
            assert config["url"].startswith("https://"), f"{source_id} URL not HTTPS"


@pytest.fixture
def requests_mock():
    """Pytest fixture for mocking HTTP requests."""
    import requests_mock as rm

    with rm.Mocker() as m:
        yield m
