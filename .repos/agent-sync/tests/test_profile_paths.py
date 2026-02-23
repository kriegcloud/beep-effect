"""
Tests for profile path resolution.

Tests the ProfilePathResolver class which handles platform-specific
path resolution for AI tool configuration directories.
"""

import pytest
from pathlib import Path
from unittest import mock

from core.profile_paths import ProfilePathResolver
from core.canonical_models import ConfigType


class TestProfilePathResolver:
    """Tests for ProfilePathResolver."""

    @pytest.fixture
    def resolver(self):
        """Create ProfilePathResolver instance."""
        return ProfilePathResolver()

    # =========================================================================
    # Phase 1: Claude Path Resolution Tests
    # =========================================================================

    def test_get_claude_profile_path(self, resolver):
        """Test Claude profile path resolution."""
        path = resolver.get_claude_profile_path()
        assert isinstance(path, Path)
        assert path.name == '.claude'
        assert path.parent == Path.home()

    def test_get_claude_profile_path_all_platforms(self, resolver):
        """Test Claude path is consistent across platforms."""
        # Claude uses ~/.claude/ on all platforms
        for platform_name in ['Windows', 'Darwin', 'Linux']:
            with mock.patch('platform.system', return_value=platform_name):
                resolver._platform = platform_name
                path = resolver.get_claude_profile_path()
                assert path == Path.home() / '.claude'

    # =========================================================================
    # Phase 2: Copilot Path Resolution Tests
    # =========================================================================

    def test_get_copilot_profile_path_windows(self, resolver, monkeypatch):
        """Test Copilot profile path on Windows."""
        resolver._platform = 'Windows'
        monkeypatch.setenv('APPDATA', 'C:\\Users\\TestUser\\AppData\\Roaming')

        path = resolver.get_copilot_profile_path()
        # Normalize path comparison for cross-platform testing with Windows path strings
        expected = Path('C:\\Users\\TestUser\\AppData\\Roaming') / 'Code' / 'User'
        assert path == expected

    def test_get_copilot_profile_path_windows_no_appdata(self, resolver, monkeypatch):
        """Test Copilot profile path on Windows when APPDATA not set."""
        resolver._platform = 'Windows'
        monkeypatch.delenv('APPDATA', raising=False)

        path = resolver.get_copilot_profile_path()
        assert path == Path.home() / 'AppData' / 'Roaming' / 'Code' / 'User'

    def test_get_copilot_profile_path_macos(self, resolver):
        """Test Copilot profile path on macOS."""
        resolver._platform = 'Darwin'

        path = resolver.get_copilot_profile_path()
        assert path == Path.home() / 'Library' / 'Application Support' / 'Code' / 'User'

    def test_get_copilot_profile_path_linux(self, resolver):
        """Test Copilot profile path on Linux."""
        resolver._platform = 'Linux'

        path = resolver.get_copilot_profile_path()
        assert path == Path.home() / '.config' / 'Code' / 'User'

    def test_get_copilot_profile_path_unsupported_platform(self, resolver):
        """Test Copilot profile path raises error for unsupported platform."""
        resolver._platform = 'UnknownOS'

        with pytest.raises(ValueError) as excinfo:
            resolver.get_copilot_profile_path()
        assert "Unsupported platform" in str(excinfo.value)
        assert "UnknownOS" in str(excinfo.value)

    # =========================================================================
    # Phase 3: Gemini Path Resolution Tests
    # =========================================================================

    def test_get_gemini_profile_path(self, resolver):
        """Test Gemini profile path resolution."""
        path = resolver.get_gemini_profile_path()
        assert isinstance(path, Path)
        assert path.name == '.gemini'
        assert path.parent == Path.home()

    # =========================================================================
    # Phase 4: Generic Profile Path Tests
    # =========================================================================

    def test_get_profile_path_claude(self, resolver):
        """Test generic accessor for Claude format."""
        path = resolver.get_profile_path('claude')
        assert path == resolver.get_claude_profile_path()

    def test_get_profile_path_copilot(self, resolver):
        """Test generic accessor for Copilot format."""
        path = resolver.get_profile_path('copilot')
        assert path == resolver.get_copilot_profile_path()

    def test_get_profile_path_gemini(self, resolver):
        """Test generic accessor for Gemini format."""
        path = resolver.get_profile_path('gemini')
        assert path == resolver.get_gemini_profile_path()

    def test_get_profile_path_case_insensitive(self, resolver):
        """Test that format name lookup is case-insensitive."""
        assert resolver.get_profile_path('Claude') == resolver.get_profile_path('claude')
        assert resolver.get_profile_path('COPILOT') == resolver.get_profile_path('copilot')
        assert resolver.get_profile_path('Gemini') == resolver.get_profile_path('gemini')

    def test_get_profile_path_unknown_format(self, resolver):
        """Test that unknown format raises ValueError."""
        with pytest.raises(ValueError) as excinfo:
            resolver.get_profile_path('unknown_format')
        assert "Unknown format" in str(excinfo.value)
        assert "unknown_format" in str(excinfo.value)
        assert "Supported formats" in str(excinfo.value)

    # =========================================================================
    # Phase 5: Config Subdirectory Tests
    # =========================================================================

    def test_get_config_subdir_claude_agent(self, resolver):
        """Test Claude agent subdirectory."""
        path = resolver.get_config_subdir('claude', ConfigType.AGENT)
        assert path == resolver.get_claude_profile_path() / 'agents'

    def test_get_config_subdir_claude_slash_command(self, resolver):
        """Test Claude slash command subdirectory."""
        path = resolver.get_config_subdir('claude', ConfigType.SLASH_COMMAND)
        assert path == resolver.get_claude_profile_path() / 'commands'

    def test_get_config_subdir_claude_permission(self, resolver):
        """Test Claude permission returns base path (settings.json in root)."""
        path = resolver.get_config_subdir('claude', ConfigType.PERMISSION)
        assert path == resolver.get_claude_profile_path()

    def test_get_config_subdir_copilot_agent(self, resolver):
        """Test Copilot agent subdirectory (VS Code uses prompts/ for both)."""
        path = resolver.get_config_subdir('copilot', ConfigType.AGENT)
        assert path == resolver.get_copilot_profile_path() / 'prompts'

    def test_get_config_subdir_copilot_slash_command(self, resolver):
        """Test Copilot slash command (prompts) subdirectory."""
        path = resolver.get_config_subdir('copilot', ConfigType.SLASH_COMMAND)
        assert path == resolver.get_copilot_profile_path() / 'prompts'

    def test_get_config_subdir_copilot_permission(self, resolver):
        """Test Copilot permission returns base path."""
        path = resolver.get_config_subdir('copilot', ConfigType.PERMISSION)
        assert path == resolver.get_copilot_profile_path()

    def test_get_config_subdir_gemini_slash_command(self, resolver):
        """Test Gemini slash command subdirectory."""
        path = resolver.get_config_subdir('gemini', ConfigType.SLASH_COMMAND)
        assert path == resolver.get_gemini_profile_path() / 'commands'

    def test_get_config_subdir_gemini_unsupported_type(self, resolver):
        """Test Gemini raises error for unsupported config types."""
        with pytest.raises(ValueError) as excinfo:
            resolver.get_config_subdir('gemini', ConfigType.AGENT)
        assert "does not support config type" in str(excinfo.value)

    def test_get_config_subdir_unknown_format(self, resolver):
        """Test config subdir raises error for unknown format."""
        with pytest.raises(ValueError) as excinfo:
            resolver.get_config_subdir('unknown', ConfigType.AGENT)
        assert "Unknown format" in str(excinfo.value)

    # =========================================================================
    # Phase 6: Get All Config Subdirs Tests
    # =========================================================================

    def test_get_all_config_subdirs_claude(self, resolver):
        """Test getting all subdirs for Claude."""
        subdirs = resolver.get_all_config_subdirs('claude')

        assert ConfigType.AGENT in subdirs
        assert ConfigType.SLASH_COMMAND in subdirs
        assert ConfigType.PERMISSION in subdirs
        assert subdirs[ConfigType.AGENT].name == 'agents'
        assert subdirs[ConfigType.SLASH_COMMAND].name == 'commands'

    def test_get_all_config_subdirs_copilot(self, resolver):
        """Test getting all subdirs for Copilot."""
        subdirs = resolver.get_all_config_subdirs('copilot')

        assert ConfigType.AGENT in subdirs
        assert ConfigType.SLASH_COMMAND in subdirs
        assert ConfigType.PERMISSION in subdirs
        assert subdirs[ConfigType.SLASH_COMMAND].name == 'prompts'

    def test_get_all_config_subdirs_gemini(self, resolver):
        """Test getting all subdirs for Gemini (only slash commands)."""
        subdirs = resolver.get_all_config_subdirs('gemini')

        assert ConfigType.SLASH_COMMAND in subdirs
        assert ConfigType.AGENT not in subdirs
        assert ConfigType.PERMISSION not in subdirs

    def test_get_all_config_subdirs_unknown_format(self, resolver):
        """Test get_all_config_subdirs raises error for unknown format."""
        with pytest.raises(ValueError) as excinfo:
            resolver.get_all_config_subdirs('unknown')
        assert "Unknown format" in str(excinfo.value)
