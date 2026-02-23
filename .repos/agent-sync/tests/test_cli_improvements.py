"""
Tests for CLI improvements and bug fixes from issue #78.
"""

import pytest
import sys
import io
import os
from pathlib import Path
from unittest.mock import patch, MagicMock

from cli.main import main, EXIT_SUCCESS, EXIT_ERROR, VERSION
from core.canonical_models import ConfigType
from core.registry import FormatRegistry
from core.adapter_interface import FormatAdapter


class MockAdapter(FormatAdapter):
    """Mock adapter for testing dynamic choices."""
    @property
    def format_name(self) -> str: return "mock"
    @property
    def file_extension(self) -> str: return ".mock"
    def get_file_extension(self, config_type: ConfigType) -> str: return ".mock"
    def can_handle(self, file_path: Path) -> bool: return file_path.suffix == ".mock"
    def read(self, file_path: Path, config_type: ConfigType): return MagicMock()
    def write(self, canonical, file_path: Path, config_type: ConfigType, options=None): pass
    def from_canonical(self, canonical, config_type: ConfigType, options=None): return "mock content"
    def to_canonical(self, content: str, config_type: ConfigType): return MagicMock()
    @property
    def supported_config_types(self): return [ConfigType.AGENT, ConfigType.PERMISSION, ConfigType.SLASH_COMMAND]


class TestCLIImprovements:
    """Tests for CLI improvements and bug fixes."""

    def test_version_flag(self, capsys):
        """Test --version flag outputs correct version and exits."""
        with pytest.raises(SystemExit) as e:
            main(['--version'])
        
        assert e.value.code == 0
        captured = capsys.readouterr()
        assert VERSION in captured.out

    def test_same_source_output_error(self, tmp_path, capsys):
        """Test error when source and output files are the same."""
        source_file = tmp_path / "test.agent.md"
        source_file.write_text("content")
        
        # Explicit same path
        result = main([
            '--convert-file', str(source_file),
            '--output', str(source_file),
            '--target-format', 'copilot'
        ])
        assert result == EXIT_ERROR
        captured = capsys.readouterr()
        assert "Error: Source and output files are the same" in captured.err

    def test_auto_generated_extension_agent(self, tmp_path):
        """Test auto-generated extension for AGENT config type."""
        source_file = tmp_path / "my-agent.md"
        source_file.write_text("content")
        
        # Claude (auto-detect) -> Copilot
        # Expected: my-agent.agent.md
        with patch('adapters.ClaudeAdapter.read', return_value=MagicMock()):
            with patch('adapters.CopilotAdapter.from_canonical', return_value="content"):
                result = main([
                    '--convert-file', str(source_file),
                    '--target-format', 'copilot',
                    '--only', 'agents'
                ])
                assert result == EXIT_SUCCESS
                assert (tmp_path / "my-agent.agent.md").exists()

    def test_auto_generated_extension_permission(self, tmp_path):
        """Test auto-generated extension for PERMISSION config type."""
        source_file = tmp_path / "settings.json"
        source_file.write_text("{}")
        
        # Claude (auto-detect) -> Copilot
        # Expected: settings.perm.json
        with patch('adapters.ClaudeAdapter.read', return_value=MagicMock()):
            with patch('adapters.CopilotAdapter.from_canonical', return_value="{}"):
                result = main([
                    '--convert-file', str(source_file),
                    '--target-format', 'copilot',
                    '--only', 'permissions'
                ])
                assert result == EXIT_SUCCESS
                assert (tmp_path / "settings.perm.json").exists()

    def test_auto_generated_extension_slash_command(self, tmp_path):
        """Test auto-generated extension for SLASH_COMMAND config type."""
        source_file = tmp_path / "command.md"
        source_file.write_text("content")
        
        # Claude (auto-detect) -> Copilot
        # Expected: command.prompt.md
        with patch('adapters.ClaudeAdapter.read', return_value=MagicMock()):
            with patch('adapters.CopilotAdapter.from_canonical', return_value="content"):
                result = main([
                    '--convert-file', str(source_file),
                    '--target-format', 'copilot',
                    '--only', 'commands'
                ])
                assert result == EXIT_SUCCESS
                assert (tmp_path / "command.prompt.md").exists()

    def test_multi_part_extension_removal(self, tmp_path):
        """Test that multi-part extensions are correctly removed before adding new one."""
        # Case 1: .agent.md -> .agent.md (e.g. Copilot -> Claude -> Copilot)
        source_file = tmp_path / "test.agent.md"
        source_file.write_text("content")
        
        with patch('adapters.CopilotAdapter.read', return_value=MagicMock()):
            with patch('adapters.ClaudeAdapter.from_canonical', return_value="content"):
                # Copilot -> Claude
                # Expected: test.md (Claude extension is .md)
                result = main([
                    '--convert-file', str(source_file),
                    '--target-format', 'claude',
                    '--only', 'agents'
                ])
                assert result == EXIT_SUCCESS
                assert (tmp_path / "test.md").exists()

        # Case 2: .prompt.md -> .md
        source_file = tmp_path / "cmd.prompt.md"
        source_file.write_text("content")
        with patch('adapters.CopilotAdapter.read', return_value=MagicMock()):
            with patch('adapters.ClaudeAdapter.from_canonical', return_value="content"):
                result = main([
                    '--convert-file', str(source_file),
                    '--target-format', 'claude',
                    '--only', 'commands'
                ])
                assert result == EXIT_SUCCESS
                assert (tmp_path / "cmd.md").exists()

    def test_dynamic_format_choices(self, capsys):
        """Test that format choices are dynamically loaded from registry."""
        with patch.object(sys.modules['cli.main'], 'setup_registry') as mock_setup:
            registry = FormatRegistry()
            registry.register(MockAdapter())
            mock_setup.return_value = registry
            
            # Should accept 'mock' as a choice
            # We use --help to check if it's in the choices listed
            with patch('sys.argv', ['main.py', '--help']):
                with pytest.raises(SystemExit):
                    main(['--help'])
            
            captured = capsys.readouterr()
            assert "mock" in captured.out

    def test_progress_indication(self, tmp_path, capsys):
        """Test that progress indication is printed during directory sync."""
        source_dir = tmp_path / "source"
        source_dir.mkdir()
        target_dir = tmp_path / "target"
        target_dir.mkdir()
        
        # Create 2 files to sync
        (source_dir / "a.md").write_text("content")
        (source_dir / "b.md").write_text("content")
        
        # Mock orchestrator to avoid actual heavy lifting but keep progress logic
        # Actually, let's just run it with mocks for adapters
        with patch('adapters.ClaudeAdapter.read', return_value=MagicMock()):
            with patch('adapters.CopilotAdapter.write'):
                # Redirect stdout to capture progress
                f = io.StringIO()
                with patch('sys.stdout', f):
                    result = main([
                        '--source-dir', str(source_dir),
                        '--target-dir', str(target_dir),
                        '--source-format', 'claude',
                        '--target-format', 'copilot',
                        '--only', 'agents'  # Explicit config type to use single-type mode
                    ])
                
                output = f.getvalue()
                assert "Processing: [1/2]" in output
                assert "Processing: [2/2]" in output

    def test_keyboard_interrupt_handling(self, tmp_path, capsys):
        """Test that KeyboardInterrupt is handled gracefully in file mode."""
        source_file = tmp_path / "test.md"
        source_file.write_text("content")
        
        with patch('adapters.ClaudeAdapter.read', side_effect=KeyboardInterrupt):
            result = main([
                '--convert-file', str(source_file),
                '--target-format', 'copilot'
            ])
            assert result == EXIT_ERROR
            captured = capsys.readouterr()
            assert "Conversion cancelled by user" in captured.err

    def test_write_permission_validation(self, tmp_path, capsys):
        """Test error message when writing to read-only directory."""
        if os.name == 'nt':
            pytest.skip("Permission tests are tricky on Windows")
            
        source_file = tmp_path / "test.md"
        source_file.write_text("content")
        
        readonly_dir = tmp_path / "readonly"
        readonly_dir.mkdir()
        readonly_dir.chmod(0o555) # Read & execute, no write
        
        output_file = readonly_dir / "output.md"
        
        try:
            with patch('adapters.ClaudeAdapter.read', return_value=MagicMock()):
                with patch('adapters.CopilotAdapter.from_canonical', return_value="content"):
                    result = main([
                        '--convert-file', str(source_file),
                        '--output', str(output_file),
                        '--target-format', 'copilot'
                    ])
                    assert result == EXIT_ERROR
                    captured = capsys.readouterr()
                    assert "Permission denied" in captured.err
        finally:
            readonly_dir.chmod(0o777)

    def test_verbose_note_on_error(self, tmp_path, capsys):
        """Test that error messages suggest --verbose when not in verbose mode."""
        source_file = tmp_path / "test.md"
        source_file.write_text("content")
        
        with patch('adapters.ClaudeAdapter.read', side_effect=ValueError("Specific error")):
            result = main([
                '--convert-file', str(source_file),
                '--target-format', 'copilot'
            ])
            assert result == EXIT_ERROR
            captured = capsys.readouterr()
            assert "Run with --verbose for detailed traceback" in captured.err
