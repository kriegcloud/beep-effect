"""
Tests for the Conversion Report (Statistics and Summary) feature.

Tests cover:
- Statistics tracking accuracy for all actions
- Summary report output formatting
- Edge cases in reporting
"""

import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from core.orchestrator import UniversalSyncOrchestrator, FilePair, ConfigType
from core.registry import FormatRegistry
from core.state_manager import SyncStateManager
from adapters import ClaudeAdapter, CopilotAdapter

class TestReporting:
    """Tests for reporting and statistics."""

    @pytest.fixture
    def registry(self):
        """Create registry with adapters."""
        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())
        return registry

    @pytest.fixture
    def state_manager(self, tmp_path):
        """Create state manager with temp file."""
        state_file = tmp_path / "test_state.json"
        return SyncStateManager(state_file)

    @pytest.fixture
    def orchestrator(self, registry, state_manager, tmp_path):
        """Create orchestrator instance."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        return UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            logger=MagicMock() # Mock logger to capture output
        )

    def test_report_initial_state(self, orchestrator):
        """Test that statistics are initialized to zero."""
        assert orchestrator.stats['source_to_target'] == 0
        assert orchestrator.stats['target_to_source'] == 0
        assert orchestrator.stats['deletions'] == 0
        assert orchestrator.stats['conflicts'] == 0
        assert orchestrator.stats['skipped'] == 0
        assert orchestrator.stats['errors'] == 0

    def test_report_source_to_target(self, orchestrator):
        """Test that source_to_target stat is incremented."""
        # Setup valid file pair for sync
        source_file = orchestrator.source_dir / "test.md"
        source_file.write_text("""---
name: test
description: Test agent
---
Instructions
""")
        
        pair = FilePair(
            base_name="test",
            source_path=source_file,
            target_path=None,
            source_mtime=1000.0,
            target_mtime=None
        )

        orchestrator._execute_sync_action(pair, 'source_to_target')
        
        assert orchestrator.stats['source_to_target'] == 1
        assert orchestrator.stats['target_to_source'] == 0

    def test_report_target_to_source(self, orchestrator):
        """Test that target_to_source stat is incremented."""
        target_file = orchestrator.target_dir / "test.agent.md"
        target_file.write_text("""---
name: test
description: Test agent
tools: []
model: claude-3.5-sonnet
target: vscode
---
Instructions
""")
        
        pair = FilePair(
            base_name="test",
            source_path=None,
            target_path=target_file,
            source_mtime=None,
            target_mtime=1000.0
        )

        orchestrator._execute_sync_action(pair, 'target_to_source')
        
        assert orchestrator.stats['target_to_source'] == 1
        assert orchestrator.stats['source_to_target'] == 0

    def test_report_deletions(self, orchestrator):
        """Test that deletions stat is incremented."""
        # Create dummy file to delete
        target_file = orchestrator.target_dir / "delete_me.agent.md"
        target_file.touch()

        pair = FilePair(
            base_name="delete_me",
            source_path=None,
            target_path=target_file,
            source_mtime=None,
            target_mtime=1000.0
        )

        orchestrator._execute_sync_action(pair, 'delete_target')
        
        assert orchestrator.stats['deletions'] == 1

    def test_report_conflicts_resolved(self, orchestrator):
        """Test that conflicts are tracked when resolved."""
        # We need to run sync() or simulate the flow where conflict increments stats
        # _execute_sync_action doesn't handle 'conflict' action string directly
        # The 'conflict' stat is incremented in sync() loop before resolution
        
        pair = FilePair("conflict", None, None, None, None)
        
        # Mock _determine_action to return 'conflict'
        with patch.object(orchestrator, '_discover_file_pairs', return_value=[pair]), \
             patch.object(orchestrator, '_determine_action', return_value='conflict'), \
             patch.object(orchestrator, '_resolve_conflict', return_value='source_to_target'), \
             patch.object(orchestrator, '_execute_sync_action'):
            
            orchestrator.sync()
            
        assert orchestrator.stats['conflicts'] == 1
        # Should also execute the resolved action, but we mocked execute

    def test_report_skipped(self, orchestrator):
        """Test that skipped files are tracked."""
        pair = FilePair("skip_me", None, None, None, None)
        
        with patch.object(orchestrator, '_discover_file_pairs', return_value=[pair]), \
             patch.object(orchestrator, '_determine_action', return_value='skip'):
            
            orchestrator.sync()
            
        assert orchestrator.stats['skipped'] == 1

    def test_report_errors(self, orchestrator):
        """Test that errors are tracked."""
        pair = FilePair("error_me", None, None, None, None)
        
        # Patch the adapter's read method to raise an error
        # This simulates a failure during the sync process which should be caught by _execute_sync_action
        orchestrator.source_adapter.read = MagicMock(side_effect=IOError("Boom"))
        
        orchestrator._execute_sync_action(pair, 'source_to_target')
            
        assert orchestrator.stats['errors'] == 1

    def test_print_summary_format(self, orchestrator):
        """Test the format of the printed summary."""
        # Populate some stats
        orchestrator.stats['source_to_target'] = 5
        orchestrator.stats['target_to_source'] = 3
        orchestrator.stats['deletions'] = 2
        orchestrator.stats['conflicts'] = 1
        orchestrator.stats['skipped'] = 10
        orchestrator.stats['errors'] = 0

        orchestrator._print_summary()

        # Check calls to logger
        calls = [c[0][0] for c in orchestrator.logger.call_args_list if c.args]
        
        assert "Summary:" in calls
        assert "  claude -> copilot: 5" in calls
        assert "  copilot -> claude: 3" in calls
        assert "  Deletions:  2" in calls
        assert "  Conflicts:  1" in calls
        assert "  Skipped:    10" in calls
        assert "  Errors:     0" in calls

    def test_print_summary_dry_run(self, registry, state_manager, tmp_path):
        """Test that dry run is indicated in the summary."""
        orchestrator = UniversalSyncOrchestrator(
            source_dir=tmp_path,
            target_dir=tmp_path,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            dry_run=True,
            logger=MagicMock()
        )

        orchestrator._print_summary()

        calls = [c[0][0] for c in orchestrator.logger.call_args_list if c.args]
        assert any("dry run" in call for call in calls)

    def test_in_place_sync_reporting(self, orchestrator, tmp_path):
        """Test reporting for in-place sync."""
        source = tmp_path / "source.json"
        target = tmp_path / "target.json"
        source.write_text("{}")
        target.write_text("{}")

        # Mock adapters to simulate changes
        orchestrator.source_adapter = MagicMock()
        orchestrator.target_adapter = MagicMock()
        orchestrator.source_adapter.read.return_value = MagicMock()
        orchestrator.target_adapter.read.return_value = MagicMock()
        
        # Simulate merge resulting in different content
        orchestrator.target_adapter.from_canonical.return_value = '{"changed": true}'
        
        orchestrator.sync_files_in_place(source, target, bidirectional=False)
        
        assert orchestrator.stats['source_to_target'] == 1
        
        # Verify summary was printed
        assert orchestrator.logger.call_count > 0
