"""
Unit tests for format registry.

Tests cover:
- Adapter registration and unregistration
- Adapter lookup
- Format detection from file paths
- Config type support queries
- Error handling for edge cases
"""

import pytest
from pathlib import Path

from core.registry import FormatRegistry
from core.canonical_models import ConfigType
from adapters import ClaudeAdapter, CopilotAdapter


class TestFormatRegistry:
    """Tests for FormatRegistry."""

    @pytest.fixture
    def registry(self):
        """Create FormatRegistry with some adapters."""
        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())
        return registry

    def test_register_adapter(self):
        """Test registering an adapter."""
        registry = FormatRegistry()
        adapter = ClaudeAdapter()
        registry.register(adapter)
        assert 'claude' in registry.list_formats()
        assert registry.get_adapter('claude') is not None

    def test_register_duplicate_raises_error(self, registry):
        """Test that registering duplicate format raises error with helpful message."""
        with pytest.raises(ValueError) as excinfo:
            registry.register(ClaudeAdapter())
        
        assert "already registered" in str(excinfo.value)
        assert "existing: ClaudeAdapter" in str(excinfo.value)
        assert "new: ClaudeAdapter" in str(excinfo.value)

    def test_get_adapter(self, registry):
        """Test retrieving adapter by name."""
        adapter = registry.get_adapter('claude')
        assert adapter is not None
        assert adapter.format_name == 'claude'

        adapter = registry.get_adapter('copilot')
        assert adapter is not None
        assert adapter.format_name == 'copilot'

    def test_get_nonexistent_adapter(self, registry):
        """Test retrieving non-existent adapter returns None."""
        assert registry.get_adapter('nonexistent') is None
        assert registry.get_adapter('unknown-format') is None

    def test_detect_format(self, registry):
        """Test auto-detecting format from file path."""
        # Claude agent - plain .md file
        adapter = registry.detect_format(Path('agent.md'))
        assert adapter is not None
        assert adapter.format_name == 'claude'

        adapter = registry.detect_format(Path('~/.claude/agents/planner.md'))
        assert adapter is not None
        assert adapter.format_name == 'claude'

        # Copilot agent - .agent.md file
        adapter = registry.detect_format(Path('agent.agent.md'))
        assert adapter is not None
        assert adapter.format_name == 'copilot'

        adapter = registry.detect_format(Path('.github/agents/reviewer.agent.md'))
        assert adapter is not None
        assert adapter.format_name == 'copilot'

    def test_detect_format_ambiguous_files(self, registry):
        """
        Test that .prompt.md and .perm.json are correctly detected as copilot.
        These used to be ambiguous with Claude if Claude was registered first.
        """
        # .prompt.md should be copilot
        adapter = registry.detect_format(Path('test.prompt.md'))
        assert adapter is not None
        assert adapter.format_name == 'copilot'

        # .perm.json should be copilot
        adapter = registry.detect_format(Path('test.perm.json'))
        assert adapter is not None
        assert adapter.format_name == 'copilot'

    def test_detect_format_order_independence(self):
        """
        Test that format detection is deterministic regardless of registration order.
        """
        # Case 1: Claude then Copilot
        registry1 = FormatRegistry()
        registry1.register(ClaudeAdapter())
        registry1.register(CopilotAdapter())
        
        adapter1 = registry1.detect_format(Path('test.prompt.md'))
        assert adapter1.format_name == 'copilot'

        # Case 2: Copilot then Claude
        registry2 = FormatRegistry()
        registry2.register(CopilotAdapter())
        registry2.register(ClaudeAdapter())
        
        adapter2 = registry2.detect_format(Path('test.prompt.md'))
        assert adapter2.format_name == 'copilot'

    def test_detect_format_no_match(self, registry):
        """Test that detecting unknown format returns None."""
        # File extensions that don't match any adapter
        assert registry.detect_format(Path('file.txt')) is None
        assert registry.detect_format(Path('script.py')) is None
        assert registry.detect_format(Path('config.json')) is None

    def test_list_formats(self, registry):
        """Test listing all registered formats."""
        formats = registry.list_formats()
        assert 'claude' in formats
        assert 'copilot' in formats
        assert len(formats) == 2

    def test_list_formats_empty(self):
        """Test listing formats for empty registry."""
        registry = FormatRegistry()
        assert registry.list_formats() == []

    def test_supports_config_type(self, registry):
        """Test checking if format supports config type."""
        # Both support AGENT config type
        assert registry.supports_config_type('claude', ConfigType.AGENT)
        assert registry.supports_config_type('copilot', ConfigType.AGENT)

        # Both support PERMISSION
        assert registry.supports_config_type('claude', ConfigType.PERMISSION)
        assert registry.supports_config_type('copilot', ConfigType.PERMISSION)

        # Both adapters support SLASH_COMMAND
        assert registry.supports_config_type('claude', ConfigType.SLASH_COMMAND)
        assert registry.supports_config_type('copilot', ConfigType.SLASH_COMMAND)

    def test_supports_config_type_nonexistent(self, registry):
        """Test checking support for non-existent format returns False."""
        assert not registry.supports_config_type('unknown', ConfigType.AGENT)
        assert not registry.supports_config_type('nonexistent', ConfigType.PERMISSION)

    def test_validate_conversion_support(self, registry):
        """Test validating conversion support for a pair of formats."""
        # Both claude and copilot support AGENT
        assert registry.validate_conversion_support('claude', 'copilot', ConfigType.AGENT)
        
        # Both support PERMISSION
        assert registry.validate_conversion_support('claude', 'copilot', ConfigType.PERMISSION)
        
        # One format does not exist
        assert not registry.validate_conversion_support('claude', 'nonexistent', ConfigType.AGENT)
        
        # Both support SLASH_COMMAND
        assert registry.validate_conversion_support('claude', 'copilot', ConfigType.SLASH_COMMAND)

    def test_get_formats_supporting(self, registry):
        """Test getting all formats supporting a config type."""
        # Both adapters support AGENT
        formats = registry.get_formats_supporting(ConfigType.AGENT)
        assert 'claude' in formats
        assert 'copilot' in formats
        assert len(formats) == 2

        # Both support PERMISSION
        formats = registry.get_formats_supporting(ConfigType.PERMISSION)
        assert 'claude' in formats
        assert 'copilot' in formats
        assert len(formats) == 2

        # Both support SLASH_COMMAND
        formats = registry.get_formats_supporting(ConfigType.SLASH_COMMAND)
        assert 'claude' in formats
        assert 'copilot' in formats
        assert len(formats) == 2

    def test_unregister_adapter(self, registry):
        """Test unregistering an adapter."""
        # Verify claude is registered
        assert 'claude' in registry.list_formats()
        assert registry.get_adapter('claude') is not None

        # Unregister it
        registry.unregister('claude')

        # Verify it's gone
        assert 'claude' not in registry.list_formats()
        assert registry.get_adapter('claude') is None

        # copilot should still be there
        assert 'copilot' in registry.list_formats()

    def test_unregister_nonexistent(self, registry):
        """Test unregistering non-existent format doesn't raise error."""
        # Should not raise any exception
        registry.unregister('nonexistent')
        registry.unregister('unknown-format')

        # Existing formats should still be there
        assert 'claude' in registry.list_formats()
        assert 'copilot' in registry.list_formats()


class TestDetectConfigTypesInDirectory:
    """Tests for detect_config_types_in_directory method."""

    @pytest.fixture
    def registry(self):
        """Create FormatRegistry with some adapters."""
        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())
        return registry

    def test_empty_directory(self, registry, tmp_path):
        """Test detection in empty directory returns empty dict."""
        result = registry.detect_config_types_in_directory(tmp_path, 'claude')
        assert result == {}

    def test_nonexistent_format(self, registry, tmp_path):
        """Test detection with non-existent format returns empty dict."""
        result = registry.detect_config_types_in_directory(tmp_path, 'nonexistent')
        assert result == {}

    def test_nonexistent_directory(self, registry):
        """Test detection in non-existent directory returns empty dict."""
        result = registry.detect_config_types_in_directory(Path('/nonexistent/path'), 'claude')
        assert result == {}

    def test_detect_claude_agents_only(self, registry, tmp_path):
        """Test detection when only Claude agent files exist."""
        # Create agents subdirectory with agent files
        agents_dir = tmp_path / 'agents'
        agents_dir.mkdir()
        (agents_dir / 'agent1.md').write_text('---\nname: a1\n---\n')
        (agents_dir / 'agent2.md').write_text('---\nname: a2\n---\n')

        result = registry.detect_config_types_in_directory(tmp_path, 'claude')

        assert ConfigType.AGENT in result
        assert result[ConfigType.AGENT] == 2

    def test_detect_claude_permissions_only(self, registry, tmp_path):
        """Test detection when only permission file exists."""
        (tmp_path / 'settings.json').write_text('{"permissions":{}}')

        result = registry.detect_config_types_in_directory(tmp_path, 'claude')

        assert ConfigType.PERMISSION in result
        assert result[ConfigType.PERMISSION] == 1

    def test_detect_claude_slash_commands_only(self, registry, tmp_path):
        """Test detection when only slash command files exist."""
        commands_dir = tmp_path / 'commands'
        commands_dir.mkdir()
        (commands_dir / 'cmd1.md').write_text('---\nname: cmd1\n---\n')
        (commands_dir / 'cmd2.md').write_text('---\nname: cmd2\n---\n')

        result = registry.detect_config_types_in_directory(tmp_path, 'claude')

        assert ConfigType.SLASH_COMMAND in result
        assert result[ConfigType.SLASH_COMMAND] == 2

    def test_detect_claude_mixed_config_types(self, registry, tmp_path):
        """Test detection with multiple config types present."""
        # Create agents
        agents_dir = tmp_path / 'agents'
        agents_dir.mkdir()
        (agents_dir / 'agent.md').write_text('---\nname: test\n---\n')

        # Create permission
        (tmp_path / 'settings.json').write_text('{}')

        # Create commands
        commands_dir = tmp_path / 'commands'
        commands_dir.mkdir()
        (commands_dir / 'cmd.md').write_text('---\nname: cmd\n---\n')

        result = registry.detect_config_types_in_directory(tmp_path, 'claude')

        assert len(result) == 3
        assert result[ConfigType.AGENT] == 1
        assert result[ConfigType.PERMISSION] == 1
        assert result[ConfigType.SLASH_COMMAND] == 1

    def test_unknown_file_types_ignored(self, registry, tmp_path):
        """Test that non-format files are ignored."""
        (tmp_path / 'readme.txt').write_text('random text')
        (tmp_path / 'script.py').write_text('print("hi")')

        result = registry.detect_config_types_in_directory(tmp_path, 'claude')

        assert result == {}

    def test_detect_copilot_agents(self, registry, tmp_path):
        """Test detection of Copilot agent files (VS Code uses prompts/ for agents)."""
        prompts_dir = tmp_path / 'prompts'
        prompts_dir.mkdir()
        (prompts_dir / 'agent1.agent.md').write_text('---\nname: a1\n---\n')
        (prompts_dir / 'agent2.agent.md').write_text('---\nname: a2\n---\n')

        result = registry.detect_config_types_in_directory(tmp_path, 'copilot')

        assert ConfigType.AGENT in result
        assert result[ConfigType.AGENT] == 2

    def test_detect_copilot_permissions(self, registry, tmp_path):
        """Test detection of Copilot permission files."""
        (tmp_path / 'settings.perm.json').write_text('{}')

        result = registry.detect_config_types_in_directory(tmp_path, 'copilot')

        assert ConfigType.PERMISSION in result
        assert result[ConfigType.PERMISSION] == 1

    def test_detect_copilot_prompts(self, registry, tmp_path):
        """Test detection of Copilot prompt files."""
        prompts_dir = tmp_path / 'prompts'
        prompts_dir.mkdir()
        (prompts_dir / 'cmd1.prompt.md').write_text('---\nname: cmd1\n---\n')
        (prompts_dir / 'cmd2.prompt.md').write_text('---\nname: cmd2\n---\n')

        result = registry.detect_config_types_in_directory(tmp_path, 'copilot')

        assert ConfigType.SLASH_COMMAND in result
        assert result[ConfigType.SLASH_COMMAND] == 2

    def test_only_nonzero_counts_included(self, registry, tmp_path):
        """Test that only config types with matches are included in result."""
        # Create only agents
        agents_dir = tmp_path / 'agents'
        agents_dir.mkdir()
        (agents_dir / 'agent.md').write_text('---\nname: test\n---\n')

        result = registry.detect_config_types_in_directory(tmp_path, 'claude')

        # Should only contain AGENT, not PERMISSION or SLASH_COMMAND
        assert len(result) == 1
        assert ConfigType.AGENT in result
        assert ConfigType.PERMISSION not in result
        assert ConfigType.SLASH_COMMAND not in result
