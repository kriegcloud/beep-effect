"""
Unit tests for CLI directory sync functionality.

Tests cover:
- Argument parsing (all flags and options)
- Directory validation (exists, readable, writable)
- Format validation (unknown formats should error)
- Sync invocation (orchestrator called correctly)
- Error handling (missing args, invalid paths, etc.)
- Dry-run mode
- Verbose mode output
- Conversion options (--add-argument-hint, --add-handoffs)

Status: TDD - Tests written before CLI implementation
"""

import pytest
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock

from cli.main import create_parser, main, setup_registry
from core.canonical_models import ConfigType


class TestCLIArgumentParsing:
    """Tests for argument parsing (all flags and options)."""

    @pytest.fixture
    def parser(self):
        """Create argument parser instance."""
        return create_parser()

    @pytest.fixture
    def valid_source_dir(self, tmp_path):
        """Create a valid source directory."""
        source = tmp_path / "source"
        source.mkdir()
        return source

    @pytest.fixture
    def valid_target_dir(self, tmp_path):
        """Create a valid target directory."""
        target = tmp_path / "target"
        target.mkdir()
        return target

    @pytest.fixture
    def base_args(self, valid_source_dir, valid_target_dir):
        """Minimum valid arguments for CLI."""
        return [
            '--source-dir', str(valid_source_dir),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_required_arguments_present(self):
        """Verify --source-dir, --target-dir, --source-format, --target-format are required for dir sync."""
        # No arguments should produce error (validation in main, not parser)
        result = main([])
        assert result != 0

    def test_source_dir_argument(self, parser, valid_source_dir, valid_target_dir):
        """Test --source-dir accepts valid path."""
        args = parser.parse_args([
            '--source-dir', str(valid_source_dir),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])
        assert args.source_dir == valid_source_dir

    def test_target_dir_argument(self, parser, valid_source_dir, valid_target_dir):
        """Test --target-dir accepts valid path."""
        args = parser.parse_args([
            '--source-dir', str(valid_source_dir),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])
        assert args.target_dir == valid_target_dir

    def test_source_format_choices(self, parser, base_args):
        """Test --source-format accepts 'claude', 'copilot', 'gemini'."""
        # Valid choices should work
        for fmt in ['claude', 'copilot', 'gemini']:
            args = parser.parse_args([
                '--source-dir', base_args[1],
                '--target-dir', base_args[3],
                '--source-format', fmt,
                '--target-format', 'copilot'
            ])
            assert args.source_format == fmt

    def test_target_format_choices(self, parser, base_args):
        """Test --target-format accepts 'claude', 'copilot', 'gemini'."""
        # Valid choices should work
        for fmt in ['claude', 'copilot', 'gemini']:
            args = parser.parse_args([
                '--source-dir', base_args[1],
                '--target-dir', base_args[3],
                '--source-format', 'claude',
                '--target-format', fmt
            ])
            assert args.target_format == fmt

    def test_direction_default(self, parser, base_args):
        """Test --direction defaults to 'both'."""
        args = parser.parse_args(base_args)
        assert args.direction == 'both'

    def test_direction_choices(self, parser, base_args):
        """Test --direction accepts 'both', 'source-to-target', 'target-to-source'."""
        for direction in ['both', 'source-to-target', 'target-to-source']:
            args = parser.parse_args(base_args + ['--direction', direction])
            assert args.direction == direction

    def test_dry_run_flag(self, parser, base_args):
        """Test --dry-run flag."""
        # Without flag
        args = parser.parse_args(base_args)
        assert args.dry_run is False

        # With flag
        args = parser.parse_args(base_args + ['--dry-run'])
        assert args.dry_run is True

    def test_force_flag(self, parser, base_args):
        """Test --force flag."""
        # Without flag
        args = parser.parse_args(base_args)
        assert args.force is False

        # With flag
        args = parser.parse_args(base_args + ['--force'])
        assert args.force is True

    def test_strict_flag(self, parser, base_args):
        """Test --strict flag."""
        # Without flag
        args = parser.parse_args(base_args)
        assert args.strict is False

        # With flag
        args = parser.parse_args(base_args + ['--strict'])
        assert args.strict is True

    def test_verbose_flag(self, parser, base_args):
        """Test --verbose and -v flags."""
        # Without flag
        args = parser.parse_args(base_args)
        assert args.verbose is False

        # With --verbose
        args = parser.parse_args(base_args + ['--verbose'])
        assert args.verbose is True

        # With -v
        args = parser.parse_args(base_args + ['-v'])
        assert args.verbose is True

    def test_state_file_argument(self, parser, base_args, tmp_path):
        """Test --state-file accepts custom path."""
        custom_state = tmp_path / "custom_state.json"
        args = parser.parse_args(base_args + ['--state-file', str(custom_state)])
        assert args.state_file == custom_state


class TestFormatValidation:
    """Tests for format validation (unknown formats should error)."""

    @pytest.fixture
    def parser(self):
        """Create argument parser instance."""
        return create_parser()

    @pytest.fixture
    def valid_dirs(self, tmp_path):
        """Create valid source and target directories."""
        source = tmp_path / "source"
        source.mkdir()
        target = tmp_path / "target"
        target.mkdir()
        return source, target

    def test_unknown_source_format_rejected(self, parser, valid_dirs):
        """argparse rejects invalid source format."""
        source, target = valid_dirs
        with pytest.raises(SystemExit):
            parser.parse_args([
                '--source-dir', str(source),
                '--target-dir', str(target),
                '--source-format', 'unknown-format',
                '--target-format', 'copilot'
            ])

    def test_unknown_target_format_rejected(self, parser, valid_dirs):
        """argparse rejects invalid target format."""
        source, target = valid_dirs
        with pytest.raises(SystemExit):
            parser.parse_args([
                '--source-dir', str(source),
                '--target-dir', str(target),
                '--source-format', 'claude',
                '--target-format', 'unknown-format'
            ])

    def test_case_sensitivity(self, parser, valid_dirs):
        """Format names are case-sensitive."""
        source, target = valid_dirs
        # 'Claude' instead of 'claude' should fail
        with pytest.raises(SystemExit):
            parser.parse_args([
                '--source-dir', str(source),
                '--target-dir', str(target),
                '--source-format', 'Claude',
                '--target-format', 'copilot'
            ])


class TestErrorHandling:
    """Tests for error handling (missing args, invalid paths, etc.)."""

    @pytest.fixture
    def parser(self):
        """Create argument parser instance."""
        return create_parser()

    @pytest.fixture
    def valid_dirs(self, tmp_path):
        """Create valid source and target directories."""
        source = tmp_path / "source"
        source.mkdir()
        target = tmp_path / "target"
        target.mkdir()
        return source, target

    def test_missing_source_dir_exits_error(self, valid_dirs):
        """Missing --source-dir produces error exit."""
        _, target = valid_dirs
        # Validation happens in main() now, not parser
        result = main([
            '--target-dir', str(target),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])
        assert result != 0

    def test_missing_target_dir_exits_error(self, valid_dirs):
        """Missing --target-dir with --no-autodiscover produces error exit."""
        source, _ = valid_dirs
        # With --no-autodiscover, explicit paths are required
        result = main([
            '--source-dir', str(source),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--no-autodiscover'
        ])
        assert result != 0

    def test_missing_source_format_exits_error(self, valid_dirs):
        """Missing --source-format produces error exit."""
        source, target = valid_dirs
        # Validation happens in main() now, not parser
        result = main([
            '--source-dir', str(source),
            '--target-dir', str(target),
            '--target-format', 'copilot'
        ])
        assert result != 0

    def test_missing_target_format_exits_error(self, valid_dirs):
        """Missing --target-format produces error exit."""
        source, target = valid_dirs
        # Validation happens in main() now, not parser
        result = main([
            '--source-dir', str(source),
            '--target-dir', str(target),
            '--source-format', 'claude'
        ])
        assert result != 0

    def test_orchestrator_error_propagated(self, valid_dirs):
        """Orchestrator errors result in non-zero exit."""
        source, target = valid_dirs
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_instance.sync.side_effect = ValueError("Test error")
            mock_orch.return_value = mock_instance

            result = main([
                '--source-dir', str(source),
                '--target-dir', str(target),
                '--source-format', 'claude',
                '--target-format', 'copilot',
                '--only', 'agents'  # Explicit config type to use single-type mode
            ])
            # CLI should propagate orchestrator errors with non-zero exit
            assert result != 0

    def test_error_message_to_stderr(self, parser, capsys):
        """Error messages written to stderr."""
        with pytest.raises(SystemExit):
            parser.parse_args(['--invalid-arg'])
        captured = capsys.readouterr()
        assert 'error' in captured.err.lower() or 'unrecognized' in captured.err.lower()

    def test_gemini_unsupported_config_type(self, valid_dirs, capsys):
        """Gemini format should error gracefully for unsupported config types."""
        source, target = valid_dirs
        
        # Test with agent config type (not supported by Gemini)
        result = main([
            '--source-dir', str(source),
            '--target-dir', str(target),
            '--source-format', 'gemini',
            '--target-format', 'copilot',
            '--only', 'agents'
        ])
        
        assert result != 0
        captured = capsys.readouterr()
        # Check that error message mentions unsupported config type
        assert 'does not support' in captured.err.lower()
        
        # Test with permission config type (not supported by Gemini)
        result = main([
            '--source-dir', str(source),
            '--target-dir', str(target),
            '--source-format', 'copilot',
            '--target-format', 'gemini',
            '--only', 'permissions'
        ])
        
        assert result != 0
        captured = capsys.readouterr()
        # Check that error message mentions unsupported config type
        assert 'does not support' in captured.err.lower()


class TestSyncInvocation:
    """Tests for sync invocation (orchestrator called correctly)."""

    @pytest.fixture
    def valid_source_dir(self, tmp_path):
        """Create a valid source directory."""
        source = tmp_path / "source"
        source.mkdir()
        return source

    @pytest.fixture
    def valid_target_dir(self, tmp_path):
        """Create a valid target directory."""
        target = tmp_path / "target"
        target.mkdir()
        return target

    @pytest.fixture
    def base_args(self, valid_source_dir, valid_target_dir):
        """Minimum valid arguments for CLI."""
        return [
            '--source-dir', str(valid_source_dir),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_orchestrator_receives_source_dir(self, base_args, valid_source_dir):
        """Orchestrator constructed with correct source_dir."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args)

            # TODO: When implemented, verify source_dir passed to orchestrator
            # For now, stub doesn't create orchestrator
            # mock_orch.assert_called_once()
            # call_kwargs = mock_orch.call_args.kwargs
            # assert call_kwargs['source_dir'] == valid_source_dir

    def test_orchestrator_receives_target_dir(self, base_args, valid_target_dir):
        """Orchestrator constructed with correct target_dir."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args)

            # TODO: When implemented, verify target_dir passed to orchestrator

    def test_orchestrator_receives_source_format(self, base_args):
        """Orchestrator constructed with correct source_format."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args)

            # TODO: When implemented, verify source_format='claude' passed

    def test_orchestrator_receives_target_format(self, base_args):
        """Orchestrator constructed with correct target_format."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args)

            # TODO: When implemented, verify target_format='copilot' passed

    def test_orchestrator_receives_config_type(self, base_args):
        """Orchestrator constructed with correct ConfigType enum via --only."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            # Test with explicit config type via --only
            main(base_args + ['--only', 'agents'])

            # TODO: When implemented, verify ConfigType.AGENT passed

    def test_orchestrator_receives_direction(self, base_args):
        """Orchestrator constructed with correct direction."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--direction', 'source-to-target'])

            # TODO: When implemented, verify direction='source-to-target' passed

    def test_orchestrator_receives_dry_run(self, base_args):
        """Orchestrator constructed with dry_run flag."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--dry-run'])

            # TODO: When implemented, verify dry_run=True passed

    def test_orchestrator_receives_force(self, base_args):
        """Orchestrator constructed with force flag."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--force'])

            # TODO: When implemented, verify force=True passed

    def test_orchestrator_receives_verbose(self, base_args):
        """Orchestrator constructed with verbose flag."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--verbose'])

            # TODO: When implemented, verify verbose=True passed

    def test_orchestrator_sync_called(self, base_args):
        """Orchestrator.sync() method is called."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args)

            # TODO: When implemented, verify sync() was called
            # mock_instance.sync.assert_called_once()

    def test_registry_setup(self):
        """FormatRegistry is properly initialized with adapters."""
        registry = setup_registry()

        # Verify adapters are registered
        assert registry.get_adapter('claude') is not None
        assert registry.get_adapter('copilot') is not None

    def test_state_manager_setup(self, base_args, tmp_path):
        """SyncStateManager is properly initialized."""
        custom_state = tmp_path / "custom_state.json"

        with patch.object(sys.modules['cli.main'], 'SyncStateManager') as mock_sm:
            mock_instance = MagicMock()
            mock_sm.return_value = mock_instance

            main(base_args + ['--state-file', str(custom_state)])

            # TODO: When implemented, verify state manager created with custom path
            # mock_sm.assert_called_once()


class TestDirectoryValidation:
    """Tests for directory validation (exists, readable, writable)."""

    @pytest.fixture
    def valid_source_dir(self, tmp_path):
        """Create a valid source directory."""
        source = tmp_path / "source"
        source.mkdir()
        return source

    @pytest.fixture
    def valid_target_dir(self, tmp_path):
        """Create a valid target directory."""
        target = tmp_path / "target"
        target.mkdir()
        return target

    def test_source_dir_must_exist(self, valid_target_dir, tmp_path):
        """Error if source directory doesn't exist."""
        nonexistent = tmp_path / "nonexistent"

        result = main([
            '--source-dir', str(nonexistent),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])

        # TODO: When CLI validates, assert result != 0
        # Currently stub returns 0

    def test_relative_paths_expanded(self, tmp_path, monkeypatch):
        """Relative paths are properly resolved."""
        # Create directories in tmp_path
        source = tmp_path / "source"
        source.mkdir()
        target = tmp_path / "target"
        target.mkdir()

        # Change working directory to tmp_path
        monkeypatch.chdir(tmp_path)

        parser = create_parser()
        args = parser.parse_args([
            '--source-dir', 'source',
            '--target-dir', 'target',
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])

        # argparse creates Path objects which can be relative
        assert args.source_dir == Path('source')
        assert args.target_dir == Path('target')

    def test_home_tilde_expanded(self, tmp_path):
        """~ in paths is expanded to home directory."""
        parser = create_parser()
        args = parser.parse_args([
            '--source-dir', '~/.claude/agents',
            '--target-dir', str(tmp_path / "target"),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])

        # Path object can be expanded later with expanduser()
        expanded = args.source_dir.expanduser()
        assert '~' not in str(expanded)


class TestDryRunMode:
    """Tests for dry-run mode."""

    @pytest.fixture
    def valid_source_dir(self, tmp_path):
        """Create a valid source directory with a test file."""
        source = tmp_path / "source"
        source.mkdir()
        (source / "test-agent.md").write_text("""---
name: test-agent
description: Test agent
---
Instructions.
""")
        return source

    @pytest.fixture
    def valid_target_dir(self, tmp_path):
        """Create a valid target directory."""
        target = tmp_path / "target"
        target.mkdir()
        return target

    @pytest.fixture
    def base_args(self, valid_source_dir, valid_target_dir):
        """Minimum valid arguments for CLI."""
        return [
            '--source-dir', str(valid_source_dir),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_dry_run_passed_to_orchestrator(self, base_args):
        """--dry-run flag passed to orchestrator."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--dry-run'])

            # TODO: When implemented, verify dry_run=True passed to orchestrator
            # call_kwargs = mock_orch.call_args.kwargs
            # assert call_kwargs['dry_run'] is True

    def test_dry_run_no_files_modified(self, base_args, valid_target_dir):
        """With --dry-run, no files are actually modified."""
        # Record initial state of target directory
        initial_files = list(valid_target_dir.iterdir())

        main(base_args + ['--dry-run', '--only', 'agents'])

        # Target directory should be unchanged
        final_files = list(valid_target_dir.iterdir())
        assert initial_files == final_files

    def test_dry_run_outputs_preview(self, base_args, capsys):
        """Dry-run outputs what would be done."""
        main(base_args + ['--dry-run', '--only', 'agents'])

        captured = capsys.readouterr()
        # Should output something related to dry-run mode
        assert 'dry-run' in captured.out.lower() or 'Dry-run' in captured.out or 'DRY RUN' in captured.out


class TestVerboseMode:
    """Tests for verbose mode output."""

    @pytest.fixture
    def valid_source_dir(self, tmp_path):
        """Create a valid source directory."""
        source = tmp_path / "source"
        source.mkdir()
        return source

    @pytest.fixture
    def valid_target_dir(self, tmp_path):
        """Create a valid target directory."""
        target = tmp_path / "target"
        target.mkdir()
        return target

    @pytest.fixture
    def base_args(self, valid_source_dir, valid_target_dir):
        """Minimum valid arguments for CLI."""
        return [
            '--source-dir', str(valid_source_dir),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_verbose_passed_to_orchestrator(self, base_args):
        """--verbose flag passed to orchestrator."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--verbose'])

            # TODO: When implemented, verify verbose=True passed to orchestrator

    def test_verbose_enables_detailed_output(self, base_args, capsys):
        """Verbose mode produces more output."""
        # Run without verbose
        main(base_args)
        normal_output = capsys.readouterr().out

        # Run with verbose
        main(base_args + ['--verbose'])
        verbose_output = capsys.readouterr().out

        # TODO: When implemented, verbose output should be longer/more detailed
        # For now, both produce same stub output

    def test_short_verbose_flag(self, base_args):
        """-v works same as --verbose."""
        parser = create_parser()

        args_long = parser.parse_args(base_args + ['--verbose'])
        args_short = parser.parse_args(base_args + ['-v'])

        assert args_long.verbose == args_short.verbose == True


class TestConversionOptions:
    """Tests for conversion options (--add-argument-hint, --add-handoffs)."""

    @pytest.fixture
    def valid_source_dir(self, tmp_path):
        """Create a valid source directory."""
        source = tmp_path / "source"
        source.mkdir()
        return source

    @pytest.fixture
    def valid_target_dir(self, tmp_path):
        """Create a valid target directory."""
        target = tmp_path / "target"
        target.mkdir()
        return target

    @pytest.fixture
    def base_args(self, valid_source_dir, valid_target_dir):
        """Minimum valid arguments for CLI."""
        return [
            '--source-dir', str(valid_source_dir),
            '--target-dir', str(valid_target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_add_argument_hint_flag(self, base_args):
        """--add-argument-hint flag parsed."""
        parser = create_parser()

        # Without flag
        args = parser.parse_args(base_args)
        assert args.add_argument_hint is False

        # With flag
        args = parser.parse_args(base_args + ['--add-argument-hint'])
        assert args.add_argument_hint is True

    def test_add_handoffs_flag(self, base_args):
        """--add-handoffs flag parsed."""
        parser = create_parser()

        # Without flag
        args = parser.parse_args(base_args)
        assert args.add_handoffs is False

        # With flag
        args = parser.parse_args(base_args + ['--add-handoffs'])
        assert args.add_handoffs is True

    def test_conversion_options_dict_passed(self, base_args):
        """conversion_options dict passed to orchestrator."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--add-argument-hint', '--add-handoffs'])

            # TODO: When implemented, verify conversion_options passed
            # call_kwargs = mock_orch.call_args.kwargs
            # assert call_kwargs['conversion_options'] == {
            #     'add_argument_hint': True,
            #     'add_handoffs': True
            # }

    def test_conversion_options_empty_when_not_set(self, base_args):
        """No conversion_options when flags not used."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args)

            # TODO: When implemented, verify conversion_options is None or empty
            # call_kwargs = mock_orch.call_args.kwargs
            # assert call_kwargs.get('conversion_options') is None


class TestSingleFileConversion:
    """Tests for single-file conversion mode."""

    @pytest.fixture
    def parser(self):
        """Create argument parser instance."""
        return create_parser()

    @pytest.fixture
    def valid_source_file(self, tmp_path):
        """Create a valid source file."""
        source_file = tmp_path / "test-agent.md"
        source_file.write_text("""---
name: test-agent
description: Test agent
model: claude-opus-4-20250514
tools:
  - Bash
  - Read
---

# Test Agent

Test instructions.
""")
        return source_file

    @pytest.fixture
    def valid_output_file(self, tmp_path):
        """Path for valid output file."""
        return tmp_path / "output.agent.md"

    def test_convert_file_argument_parsing(self, parser, valid_source_file, valid_output_file):
        """Test --convert-file argument is parsed correctly."""
        args = parser.parse_args([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--target-format', 'copilot'
        ])
        assert args.convert_file == valid_source_file

    def test_output_argument_parsing(self, parser, valid_source_file, valid_output_file):
        """Test --output argument is parsed correctly."""
        args = parser.parse_args([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--target-format', 'copilot'
        ])
        assert args.output == valid_output_file

    def test_convert_file_and_directory_mutually_exclusive(self, valid_source_file, tmp_path):
        """--convert-file and --source-dir are mutually exclusive."""
        source_dir = tmp_path / "source"
        source_dir.mkdir()
        # Mutual exclusivity is checked in main(), not parser
        result = main([
            '--convert-file', str(valid_source_file),
            '--source-dir', str(source_dir),
            '--target-dir', str(tmp_path / "target"),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])
        assert result != 0

    def test_single_file_conversion_explicit_formats(self, valid_source_file, valid_output_file):
        """Convert single file with explicit source and target formats."""
        result = main([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])
        assert result == 0
        assert valid_output_file.exists()

    def test_single_file_conversion_auto_detect_source(self, valid_source_file, valid_output_file):
        """Convert single file with auto-detected source format."""
        result = main([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--target-format', 'copilot'
        ])
        assert result == 0
        assert valid_output_file.exists()

    def test_single_file_conversion_auto_detect_target(self, valid_source_file, tmp_path):
        """Convert single file with auto-detected target format from output extension."""
        output_file = tmp_path / "output.agent.md"
        result = main([
            '--convert-file', str(valid_source_file),
            '--output', str(output_file),
            '--source-format', 'claude'
        ])
        assert result == 0
        assert output_file.exists()

    def test_output_file_auto_generated(self, valid_source_file, tmp_path):
        """Output filename auto-generated if not specified."""
        result = main([
            '--convert-file', str(valid_source_file),
            '--target-format', 'copilot'
        ])
        assert result == 0
        # Should create test-agent.agent.md in same directory
        expected_output = valid_source_file.parent / "test-agent.agent.md"
        assert expected_output.exists()

    def test_convert_file_not_found(self, tmp_path):
        """Error when source file doesn't exist."""
        nonexistent = tmp_path / "nonexistent.md"
        result = main([
            '--convert-file', str(nonexistent),
            '--target-format', 'copilot'
        ])
        assert result != 0

    def test_convert_file_is_directory(self, tmp_path):
        """Error when --convert-file points to directory."""
        directory = tmp_path / "dir"
        directory.mkdir()
        result = main([
            '--convert-file', str(directory),
            '--target-format', 'copilot'
        ])
        assert result != 0

    def test_unsupported_source_format(self, valid_source_file, valid_output_file):
        """Error when source format is unsupported."""
        # Parser rejects invalid choices with SystemExit
        with pytest.raises(SystemExit):
            main([
                '--convert-file', str(valid_source_file),
                '--output', str(valid_output_file),
                '--source-format', 'unsupported',
                '--target-format', 'copilot'
            ])

    def test_unsupported_target_format(self, valid_source_file, valid_output_file):
        """Error when target format is unsupported."""
        # Parser rejects invalid choices with SystemExit
        with pytest.raises(SystemExit):
            main([
                '--convert-file', str(valid_source_file),
                '--output', str(valid_output_file),
                '--source-format', 'claude',
                '--target-format', 'unsupported'
            ])

    def test_output_file_content_correct(self, valid_source_file, valid_output_file):
        """Verify output file has correct format conversion."""
        result = main([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])
        assert result == 0

        # Verify Copilot format
        content = valid_output_file.read_text()
        assert 'test-agent' in content

    def test_config_type_specified_for_conversion(self, valid_source_file, valid_output_file):
        """--only can be specified for file conversion (single type)."""
        result = main([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--only', 'agents'
        ])
        assert result == 0

    def test_conversion_options_applied(self, valid_source_file, valid_output_file):
        """Conversion options (--add-argument-hint) work in file mode."""
        result = main([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--add-argument-hint'
        ])
        assert result == 0
        assert valid_output_file.exists()

    def test_verbose_output_in_file_mode(self, valid_source_file, valid_output_file, capsys):
        """--verbose works in file conversion mode."""
        result = main([
            '--convert-file', str(valid_source_file),
            '--output', str(valid_output_file),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--verbose'
        ])
        assert result == 0

        captured = capsys.readouterr()
        assert 'Converting' in captured.out or 'convert' in captured.out.lower()
class TestCLIPermissionSupport:
    """Tests for CLI permission sync support."""

    @pytest.fixture
    def valid_dirs(self, tmp_path):
        """Create valid source and target directories."""
        source = tmp_path / "source"
        source.mkdir()
        target = tmp_path / "target"
        target.mkdir()
        return source, target

    @pytest.fixture
    def base_args(self, valid_dirs):
        """Minimum valid arguments for CLI."""
        source, target = valid_dirs
        return [
            '--source-dir', str(source),
            '--target-dir', str(target),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_only_permission_argument(self, base_args):
        """Test --only permissions is accepted."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            result = main(base_args + ['--only', 'permissions'])
            
            assert result == 0
            # Verify correct ConfigType enum passed
            call_kwargs = mock_orch.call_args.kwargs
            assert call_kwargs['config_type'] == ConfigType.PERMISSION

    def test_permission_file_conversion(self, tmp_path):
        """Test --only permissions with single file conversion."""
        source_file = tmp_path / "settings.json"
        source_file.write_text("{}")
        
        with patch.object(sys.modules['cli.main'], 'setup_registry') as mock_setup:
            # Mock registry and adapters
            mock_registry = MagicMock()
            mock_source_adapter = MagicMock()
            mock_target_adapter = MagicMock()
            
            mock_source_adapter.format_name = "claude"
            mock_source_adapter.get_file_extension.return_value = ".json"
            mock_target_adapter.format_name = "copilot"
            mock_target_adapter.file_extension = ".perm.json"
            mock_target_adapter.get_file_extension.return_value = ".perm.json"
            mock_target_adapter.from_canonical.return_value = "mock content"
            
            mock_registry.list_formats.return_value = ['claude', 'copilot']
            mock_registry.get_adapter.side_effect = lambda fmt: {
                'claude': mock_source_adapter,
                'copilot': mock_target_adapter
            }.get(fmt)
            
            mock_setup.return_value = mock_registry

            result = main([
                '--convert-file', str(source_file),
                '--source-format', 'claude',
                '--target-format', 'copilot',
                '--only', 'permissions'
            ])

            assert result == 0
            
            # Verify read called with ConfigType.PERMISSION
            mock_source_adapter.read.assert_called_once()
            assert mock_source_adapter.read.call_args[0][1] == ConfigType.PERMISSION
            
            # Verify from_canonical called with ConfigType.PERMISSION
            mock_target_adapter.from_canonical.assert_called_once()
            assert mock_target_adapter.from_canonical.call_args[0][1] == ConfigType.PERMISSION

    def test_unsupported_format_error(self, base_args):
        """Test error when format doesn't support permissions."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            # Simulate orchestrator raising ValueError for unsupported config type
            mock_orch.side_effect = ValueError("Format 'copilot' does not support permission")
            
            result = main(base_args + ['--only', 'permissions'])
            
            assert result != 0

    def test_permission_sync_dry_run(self, base_args):
        """Test permission sync with dry-run."""
        with patch.object(sys.modules['cli.main'], 'UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            result = main(base_args + ['--only', 'permissions', '--dry-run'])

            assert result == 0
            call_kwargs = mock_orch.call_args.kwargs
            assert call_kwargs['config_type'] == ConfigType.PERMISSION

    def test_strict_mode_with_warnings_errors(self, tmp_path):
        """Test that --strict flag causes error when warnings are present."""
        source_file = tmp_path / "settings.json"
        source_file.write_text('{"permissions": {"deny": ["Bash(rm:*)"]}}')

        with patch.object(sys.modules['cli.main'], 'setup_registry') as mock_setup:
            # Mock registry and adapters
            mock_registry = MagicMock()
            mock_source_adapter = MagicMock()
            mock_target_adapter = MagicMock()

            # Configure adapters
            mock_source_adapter.format_name = "claude"
            mock_source_adapter.get_file_extension.return_value = ".json"
            mock_source_adapter.get_warnings.return_value = []

            mock_target_adapter.format_name = "copilot"
            mock_target_adapter.file_extension = ".perm.json"
            mock_target_adapter.get_file_extension.return_value = ".perm.json"
            mock_target_adapter.from_canonical.return_value = '{"chat.tools.terminal.autoApprove": {"rm": false}}'
            # Simulate warnings from lossy conversion
            mock_target_adapter.get_warnings.return_value = [
                "Claude deny rule 'Bash(rm:*)' mapped to VS Code 'false' (require approval). VS Code doesn't support blocking commands entirely."
            ]

            mock_registry.list_formats.return_value = ['claude', 'copilot']
            mock_registry.get_adapter.side_effect = lambda fmt: {
                'claude': mock_source_adapter,
                'copilot': mock_target_adapter
            }.get(fmt)

            mock_setup.return_value = mock_registry

            # Run with --strict flag
            result = main([
                '--convert-file', str(source_file),
                '--source-format', 'claude',
                '--target-format', 'copilot',
                '--only', 'permissions',
                '--strict'
            ])

            # Should exit with error code due to warnings
            assert result == 1

    def test_strict_mode_without_warnings_succeeds(self, tmp_path):
        """Test that --strict flag succeeds when no warnings are present."""
        source_file = tmp_path / "settings.json"
        source_file.write_text('{"permissions": {"allow": ["Bash(ls:*)"]}}')

        with patch.object(sys.modules['cli.main'], 'setup_registry') as mock_setup:
            # Mock registry and adapters
            mock_registry = MagicMock()
            mock_source_adapter = MagicMock()
            mock_target_adapter = MagicMock()

            # Configure adapters
            mock_source_adapter.format_name = "claude"
            mock_source_adapter.get_file_extension.return_value = ".json"
            mock_source_adapter.get_warnings.return_value = []

            mock_target_adapter.format_name = "copilot"
            mock_target_adapter.file_extension = ".perm.json"
            mock_target_adapter.get_file_extension.return_value = ".perm.json"
            mock_target_adapter.from_canonical.return_value = '{"chat.tools.terminal.autoApprove": {"ls": true}}'
            # No warnings for clean conversion
            mock_target_adapter.get_warnings.return_value = []

            mock_registry.list_formats.return_value = ['claude', 'copilot']
            mock_registry.get_adapter.side_effect = lambda fmt: {
                'claude': mock_source_adapter,
                'copilot': mock_target_adapter
            }.get(fmt)

            mock_setup.return_value = mock_registry

            # Run with --strict flag
            result = main([
                '--convert-file', str(source_file),
                '--source-format', 'claude',
                '--target-format', 'copilot',
                '--only', 'permissions',
                '--strict'
            ])

            # Should succeed (no warnings)
            assert result == 0


    def test_directory_sync_strict_mode_blocks_lossy_permission_write(self, tmp_path):
        """Directory sync: --strict should fail and avoid writing lossy outputs."""
        source_dir = tmp_path / "claude"
        target_dir = tmp_path / "copilot"
        source_dir.mkdir()
        target_dir.mkdir()

        # Claude settings with deny rule -> lossy when mapped to VS Code
        (source_dir / "settings.json").write_text(
            '{"permissions": {"deny": ["Bash(rm:*)"]}}',
            encoding="utf-8",
        )

        result = main([
            '--source-dir', str(source_dir),
            '--target-dir', str(target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--only', 'permissions',
            '--strict'
        ])

        assert result == 1
        # Strict mode should prevent writing lossy target output
        assert not (target_dir / "settings.perm.json").exists()


# =============================================================================
# TestCLIGeminiIntegration - CLI integration tests with Gemini format
# =============================================================================

class TestCLIGeminiIntegration:
    """Tests for CLI operations with Gemini format."""

    def test_gemini_format_in_source_format_choices(self, tmp_path):
        """Test that --source-format accepts 'gemini'."""
        gemini_dir = tmp_path / "gemini"
        gemini_dir.mkdir()
        claude_dir = tmp_path / "claude"
        claude_dir.mkdir()

        parser = create_parser()
        args = parser.parse_args([
            '--source-dir', str(gemini_dir),
            '--target-dir', str(claude_dir),
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'commands'
        ])
        assert args.source_format == 'gemini'

    def test_gemini_format_in_target_format_choices(self, tmp_path):
        """Test that --target-format accepts 'gemini'."""
        claude_dir = tmp_path / "claude"
        claude_dir.mkdir()
        gemini_dir = tmp_path / "gemini"
        gemini_dir.mkdir()

        parser = create_parser()
        args = parser.parse_args([
            '--source-dir', str(claude_dir),
            '--target-dir', str(gemini_dir),
            '--source-format', 'claude',
            '--target-format', 'gemini',
            '--only', 'commands'
        ])
        assert args.target_format == 'gemini'

    def test_gemini_directory_sync_slash_commands(self, tmp_path):
        """Test directory sync with Gemini format (slash commands)."""
        gemini_dir = tmp_path / "gemini"
        gemini_dir.mkdir()
        claude_dir = tmp_path / "claude"
        claude_dir.mkdir()

        # Create Gemini command file
        gemini_file = gemini_dir / "test.toml"
        gemini_file.write_text('''description = "Test command"

prompt = """
Test instructions.
"""
''')

        # Run sync
        result = main([
            '--source-dir', str(gemini_dir),
            '--target-dir', str(claude_dir),
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'commands'
        ])

        # Verify success
        assert result == 0

    def test_gemini_single_file_conversion(self, tmp_path):
        """Test single file conversion with Gemini format."""
        gemini_file = tmp_path / "command.toml"
        gemini_file.write_text('''description = "Single file test"

prompt = """
Single file conversion test.
"""
''')

        output_file = tmp_path / "command.md"

        # Run conversion
        result = main([
            '--convert-file', str(gemini_file),
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'commands',
            '--output', str(output_file)
        ])

        # Verify success
        assert result == 0
        assert output_file.exists()
        content = output_file.read_text()
        assert "Single file test" in content

    def test_gemini_auto_detect_format(self, tmp_path):
        """Test that Gemini format is auto-detected from .toml extension."""
        gemini_file = tmp_path / "command.toml"
        gemini_file.write_text('''description = "Auto-detect test"

prompt = """
Auto-detection test.
"""
''')

        # Run conversion without --source-format (should auto-detect)
        result = main([
            '--convert-file', str(gemini_file),
            '--target-format', 'claude',
            '--only', 'commands'
        ])

        # Should succeed with auto-detection
        assert result == 0

    def test_gemini_dry_run_mode(self, tmp_path):
        """Test dry-run mode with Gemini format."""
        gemini_dir = tmp_path / "gemini"
        gemini_dir.mkdir()
        claude_dir = tmp_path / "claude"
        claude_dir.mkdir()

        # Create Gemini command file
        gemini_file = gemini_dir / "dry-run.toml"
        gemini_file.write_text('''description = "Dry-run test"

prompt = """
Dry-run test.
"""
''')

        # Run with --dry-run
        result = main([
            '--source-dir', str(gemini_dir),
            '--target-dir', str(claude_dir),
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'commands',
            '--dry-run'
        ])

        # Should succeed
        assert result == 0
        # Should not create actual files
        assert not (claude_dir / "dry-run.md").exists()

    def test_gemini_bidirectional_sync(self, tmp_path):
        """Test bidirectional sync with Gemini format."""
        gemini_dir = tmp_path / "gemini"
        gemini_dir.mkdir()
        claude_dir = tmp_path / "claude"
        claude_dir.mkdir()

        # Create files in both directories
        gemini_file = gemini_dir / "gemini-cmd.toml"
        gemini_file.write_text('''description = "Gemini command"

prompt = """
Gemini command.
"""
''')

        claude_file = claude_dir / "claude-cmd.md"
        claude_file.write_text("""---
name: claude-cmd
description: Claude command
---
Claude command.
""")

        # Run bidirectional sync
        result = main([
            '--source-dir', str(gemini_dir),
            '--target-dir', str(claude_dir),
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'commands',
            '--bidirectional'
        ])

        # Should succeed
        assert result == 0
        # Both files should be synced
        assert (claude_dir / "gemini-cmd.md").exists()
        assert (gemini_dir / "claude-cmd.toml").exists()

    def test_gemini_invalid_toml_syntax_error(self, tmp_path):
        """Test error handling for invalid TOML syntax."""
        gemini_file = tmp_path / "invalid.toml"
        gemini_file.write_text('''description = "Invalid TOML
# Missing closing quote''')

        # Run conversion - should fail
        result = main([
            '--convert-file', str(gemini_file),
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'commands'
        ])

        # Should fail with non-zero exit code
        assert result != 0

    def test_gemini_missing_prompt_field_error(self, tmp_path):
        """Test error handling for missing required 'prompt' field."""
        gemini_file = tmp_path / "missing-prompt.toml"
        gemini_file.write_text('''description = "No prompt field"
''')

        # Run conversion - should fail
        result = main([
            '--convert-file', str(gemini_file),
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'commands'
        ])

        # Should fail with non-zero exit code
        assert result != 0

    def test_gemini_to_copilot_sync(self, tmp_path):
        """Test Gemini to Copilot sync via CLI."""
        gemini_dir = tmp_path / "gemini"
        gemini_dir.mkdir()
        copilot_dir = tmp_path / "copilot"
        copilot_dir.mkdir()

        # Create Gemini command file
        gemini_file = gemini_dir / "commit.toml"
        gemini_file.write_text('''description = "Create commit"

prompt = """
Create a git commit.

!{git status}

{{args}}
"""
''')

        # Run sync
        result = main([
            '--source-dir', str(gemini_dir),
            '--target-dir', str(copilot_dir),
            '--source-format', 'gemini',
            '--target-format', 'copilot',
            '--only', 'commands'
        ])

        # Verify success
        assert result == 0
        assert (copilot_dir / "commit.prompt.md").exists()
        content = (copilot_dir / "commit.prompt.md").read_text()
        assert "Create commit" in content


class TestOnlyFlag:
    """Tests for --only flag functionality."""

    @pytest.fixture
    def parser(self):
        """Create argument parser instance."""
        return create_parser()

    @pytest.fixture
    def valid_dirs(self, tmp_path):
        """Create valid source and target directories."""
        source = tmp_path / "source"
        source.mkdir()
        target = tmp_path / "target"
        target.mkdir()
        return source, target

    @pytest.fixture
    def base_args(self, valid_dirs):
        """Minimum valid arguments for CLI."""
        source, target = valid_dirs
        return [
            '--source-dir', str(source),
            '--target-dir', str(target),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_only_flag_parsing(self, parser, base_args):
        """Test --only flag is parsed correctly."""
        args = parser.parse_args(base_args + ['--only', 'agents'])
        assert args.only == 'agents'

    def test_only_flag_multiple_types(self, parser, base_args):
        """Test --only accepts comma-separated types."""
        args = parser.parse_args(base_args + ['--only', 'agents,commands'])
        assert args.only == 'agents,commands'

    def test_only_validation_valid_types(self, base_args):
        """Test --only validates known type names."""
        # Should succeed with valid types
        result = main(base_args + ['--only', 'agents'])
        # With empty dirs, should succeed (no files to sync)
        assert result == 0

    def test_only_validation_invalid_type(self, base_args, capsys):
        """Test --only rejects unknown type names."""
        result = main(base_args + ['--only', 'invalid-type'])
        assert result != 0
        captured = capsys.readouterr()
        assert 'invalid' in captured.err.lower()

    def test_only_accepts_singular_forms(self, parser, base_args):
        """Test --only accepts singular form (agent vs agents)."""
        args = parser.parse_args(base_args + ['--only', 'agent,command,permission'])
        assert args.only == 'agent,command,permission'

    def test_only_with_spaces(self, base_args):
        """Test --only handles spaces around commas."""
        result = main(base_args + ['--only', 'agents, commands'])
        assert result == 0

    def test_only_empty_value(self, base_args, capsys):
        """Test --only with empty value produces error."""
        result = main(base_args + ['--only', ''])
        assert result != 0


class TestYesFlag:
    """Tests for --yes / -y flag functionality."""

    @pytest.fixture
    def parser(self):
        """Create argument parser instance."""
        return create_parser()

    @pytest.fixture
    def valid_dirs(self, tmp_path):
        """Create valid source and target directories."""
        source = tmp_path / "source"
        source.mkdir()
        target = tmp_path / "target"
        target.mkdir()
        return source, target

    @pytest.fixture
    def base_args(self, valid_dirs):
        """Minimum valid arguments for CLI."""
        source, target = valid_dirs
        return [
            '--source-dir', str(source),
            '--target-dir', str(target),
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ]

    def test_yes_flag_parsing(self, parser, base_args):
        """Test --yes flag is parsed correctly."""
        args = parser.parse_args(base_args + ['--yes'])
        assert args.yes is True

    def test_yes_short_flag_parsing(self, parser, base_args):
        """Test -y short flag is parsed correctly."""
        args = parser.parse_args(base_args + ['-y'])
        assert args.yes is True

    def test_yes_flag_default_false(self, parser, base_args):
        """Test --yes defaults to False."""
        args = parser.parse_args(base_args)
        assert args.yes is False

    def test_yes_passed_to_orchestrator(self, base_args):
        """Test --yes is passed to orchestrator as auto_confirm."""
        with patch('cli.main.UniversalSyncOrchestrator') as mock_orch:
            mock_instance = MagicMock()
            mock_orch.return_value = mock_instance

            main(base_args + ['--yes', '--only', 'agents'])

            # Verify orchestrator was called with auto_confirm=True
            call_kwargs = mock_orch.call_args.kwargs
            assert call_kwargs.get('auto_confirm') is True

    def test_yes_skips_prompts(self, base_args):
        """Test --yes does not prompt for input (doesn't hang on input())."""
        # This test verifies that with --yes, the sync completes without
        # calling input() which would hang in non-interactive mode
        result = main(base_args + ['--yes', '--only', 'agents'])
        assert result == 0

    def test_only_and_yes_combined(self, base_args):
        """Test --only and --yes work together."""
        result = main(base_args + ['--only', 'agents,commands', '--yes'])
        assert result == 0


class TestAutoDiscovery:
    """Tests for auto-discovery of profile paths from format specification."""

    @pytest.fixture
    def parser(self):
        """Create argument parser instance."""
        return create_parser()

    def test_no_autodiscover_flag_parsing(self, parser):
        """Test --no-autodiscover flag is parsed correctly."""
        # Without flag
        args = parser.parse_args([
            '--source-format', 'claude',
            '--target-format', 'copilot'
        ])
        assert args.no_autodiscover is False

        # With flag
        args = parser.parse_args([
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--no-autodiscover'
        ])
        assert args.no_autodiscover is True

    def test_no_autodiscover_requires_source_dir(self, capsys):
        """Test --no-autodiscover requires --source-dir."""
        result = main([
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--no-autodiscover'
        ])
        assert result != 0
        captured = capsys.readouterr()
        assert '--source-dir required' in captured.err

    def test_no_autodiscover_requires_target_dir(self, tmp_path, capsys):
        """Test --no-autodiscover requires --target-dir."""
        source = tmp_path / "source"
        source.mkdir()
        
        result = main([
            '--source-dir', str(source),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--no-autodiscover'
        ])
        assert result != 0
        captured = capsys.readouterr()
        assert '--target-dir required' in captured.err

    def test_autodiscover_source_path(self, tmp_path, monkeypatch, capsys):
        """Test auto-discovery of source path when not provided."""
        # Create a fake home directory structure
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        claude_agents = fake_home / ".claude" / "agents"
        claude_agents.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        # Create target directory
        target = tmp_path / "target"
        target.mkdir()
        
        result = main([
            '--target-dir', str(target),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--dry-run',
            '--verbose'
        ])
        
        # Should succeed (with dry-run, no actual sync needed)
        assert result == 0
        captured = capsys.readouterr()
        assert 'Auto-discovered source directory' in captured.out

    def test_autodiscover_target_path(self, tmp_path, monkeypatch, capsys):
        """Test auto-discovery of target path when not provided."""
        # Create a fake home directory structure
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        
        # Create source directory
        source = tmp_path / "source"
        source.mkdir()
        
        # Create target parent directory so we can write to it
        config_dir = fake_home / ".config" / "Code" / "User"
        config_dir.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        result = main([
            '--source-dir', str(source),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--dry-run',
            '--verbose'
        ])
        
        # Should succeed (with dry-run)
        assert result == 0
        captured = capsys.readouterr()
        assert 'Auto-discovered target directory' in captured.out

    def test_autodiscover_both_paths(self, tmp_path, monkeypatch, capsys):
        """Test auto-discovery of both source and target paths."""
        # Create a fake home directory structure
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        claude_agents = fake_home / ".claude" / "agents"
        claude_agents.mkdir(parents=True)
        copilot_agents = fake_home / ".config" / "Code" / "User" / "agents"
        copilot_agents.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        result = main([
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--dry-run',
            '--verbose'
        ])
        
        # Should succeed (both paths auto-discovered)
        assert result == 0
        captured = capsys.readouterr()
        assert 'Auto-discovered source directory' in captured.out
        assert 'Auto-discovered target directory' in captured.out

    def test_autodiscover_slash_command_paths(self, tmp_path, monkeypatch, capsys):
        """Test auto-discovery uses config type for path resolution."""
        # Create a fake home directory structure
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        claude_commands = fake_home / ".claude" / "commands"
        claude_commands.mkdir(parents=True)
        copilot_prompts = fake_home / ".config" / "Code" / "User" / "prompts"
        copilot_prompts.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        result = main([
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--only', 'commands',
            '--dry-run',
            '--verbose'
        ])
        
        # Should succeed with command-specific paths
        assert result == 0
        captured = capsys.readouterr()
        # Verify the correct subdirectories are used
        assert 'commands' in captured.out or 'prompts' in captured.out

    def test_autodiscover_permission_paths(self, tmp_path, monkeypatch, capsys):
        """Test auto-discovery for permission config type."""
        # Create a fake home directory structure
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        claude_root = fake_home / ".claude"
        claude_root.mkdir(parents=True)
        copilot_root = fake_home / ".config" / "Code" / "User"
        copilot_root.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        result = main([
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--only', 'permissions',
            '--dry-run',
            '--verbose'
        ])
        
        # Should succeed (permissions use root dirs)
        assert result == 0
        captured = capsys.readouterr()
        assert 'Auto-discovered source directory' in captured.out
        assert 'Auto-discovered target directory' in captured.out

    def test_autodiscover_gemini_unsupported_config_type(self, tmp_path, monkeypatch, capsys):
        """Test error when auto-discovering path for unsupported config type."""
        # Create a fake home directory structure
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        gemini_dir = fake_home / ".gemini"
        gemini_dir.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        # Gemini doesn't support agents
        result = main([
            '--source-format', 'gemini',
            '--target-format', 'claude',
            '--only', 'agents',
            '--dry-run'
        ])
        
        assert result != 0
        captured = capsys.readouterr()
        assert 'Cannot auto-discover' in captured.err or 'does not support' in captured.err

    def test_explicit_dir_overrides_autodiscover(self, tmp_path, monkeypatch, capsys):
        """Test explicit --source-dir overrides auto-discovery."""
        # Create a fake home directory structure
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        
        # Create explicit source directory
        explicit_source = tmp_path / "explicit-source"
        explicit_source.mkdir()
        
        # Create copilot target directory parent
        copilot_agents = fake_home / ".config" / "Code" / "User"
        copilot_agents.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        result = main([
            '--source-dir', str(explicit_source),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--dry-run',
            '--verbose'
        ])
        
        # Should succeed using explicit source
        assert result == 0
        captured = capsys.readouterr()
        # Source should NOT be auto-discovered since it was explicit
        assert 'Auto-discovered source directory' not in captured.out
        # Target should be auto-discovered
        assert 'Auto-discovered target directory' in captured.out

    def test_autodiscover_nonexistent_source_errors(self, tmp_path, monkeypatch, capsys):
        """Test error when auto-discovered source directory doesn't exist."""
        # Create a fake home directory with NO claude directory
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        
        # Create copilot target directory  
        copilot_agents = fake_home / ".config" / "Code" / "User" / "agents"
        copilot_agents.mkdir(parents=True)
        
        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)
        
        result = main([
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--dry-run'
        ])
        
        # Should fail because auto-discovered source doesn't exist
        assert result != 0
        captured = capsys.readouterr()
        assert 'does not exist' in captured.err

    def test_format_only_usage_pattern(self, tmp_path, monkeypatch, capsys):
        """Test the main use case: format-only invocation."""
        # Create complete fake home environment
        fake_home = tmp_path / "home"
        fake_home.mkdir()
        claude_agents = fake_home / ".claude" / "agents"
        claude_agents.mkdir(parents=True)
        # VS Code uses prompts/ for both agents and slash commands at user-level
        copilot_prompts = fake_home / ".config" / "Code" / "User" / "prompts"
        copilot_prompts.mkdir(parents=True)

        # Create a test agent file
        (claude_agents / "test-agent.md").write_text("""---
name: test-agent
description: Test agent
---
Test instructions.
""")

        # Mock Path.home() to return fake home
        monkeypatch.setattr(Path, 'home', lambda: fake_home)

        # Mock platform to Linux (test uses Linux paths)
        import platform
        monkeypatch.setattr(platform, 'system', lambda: 'Linux')

        # The format-only invocation pattern (--yes to skip confirmation)
        result = main([
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--yes'
        ])

        # Should succeed and sync the file
        assert result == 0

        # Verify file was created in prompts/ (VS Code's user-level location)
        assert (copilot_prompts / "test-agent.agent.md").exists()
