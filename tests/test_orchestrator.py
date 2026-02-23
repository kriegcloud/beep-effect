"""
Unit tests for sync orchestrator.

Tests cover:
- File pair discovery
- Sync action determination
- Conflict resolution
- Sync execution
- State tracking
"""

import json
import pytest
from pathlib import Path
from unittest.mock import patch
import time

from cli.main import main, EXIT_SUCCESS, EXIT_ERROR
from core.orchestrator import UniversalSyncOrchestrator, FilePair
from core.registry import FormatRegistry
from core.state_manager import SyncStateManager
from core.canonical_models import ConfigType, CanonicalPermission, CanonicalConfig
from core.adapter_interface import FormatAdapter
from adapters import ClaudeAdapter, CopilotAdapter


class TestFilePair:
    """Tests for FilePair dataclass."""

    def test_create_file_pair_with_all_fields(self):
        """Test creating FilePair with all fields populated."""
        source = Path("/source/agent.md")
        target = Path("/target/agent.agent.md")

        pair = FilePair(
            base_name="agent",
            source_path=source,
            target_path=target,
            source_mtime=1000.0,
            target_mtime=2000.0
        )

        assert pair.base_name == "agent"
        assert pair.source_path == source
        assert pair.target_path == target
        assert pair.source_mtime == 1000.0
        assert pair.target_mtime == 2000.0

    def test_create_file_pair_source_only(self):
        """Test creating FilePair with only source file."""
        pair = FilePair(
            base_name="new-agent",
            source_path=Path("/source/new-agent.md"),
            target_path=None,
            source_mtime=1000.0,
            target_mtime=None
        )

        assert pair.base_name == "new-agent"
        assert pair.source_path is not None
        assert pair.target_path is None
        assert pair.target_mtime is None

    def test_create_file_pair_target_only(self):
        """Test creating FilePair with only target file."""
        pair = FilePair(
            base_name="orphan-agent",
            source_path=None,
            target_path=Path("/target/orphan-agent.agent.md"),
            source_mtime=None,
            target_mtime=2000.0
        )

        assert pair.source_path is None
        assert pair.target_path is not None
        assert pair.source_mtime is None


class TestUniversalSyncOrchestratorInit:
    """Tests for UniversalSyncOrchestrator initialization."""

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

    def test_create_orchestrator(self, registry, state_manager, tmp_path):
        """Test creating orchestrator with valid parameters."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            dry_run=True
        )

        assert orchestrator.source_format == 'claude'
        assert orchestrator.target_format == 'copilot'
        assert orchestrator.config_type == ConfigType.AGENT
        assert orchestrator.dry_run is True
        assert orchestrator.source_adapter is not None
        assert orchestrator.target_adapter is not None

    def test_invalid_source_format_raises_error(self, registry, state_manager, tmp_path):
        """Test that invalid source format raises ValueError."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        with pytest.raises(ValueError, match="Unknown source format"):
            UniversalSyncOrchestrator(
                source_dir=source_dir,
                target_dir=target_dir,
                source_format='invalid_format',
                target_format='copilot',
                config_type=ConfigType.AGENT,
                format_registry=registry,
                state_manager=state_manager
            )

    def test_invalid_target_format_raises_error(self, registry, state_manager, tmp_path):
        """Test that invalid target format raises ValueError."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        with pytest.raises(ValueError, match="Unknown target format"):
            UniversalSyncOrchestrator(
                source_dir=source_dir,
                target_dir=target_dir,
                source_format='claude',
                target_format='invalid_format',
                config_type=ConfigType.AGENT,
                format_registry=registry,
                state_manager=state_manager
            )

    def test_stats_initialized(self, registry, state_manager, tmp_path):
        """Test that stats dictionary is properly initialized."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager
        )

        assert orchestrator.stats['source_to_target'] == 0
        assert orchestrator.stats['target_to_source'] == 0
        assert orchestrator.stats['deletions'] == 0
        assert orchestrator.stats['conflicts'] == 0
        assert orchestrator.stats['skipped'] == 0
        assert orchestrator.stats['errors'] == 0


class TestDiscoverFilePairs:
    """Tests for _discover_file_pairs method."""

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
            dry_run=True
        )

    def test_discover_empty_directories(self, orchestrator):
        """Test discovery with empty directories."""
        pairs = orchestrator._discover_file_pairs()
        assert pairs == []

    def test_discover_source_only_files(self, orchestrator):
        """Test discovery when files only exist in source."""
        # Create source file
        source_file = orchestrator.source_dir / "test-agent.md"
        source_file.write_text("""---
name: test-agent
description: Test agent
---
Instructions.
""")

        pairs = orchestrator._discover_file_pairs()

        assert len(pairs) == 1
        assert pairs[0].base_name == "test-agent"
        assert pairs[0].source_path == source_file
        assert pairs[0].target_path is None

    def test_discover_target_only_files(self, orchestrator):
        """Test discovery when files only exist in target."""
        # Create target file
        target_file = orchestrator.target_dir / "orphan-agent.agent.md"
        target_file.write_text("""---
name: orphan-agent
description: Orphan agent
tools:
  - read
model: Claude Sonnet 4
target: vscode
---
Instructions.
""")

        pairs = orchestrator._discover_file_pairs()

        assert len(pairs) == 1
        assert pairs[0].base_name == "orphan-agent"
        assert pairs[0].source_path is None
        assert pairs[0].target_path == target_file

    def test_discover_matching_pairs(self, orchestrator):
        """Test discovery matches files by base name."""
        # Create matching source and target files
        source_file = orchestrator.source_dir / "planner.md"
        source_file.write_text("""---
name: planner
description: Planner agent
---
Instructions.
""")

        target_file = orchestrator.target_dir / "planner.agent.md"
        target_file.write_text("""---
name: planner
description: Planner agent
tools:
  - read
model: Claude Sonnet 4
target: vscode
---
Instructions.
""")

        pairs = orchestrator._discover_file_pairs()

        assert len(pairs) == 1
        assert pairs[0].base_name == "planner"
        assert pairs[0].source_path == source_file
        assert pairs[0].target_path == target_file
        assert pairs[0].source_mtime is not None
        assert pairs[0].target_mtime is not None

    def test_discover_multiple_files(self, orchestrator):
        """Test discovery with multiple files in various states."""
        # Source only
        (orchestrator.source_dir / "agent-a.md").write_text("---\nname: a\ndescription: A\n---\n")
        # Target only
        (orchestrator.target_dir / "agent-b.agent.md").write_text("---\nname: b\ndescription: B\ntools: []\nmodel: Claude Sonnet 4\ntarget: vscode\n---\n")
        # Both
        (orchestrator.source_dir / "agent-c.md").write_text("---\nname: c\ndescription: C\n---\n")
        (orchestrator.target_dir / "agent-c.agent.md").write_text("---\nname: c\ndescription: C\ntools: []\nmodel: Claude Sonnet 4\ntarget: vscode\n---\n")

        pairs = orchestrator._discover_file_pairs()

        assert len(pairs) == 3
        # Should be sorted by name
        base_names = [p.base_name for p in pairs]
        assert base_names == sorted(base_names)

    def test_discover_ignores_non_matching_extensions(self, orchestrator):
        """Test that non-agent files are ignored."""
        # Create non-agent files
        (orchestrator.source_dir / "readme.txt").write_text("Not an agent")
        (orchestrator.source_dir / "config.json").write_text("{}")
        (orchestrator.target_dir / "notes.md").write_text("Some notes")  # Not .agent.md

        # Create one valid agent
        (orchestrator.source_dir / "real-agent.md").write_text("---\nname: real\ndescription: Real\n---\n")

        pairs = orchestrator._discover_file_pairs()

        assert len(pairs) == 1
        assert pairs[0].base_name == "real-agent"


class TestDetermineAction:
    """Tests for _determine_action method."""

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
            direction='both'
        )

    def test_determine_action_new_source_file(self, orchestrator):
        """Test action for new file in source only."""
        pair = FilePair(
            base_name="new-agent",
            source_path=Path("/source/new-agent.md"),
            target_path=None,
            source_mtime=1000.0,
            target_mtime=None
        )

        action = orchestrator._determine_action(pair)
        assert action == 'source_to_target'

    def test_determine_action_new_target_file(self, orchestrator):
        """Test action for new file in target only."""
        pair = FilePair(
            base_name="new-agent",
            source_path=None,
            target_path=Path("/target/new-agent.agent.md"),
            source_mtime=None,
            target_mtime=1000.0
        )

        action = orchestrator._determine_action(pair)
        assert action == 'target_to_source'

    def test_determine_action_source_to_target_direction(self, registry, state_manager, tmp_path):
        """Test that direction='source-to-target' blocks reverse sync."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            direction='source-to-target'  # One-way
        )

        # New file in target should be skipped
        pair = FilePair(
            base_name="target-only",
            source_path=None,
            target_path=Path("/target/target-only.agent.md"),
            source_mtime=None,
            target_mtime=1000.0
        )

        action = orchestrator._determine_action(pair)
        assert action == 'skip'

    def test_determine_action_first_sync_uses_newer(self, orchestrator):
        """Test that first sync uses newer file when both exist."""
        # Source is newer
        pair = FilePair(
            base_name="agent",
            source_path=Path("/source/agent.md"),
            target_path=Path("/target/agent.agent.md"),
            source_mtime=2000.0,  # Newer
            target_mtime=1000.0
        )

        action = orchestrator._determine_action(pair)
        assert action == 'source_to_target'

        # Target is newer
        pair2 = FilePair(
            base_name="agent2",
            source_path=Path("/source/agent2.md"),
            target_path=Path("/target/agent2.agent.md"),
            source_mtime=1000.0,
            target_mtime=2000.0  # Newer
        )

        action2 = orchestrator._determine_action(pair2)
        assert action2 == 'target_to_source'

    def test_determine_action_skip_unchanged(self, orchestrator):
        """Test skip when files haven't changed since last sync."""
        # Set up state as if we synced before
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "unchanged-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        pair = FilePair(
            base_name="unchanged-agent",
            source_path=Path("/source/unchanged-agent.md"),
            target_path=Path("/target/unchanged-agent.agent.md"),
            source_mtime=1000.0,  # Same as recorded
            target_mtime=1000.0   # Same as recorded
        )

        action = orchestrator._determine_action(pair)
        assert action == 'skip'

    def test_determine_action_source_changed(self, orchestrator):
        """Test source_to_target when only source changed."""
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "test-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        pair = FilePair(
            base_name="test-agent",
            source_path=Path("/source/test-agent.md"),
            target_path=Path("/target/test-agent.agent.md"),
            source_mtime=2000.0,  # Changed
            target_mtime=1000.0   # Unchanged
        )

        action = orchestrator._determine_action(pair)
        assert action == 'source_to_target'

    def test_determine_action_target_changed(self, orchestrator):
        """Test target_to_source when only target changed."""
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "test-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        pair = FilePair(
            base_name="test-agent",
            source_path=Path("/source/test-agent.md"),
            target_path=Path("/target/test-agent.agent.md"),
            source_mtime=1000.0,   # Unchanged
            target_mtime=2000.0    # Changed
        )

        action = orchestrator._determine_action(pair)
        assert action == 'target_to_source'

    def test_determine_action_conflict(self, orchestrator):
        """Test conflict when both files changed."""
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "conflict-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        pair = FilePair(
            base_name="conflict-agent",
            source_path=Path("/source/conflict-agent.md"),
            target_path=Path("/target/conflict-agent.agent.md"),
            source_mtime=2000.0,  # Changed
            target_mtime=3000.0   # Also changed
        )

        action = orchestrator._determine_action(pair)
        assert action == 'conflict'


class TestDeletionHandling:
    """Tests for deletion handling scenarios."""

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
            direction='both'
        )

    def test_source_deleted_target_exists(self, orchestrator):
        """Test action when source was deleted but target still exists."""
        # Set up state as if both files existed before
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "deleted-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        # Create only target file (source was "deleted")
        target_file = orchestrator.target_dir / "deleted-agent.agent.md"
        target_file.write_text("""---
name: deleted-agent
description: Agent whose source was deleted
tools: []
model: Claude Sonnet 4
target: vscode
---
Instructions.
""")

        pair = FilePair(
            base_name="deleted-agent",
            source_path=None,  # Deleted
            target_path=target_file,
            source_mtime=None,
            target_mtime=target_file.stat().st_mtime
        )

        action = orchestrator._determine_action(pair)
        assert action == 'delete_target'

    def test_target_deleted_source_exists(self, orchestrator):
        """Test action when target was deleted but source still exists."""
        # Set up state as if both files existed before
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "deleted-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        # Create only source file (target was "deleted")
        source_file = orchestrator.source_dir / "deleted-agent.md"
        source_file.write_text("""---
name: deleted-agent
description: Agent whose target was deleted
---
Instructions.
""")

        pair = FilePair(
            base_name="deleted-agent",
            source_path=source_file,
            target_path=None,  # Deleted
            source_mtime=source_file.stat().st_mtime,
            target_mtime=None
        )

        action = orchestrator._determine_action(pair)
        assert action == 'delete_source'

    def test_source_deleted_recreated_newer(self, orchestrator):
        """Test action when source was deleted then recreated (newer than last sync)."""
        # Set up old state
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "recreated-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        # Create both files - source is newer (recreated)
        source_file = orchestrator.source_dir / "recreated-agent.md"
        source_file.write_text("""---
name: recreated-agent
description: Recreated source
---
Instructions.
""")

        target_file = orchestrator.target_dir / "recreated-agent.agent.md"
        target_file.write_text("""---
name: recreated-agent
description: Old target
tools: []
model: Claude Sonnet 4
target: vscode
---
Instructions.
""")

        pair = FilePair(
            base_name="recreated-agent",
            source_path=source_file,
            target_path=target_file,
            source_mtime=source_file.stat().st_mtime,  # Newer than 1000.0
            target_mtime=1000.0  # Same as state
        )

        action = orchestrator._determine_action(pair)
        assert action == 'source_to_target'

    def test_target_deleted_recreated_newer(self, orchestrator):
        """Test action when target was deleted then recreated (newer than last sync)."""
        # Set up old state
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "recreated-agent",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        # Create both files - target is newer (recreated)
        source_file = orchestrator.source_dir / "recreated-agent.md"
        source_file.write_text("""---
name: recreated-agent
description: Old source
---
Instructions.
""")

        target_file = orchestrator.target_dir / "recreated-agent.agent.md"
        target_file.write_text("""---
name: recreated-agent
description: Recreated target
tools: []
model: Claude Sonnet 4
target: vscode
---
Instructions.
""")

        pair = FilePair(
            base_name="recreated-agent",
            source_path=source_file,
            target_path=target_file,
            source_mtime=1000.0,  # Same as state
            target_mtime=target_file.stat().st_mtime  # Newer than 1000.0
        )

        action = orchestrator._determine_action(pair)
        assert action == 'target_to_source'

    def test_both_deleted(self, orchestrator):
        """Test action when both source and target were deleted."""
        # Set up state as if both files existed before
        orchestrator.state_manager.update_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "both-deleted",
            source_mtime=1000.0,
            target_mtime=1000.0,
            action='source_to_target'
        )

        # Neither file exists
        pair = FilePair(
            base_name="both-deleted",
            source_path=None,
            target_path=None,
            source_mtime=None,
            target_mtime=None
        )

        action = orchestrator._determine_action(pair)
        # Should skip or clean up state
        assert action in ('skip', 'remove_state')

    def test_orphaned_target_no_state(self, orchestrator):
        """Test action for target file with no source and no previous state."""
        # No prior state - this is a new target-only file
        target_file = orchestrator.target_dir / "orphan.agent.md"
        target_file.write_text("""---
name: orphan
description: Orphan target
tools: []
model: Claude Sonnet 4
target: vscode
---
Instructions.
""")

        pair = FilePair(
            base_name="orphan",
            source_path=None,
            target_path=target_file,
            source_mtime=None,
            target_mtime=target_file.stat().st_mtime
        )

        action = orchestrator._determine_action(pair)
        # New file should sync to source
        assert action == 'target_to_source'

    def test_orphaned_source_no_state(self, orchestrator):
        """Test action for source file with no target and no previous state."""
        # No prior state - this is a new source-only file
        source_file = orchestrator.source_dir / "orphan.md"
        source_file.write_text("""---
name: orphan
description: Orphan source
---
Instructions.
""")

        pair = FilePair(
            base_name="orphan",
            source_path=source_file,
            target_path=None,
            source_mtime=source_file.stat().st_mtime,
            target_mtime=None
        )

        action = orchestrator._determine_action(pair)
        # New file should sync to target
        assert action == 'source_to_target'

    def test_deletion_respects_direction(self, registry, state_manager, tmp_path):
        """Test that deletion respects direction constraints."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            direction='target-to-source'  # Only allow target->source
        )

        # Set up state
        state_manager.update_file_state(
            source_dir, target_dir, "constrained",
            source_mtime=1000.0, target_mtime=1000.0, action='source_to_target'
        )

        # Source was deleted, target exists
        target_file = target_dir / "constrained.agent.md"
        target_file.write_text("""---
name: constrained
description: Constrained agent
tools: []
model: Claude Sonnet 4
target: vscode
---
Instructions.
""")

        pair = FilePair(
            base_name="constrained",
            source_path=None,
            target_path=target_file,
            source_mtime=None,
            target_mtime=target_file.stat().st_mtime
        )

        action = orchestrator._determine_action(pair)
        # Cannot delete target in target-to-source mode
        assert action == 'skip'


class TestResolveConflict:
    """Tests for _resolve_conflict method."""

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

    def test_resolve_conflict_force_uses_newer_source(self, registry, state_manager, tmp_path):
        """Test force mode uses source when source is newer."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            force=True  # Enable force mode
        )

        pair = FilePair(
            base_name="conflict-agent",
            source_path=source_dir / "conflict-agent.md",
            target_path=target_dir / "conflict-agent.agent.md",
            source_mtime=2000.0,  # Newer
            target_mtime=1000.0
        )

        action = orchestrator._resolve_conflict(pair)
        assert action == 'source_to_target'

    def test_resolve_conflict_force_uses_newer_target(self, registry, state_manager, tmp_path):
        """Test force mode uses target when target is newer."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            force=True  # Enable force mode
        )

        pair = FilePair(
            base_name="conflict-agent",
            source_path=source_dir / "conflict-agent.md",
            target_path=target_dir / "conflict-agent.agent.md",
            source_mtime=1000.0,
            target_mtime=2000.0  # Newer
        )

        action = orchestrator._resolve_conflict(pair)
        assert action == 'target_to_source'

    def test_resolve_conflict_interactive_choice_source(self, registry, state_manager, tmp_path):
        """Test interactive mode returns source_to_target when user chooses 1."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            force=False  # Interactive mode
        )

        pair = FilePair(
            base_name="conflict-agent",
            source_path=source_dir / "conflict-agent.md",
            target_path=target_dir / "conflict-agent.agent.md",
            source_mtime=1000.0,
            target_mtime=2000.0
        )

        with patch('builtins.input', return_value='1'):
            action = orchestrator._resolve_conflict(pair)

        assert action == 'source_to_target'

    def test_resolve_conflict_interactive_choice_target(self, registry, state_manager, tmp_path):
        """Test interactive mode returns target_to_source when user chooses 2."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            force=False
        )

        pair = FilePair(
            base_name="conflict-agent",
            source_path=source_dir / "conflict-agent.md",
            target_path=target_dir / "conflict-agent.agent.md",
            source_mtime=1000.0,
            target_mtime=2000.0
        )

        with patch('builtins.input', return_value='2'):
            action = orchestrator._resolve_conflict(pair)

        assert action == 'target_to_source'

    def test_resolve_conflict_interactive_skip(self, registry, state_manager, tmp_path):
        """Test interactive mode returns None when user chooses to skip."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            force=False
        )

        pair = FilePair(
            base_name="conflict-agent",
            source_path=source_dir / "conflict-agent.md",
            target_path=target_dir / "conflict-agent.agent.md",
            source_mtime=1000.0,
            target_mtime=2000.0
        )

        with patch('builtins.input', return_value='3'):
            action = orchestrator._resolve_conflict(pair)

        assert action is None


class TestExecuteSyncAction:
    """Tests for _execute_sync_action method."""

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
            dry_run=False
        )

    def test_execute_source_to_target(self, orchestrator):
        """Test syncing from source to target creates target file."""
        # Create source file
        source_file = orchestrator.source_dir / "test-agent.md"
        source_file.write_text("""---
name: test-agent
description: Test agent for sync
tools: Read, Grep
model: sonnet
---
Test instructions.
""")

        pair = FilePair(
            base_name="test-agent",
            source_path=source_file,
            target_path=None,
            source_mtime=source_file.stat().st_mtime,
            target_mtime=None
        )

        orchestrator._execute_sync_action(pair, 'source_to_target')

        # Verify target file was created
        target_file = orchestrator.target_dir / "test-agent.agent.md"
        assert target_file.exists()

        content = target_file.read_text()
        assert "name: test-agent" in content
        assert "target: vscode" in content  # Copilot format adds this

        # Verify stats updated
        assert orchestrator.stats['source_to_target'] == 1

    def test_execute_target_to_source(self, orchestrator):
        """Test syncing from target to source creates source file."""
        # Create target file
        target_file = orchestrator.target_dir / "test-agent.agent.md"
        target_file.write_text("""---
name: test-agent
description: Test agent for sync
tools:
  - read
  - grep
model: Claude Sonnet 4
target: vscode
---
Test instructions.
""")

        pair = FilePair(
            base_name="test-agent",
            source_path=None,
            target_path=target_file,
            source_mtime=None,
            target_mtime=target_file.stat().st_mtime
        )

        orchestrator._execute_sync_action(pair, 'target_to_source')

        # Verify source file was created
        source_file = orchestrator.source_dir / "test-agent.md"
        assert source_file.exists()

        content = source_file.read_text()
        assert "name: test-agent" in content

        # Verify stats updated
        assert orchestrator.stats['target_to_source'] == 1

    def test_execute_dry_run_no_write(self, registry, state_manager, tmp_path):
        """Test that dry_run mode doesn't write files."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            dry_run=True  # Dry run enabled
        )

        # Create source file
        source_file = source_dir / "dry-run-agent.md"
        source_file.write_text("""---
name: dry-run-agent
description: Test agent
---
Instructions.
""")

        pair = FilePair(
            base_name="dry-run-agent",
            source_path=source_file,
            target_path=None,
            source_mtime=source_file.stat().st_mtime,
            target_mtime=None
        )

        orchestrator._execute_sync_action(pair, 'source_to_target')

        # Verify target file was NOT created
        target_file = target_dir / "dry-run-agent.agent.md"
        assert not target_file.exists()

        # Stats should still be updated
        assert orchestrator.stats['source_to_target'] == 1

    def test_execute_updates_existing_file(self, orchestrator):
        """Test updating an existing target file."""
        # Create source and target files
        source_file = orchestrator.source_dir / "update-agent.md"
        source_file.write_text("""---
name: update-agent
description: Updated description
tools: Read, Grep, Glob
model: opus
---
New instructions.
""")

        target_file = orchestrator.target_dir / "update-agent.agent.md"
        target_file.write_text("""---
name: update-agent
description: Old description
tools:
  - read
model: Claude Sonnet 4
target: vscode
---
Old instructions.
""")

        pair = FilePair(
            base_name="update-agent",
            source_path=source_file,
            target_path=target_file,
            source_mtime=source_file.stat().st_mtime,
            target_mtime=target_file.stat().st_mtime
        )

        orchestrator._execute_sync_action(pair, 'source_to_target')

        # Verify target file was updated
        content = target_file.read_text()
        assert "Updated description" in content
        assert "New instructions" in content

    def test_execute_handles_error(self, orchestrator):
        """Test error handling during sync execution."""
        # Create a pair with a non-existent source file
        pair = FilePair(
            base_name="missing-agent",
            source_path=Path("/nonexistent/missing-agent.md"),
            target_path=None,
            source_mtime=1000.0,
            target_mtime=None
        )

        # Should not raise, but should increment error count
        orchestrator._execute_sync_action(pair, 'source_to_target')

        assert orchestrator.stats['errors'] == 1

    def test_execute_updates_state(self, orchestrator):
        """Test that state manager is updated after sync."""
        # Create source file
        source_file = orchestrator.source_dir / "state-test.md"
        source_file.write_text("""---
name: state-test
description: Test state update
---
Instructions.
""")

        pair = FilePair(
            base_name="state-test",
            source_path=source_file,
            target_path=None,
            source_mtime=source_file.stat().st_mtime,
            target_mtime=None
        )

        orchestrator._execute_sync_action(pair, 'source_to_target')

        # Verify state was updated
        file_state = orchestrator.state_manager.get_file_state(
            orchestrator.source_dir,
            orchestrator.target_dir,
            "state-test"
        )

        assert file_state is not None
        assert file_state['last_action'] == 'source_to_target'


class TestSyncFullWorkflow:
    """Tests for the complete sync() workflow."""

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

    def test_sync_empty_directories(self, registry, state_manager, tmp_path, capsys):
        """Test sync with empty directories."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            verbose=True
        )

        orchestrator.sync()

        captured = capsys.readouterr()
        assert "No files found" in captured.out or orchestrator.stats['skipped'] == 0

    def test_sync_new_files_created(self, registry, state_manager, tmp_path):
        """Test sync creates new target files from source."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create source file
        (source_dir / "new-agent.md").write_text("""---
name: new-agent
description: New agent
tools: Read
model: sonnet
---
Instructions.
""")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            dry_run=False
        )

        orchestrator.sync()

        # Verify target was created
        assert (target_dir / "new-agent.agent.md").exists()
        assert orchestrator.stats['source_to_target'] == 1

    def test_sync_bidirectional(self, registry, state_manager, tmp_path):
        """Test bidirectional sync creates files in both directions."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create source-only file
        (source_dir / "source-only.md").write_text("""---
name: source-only
description: From source
---
Source instructions.
""")

        # Create target-only file
        (target_dir / "target-only.agent.md").write_text("""---
name: target-only
description: From target
tools:
  - read
model: Claude Sonnet 4
target: vscode
---
Target instructions.
""")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            direction='both',
            dry_run=False
        )

        orchestrator.sync()

        # Verify both directions synced
        assert (target_dir / "source-only.agent.md").exists()
        assert (source_dir / "target-only.md").exists()
        assert orchestrator.stats['source_to_target'] == 1
        assert orchestrator.stats['target_to_source'] == 1

    def test_sync_respects_direction(self, registry, state_manager, tmp_path):
        """Test sync respects direction setting."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create source-only file
        (source_dir / "source-only.md").write_text("""---
name: source-only
description: From source
---
Instructions from source.
""")
        # Create target-only file
        (target_dir / "target-only.agent.md").write_text("""---
name: target-only
description: From target
tools: []
model: Claude Sonnet 4
target: vscode
---
""")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            direction='source-to-target',  # One way only
            dry_run=False
        )

        orchestrator.sync()

        # Source-only should be synced to target
        assert (target_dir / "source-only.agent.md").exists()
        # Target-only should NOT be synced to source
        assert not (source_dir / "target-only.md").exists()
        assert orchestrator.stats['source_to_target'] == 1
        assert orchestrator.stats['target_to_source'] == 0

    def test_sync_dry_run_no_state_save(self, registry, state_manager, tmp_path):
        """Test dry run doesn't save state."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        (source_dir / "dry-test.md").write_text("""---
name: dry-test
description: Dry run test
---
""")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            dry_run=True
        )

        orchestrator.sync()

        # State file should not exist (wasn't saved)
        # Note: Depending on implementation, state_manager might create file on load
        # So we check that no file state was recorded
        file_state = state_manager.get_file_state(source_dir, target_dir, "dry-test")
        # In dry run, file state should not be persisted
        assert file_state is None or 'last_action' not in file_state

    def test_sync_with_conflict_force_mode(self, registry, state_manager, tmp_path):
        """Test sync handles conflicts in force mode."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Set up prior sync state
        state_manager.update_file_state(
            source_dir, target_dir, "conflict-agent",
            source_mtime=1000.0, target_mtime=1000.0, action='source_to_target'
        )

        # Create both files with newer mtimes
        source_file = source_dir / "conflict-agent.md"
        source_file.write_text("""---
name: conflict-agent
description: Source version
model: opus
---
Source wins.
""")
        # Wait a bit to ensure different mtime
        time.sleep(0.01)
        target_file = target_dir / "conflict-agent.agent.md"
        target_file.write_text("""---
name: conflict-agent
description: Target version
tools: []
model: Claude Sonnet 4
target: vscode
---
Target wins.
""")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            force=True,  # Force mode resolves conflicts automatically
            dry_run=False
        )

        orchestrator.sync()

        # Target was newer, so should win
        source_content = source_file.read_text()
        assert "Target version" in source_content or "Target wins" in source_content
        assert orchestrator.stats['conflicts'] == 1

    def test_sync_prints_summary(self, registry, state_manager, tmp_path, capsys):
        """Test sync prints summary at the end."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        (source_dir / "agent.md").write_text("""---
name: agent
description: Test
---
""")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=state_manager,
            dry_run=False
        )

        orchestrator.sync()

        captured = capsys.readouterr()
        assert "Summary" in captured.out or "=" * 10 in captured.out


class TestExtractBaseName:
    """Tests for _extract_base_name helper method."""

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
            state_manager=state_manager
        )

    def test_extract_simple_extension(self, orchestrator):
        """Test extracting base name from simple .md extension."""
        path = Path("/some/path/my-agent.md")
        base_name = orchestrator._extract_base_name(path, ".md")
        assert base_name == "my-agent"

    def test_extract_compound_extension(self, orchestrator):
        """Test extracting base name from compound .agent.md extension."""
        path = Path("/some/path/my-agent.agent.md")
        base_name = orchestrator._extract_base_name(path, ".agent.md")
        assert base_name == "my-agent"

    def test_extract_handles_dots_in_name(self, orchestrator):
        """Test extracting base name when name contains dots."""
        path = Path("/some/path/my.special.agent.md")
        base_name = orchestrator._extract_base_name(path, ".md")
        assert base_name == "my.special.agent"

    def test_extract_no_match_falls_back_to_stem(self, orchestrator):
        """Test fallback to stem when extension doesn't match."""
        path = Path("/some/path/agent.txt")
        base_name = orchestrator._extract_base_name(path, ".md")
        assert base_name == "agent"
class MockPermissionAdapter(FormatAdapter):
    def __init__(self, name, extension, supports_perm=True):
        self._name = name
        self._extension = extension
        self._supports_perm = supports_perm
        self.read_calls = []
        self.write_calls = []
        self.from_canonical_calls = []

    @property
    def format_name(self) -> str:
        return self._name

    @property
    def file_extension(self) -> str:
        return self._extension

    def get_file_extension(self, config_type: ConfigType) -> str:
        return self._extension

    @property
    def supported_config_types(self):
        if self._supports_perm:
            return [ConfigType.PERMISSION]
        return []

    def can_handle(self, file_path: Path) -> bool:
        return file_path.name.endswith(self._extension)

    def read(self, file_path: Path, config_type: ConfigType):
        self.read_calls.append((file_path, config_type))
        return CanonicalPermission(allow=["read"])

    def write(self, canonical_obj, file_path, config_type, options=None):
        self.write_calls.append((canonical_obj, file_path, config_type))
        # Actually write file so stat() works
        file_path.write_text("mock content")

    def to_canonical(self, content, config_type, file_path=None):
        return CanonicalPermission()

    def from_canonical(self, canonical_obj, config_type, options=None):
        self.from_canonical_calls.append((canonical_obj, config_type, options))
        return "permission content"

class TestPermissionSync:
    """Tests for permission synchronization."""

    @pytest.fixture
    def registry(self):
        registry = FormatRegistry()
        registry.register(MockPermissionAdapter("source_fmt", ".json"))
        registry.register(MockPermissionAdapter("target_fmt", ".perm.json"))
        return registry

    @pytest.fixture
    def state_manager(self, tmp_path):
        return SyncStateManager(tmp_path / "test_state.json")

    def test_permission_discovery(self, registry, state_manager, tmp_path):
        """Test discovering permission files."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create permission files
        (source_dir / "settings.json").write_text("{}")
        (target_dir / "settings.perm.json").write_text("{}")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='source_fmt',
            target_format='target_fmt',
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=state_manager
        )

        pairs = orchestrator._discover_file_pairs()
        
        assert len(pairs) == 1
        assert pairs[0].base_name == "settings"
        assert pairs[0].source_path.name == "settings.json"
        assert pairs[0].target_path.name == "settings.perm.json"

    def test_permission_sync_execution(self, registry, state_manager, tmp_path):
        """Test syncing permissions triggers correct adapter calls."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        (source_dir / "settings.json").write_text("{}")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='source_fmt',
            target_format='target_fmt',
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=state_manager
        )

        pair = FilePair(
            base_name="settings",
            source_path=source_dir / "settings.json",
            target_path=None,
            source_mtime=1000.0,
            target_mtime=None
        )

        orchestrator._execute_sync_action(pair, 'source_to_target')

        # Check adapter calls
        source_adapter = registry.get_adapter('source_fmt')
        target_adapter = registry.get_adapter('target_fmt')

        assert len(source_adapter.read_calls) == 1
        assert source_adapter.read_calls[0][1] == ConfigType.PERMISSION

        # Orchestrator now calls from_canonical() directly instead of write()
        assert len(target_adapter.from_canonical_calls) == 1
        assert target_adapter.from_canonical_calls[0][1] == ConfigType.PERMISSION
        assert isinstance(target_adapter.from_canonical_calls[0][0], CanonicalPermission)

    def test_permission_conflict_handling(self, registry, state_manager, tmp_path):
        """Test permission conflict resolution."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='source_fmt',
            target_format='target_fmt',
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=state_manager,
            force=True
        )

        pair = FilePair(
            base_name="settings",
            source_path=source_dir / "settings.json",
            target_path=target_dir / "settings.perm.json",
            source_mtime=2000.0, # Newer
            target_mtime=1000.0
        )

        action = orchestrator._resolve_conflict(pair)
        assert action == 'source_to_target'

    def test_permission_state_tracking(self, registry, state_manager, tmp_path):
        """Test that permission sync updates state correctly."""
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        (source_dir / "settings.json").write_text("{}")

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='source_fmt',
            target_format='target_fmt',
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=state_manager
        )

        pair = FilePair(
            base_name="settings",
            source_path=source_dir / "settings.json",
            target_path=None,
            source_mtime=1000.0,
            target_mtime=None
        )

        orchestrator._execute_sync_action(pair, 'source_to_target')

        state = state_manager.get_file_state(source_dir, target_dir, "settings")
        assert state is not None
        assert state['last_action'] == 'source_to_target'


class TestMergePermissions:
    """Tests for _merge_permissions method."""

    def test_merge_permissions_adds_new_rules(self):
        """Test that new permission rules are added from source to target."""
        from core.canonical_models import CanonicalPermission
        
        source = CanonicalPermission(
            allow=["Bash(git:*)", "Bash(ls:*)"],
            deny=[],
            ask=[]
        )
        target = CanonicalPermission(
            allow=["Bash(git:*)"],
            deny=[],
            ask=[]
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_permissions(source, target)

        assert len(merged.allow) == 2
        assert "Bash(git:*)" in merged.allow
        assert "Bash(ls:*)" in merged.allow

    def test_merge_permissions_avoids_duplicates(self):
        """Test that duplicate rules are not added."""
        from core.canonical_models import CanonicalPermission
        
        source = CanonicalPermission(
            allow=["Bash(git:*)", "Bash(ls:*)"],
            deny=[],
            ask=[]
        )
        target = CanonicalPermission(
            allow=["Bash(git:*)", "Bash(ls:*)"],
            deny=[],
            ask=[]
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_permissions(source, target)

        assert len(merged.allow) == 2  # No duplicates
        assert merged.allow.count("Bash(git:*)") == 1

    def test_merge_permissions_preserves_target_rules(self):
        """Test that target-only rules are preserved."""
        from core.canonical_models import CanonicalPermission
        
        source = CanonicalPermission(
            allow=["Bash(git:*)"],
            deny=[],
            ask=[]
        )
        target = CanonicalPermission(
            allow=["Bash(git:*)", "Read"],
            deny=[],
            ask=[]
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_permissions(source, target)

        assert len(merged.allow) == 2
        assert "Bash(git:*)" in merged.allow
        assert "Read" in merged.allow


class TestSyncFilesInPlace:
    """Tests for sync_files_in_place method."""

    def test_sync_files_in_place_source_not_found(self, tmp_path):
        """Test error when source file doesn't exist."""
        source_file = tmp_path / "nonexistent.json"
        target_file = tmp_path / "target.json"
        target_file.write_text("{}")

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=tmp_path,
            target_dir=tmp_path,
            source_format="claude",
            target_format="claude",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        with pytest.raises(IOError, match="Source file not found"):
            orchestrator.sync_files_in_place(
                source_path=source_file,
                target_path=target_file,
                bidirectional=False,
                dry_run=False
            )

    def test_sync_files_in_place_target_not_found(self, tmp_path):
        """Test error when target file doesn't exist."""
        source_file = tmp_path / "source.json"
        target_file = tmp_path / "nonexistent.json"
        source_file.write_text("{}")

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=tmp_path,
            target_dir=tmp_path,
            source_format="claude",
            target_format="claude",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        with pytest.raises(IOError, match="Target file not found"):
            orchestrator.sync_files_in_place(
                source_path=source_file,
                target_path=target_file,
                bidirectional=False,
                dry_run=False
            )

    def test_sync_files_in_place_happy_path_permissions(self, tmp_path):
        """Test successful in-place merge of permission files."""
        # Create source with additional rules
        source_file = tmp_path / "source_settings.json"
        source_content = {
            "permissions": {
                "allow": ["Bash(git:*)", "Bash(ls:*)"],
                "deny": ["Bash(rm:*)"],
                "ask": []
            }
        }
        source_file.write_text(json.dumps(source_content))

        # Create target with some overlapping and some unique rules
        target_file = tmp_path / "target_settings.json"
        target_content = {
            "permissions": {
                "allow": ["Bash(git:*)", "Read"],
                "deny": [],
                "ask": ["Write"]
            }
        }
        target_file.write_text(json.dumps(target_content))

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=tmp_path,
            target_dir=tmp_path,
            source_format="claude",
            target_format="claude",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        orchestrator.sync_files_in_place(
            source_path=source_file,
            target_path=target_file,
            bidirectional=False,
            dry_run=False
        )

        # Verify merged result
        result = json.loads(target_file.read_text())
        assert "Bash(git:*)" in result["permissions"]["allow"]
        assert "Bash(ls:*)" in result["permissions"]["allow"]
        assert "Read" in result["permissions"]["allow"]
        assert "Bash(rm:*)" in result["permissions"]["deny"]
        assert "Write" in result["permissions"]["ask"]

    def test_sync_files_in_place_dry_run_no_changes(self, tmp_path):
        """Test dry-run mode doesn't modify files."""
        source_file = tmp_path / "source_settings.json"
        source_content = {
            "permissions": {
                "allow": ["Bash(git:*)", "NewRule"],
                "deny": [],
                "ask": []
            }
        }
        source_file.write_text(json.dumps(source_content))

        target_file = tmp_path / "target_settings.json"
        original_target = {
            "permissions": {
                "allow": ["Bash(git:*)"],
                "deny": [],
                "ask": []
            }
        }
        target_file.write_text(json.dumps(original_target))

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=tmp_path,
            target_dir=tmp_path,
            source_format="claude",
            target_format="claude",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        orchestrator.sync_files_in_place(
            source_path=source_file,
            target_path=target_file,
            bidirectional=False,
            dry_run=True
        )

        # Verify file was NOT modified
        result = json.loads(target_file.read_text())
        assert result == original_target
        assert "NewRule" not in result["permissions"]["allow"]

    def test_sync_files_in_place_bidirectional(self, tmp_path):
        """Test bidirectional sync merges both files."""
        source_file = tmp_path / "source_settings.json"
        source_content = {
            "permissions": {
                "allow": ["SourceOnlyRule", "SharedRule"],
                "deny": [],
                "ask": []
            }
        }
        source_file.write_text(json.dumps(source_content))

        target_file = tmp_path / "target_settings.json"
        target_content = {
            "permissions": {
                "allow": ["TargetOnlyRule", "SharedRule"],
                "deny": [],
                "ask": []
            }
        }
        target_file.write_text(json.dumps(target_content))

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=tmp_path,
            target_dir=tmp_path,
            source_format="claude",
            target_format="claude",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        orchestrator.sync_files_in_place(
            source_path=source_file,
            target_path=target_file,
            bidirectional=True,
            dry_run=False
        )

        # Verify both files have all rules
        source_result = json.loads(source_file.read_text())
        target_result = json.loads(target_file.read_text())

        # Target should have source rules merged in
        assert "SourceOnlyRule" in target_result["permissions"]["allow"]
        assert "TargetOnlyRule" in target_result["permissions"]["allow"]
        assert "SharedRule" in target_result["permissions"]["allow"]

        # Source should have target rules merged in
        assert "SourceOnlyRule" in source_result["permissions"]["allow"]
        assert "TargetOnlyRule" in source_result["permissions"]["allow"]
        assert "SharedRule" in source_result["permissions"]["allow"]

    def test_sync_files_in_place_no_changes_needed(self, tmp_path):
        """Test stats not incremented when no changes needed.
        
        Note: Both files must be in the adapter's canonical output format
        (pretty-printed JSON) for this test to pass, since the adapter
        normalizes output formatting.
        """
        source_file = tmp_path / "source_settings.json"
        # Use pretty-printed JSON that matches adapter output format
        content = """{
  "permissions": {
    "allow": [
      "SameRule"
    ],
    "deny": [],
    "ask": []
  }
}"""
        source_file.write_text(content)

        target_file = tmp_path / "target_settings.json"
        target_file.write_text(content)

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=tmp_path,
            target_dir=tmp_path,
            source_format="claude",
            target_format="claude",
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        orchestrator.sync_files_in_place(
            source_path=source_file,
            target_path=target_file,
            bidirectional=False,
            dry_run=False
        )

        # Stats should NOT be incremented when no changes made
        assert orchestrator.stats['source_to_target'] == 0


class TestMergeAgents:
    """Tests for _merge_agents method."""

    def test_merge_agents_uses_source_core_fields(self):
        """Test that core fields come from source agent."""
        from core.canonical_models import CanonicalAgent

        source = CanonicalAgent(
            name="source-agent",
            description="Source description",
            instructions="Source instructions",
            tools=["tool1", "tool2"],
            model="sonnet",
            version="2.0"
        )
        target = CanonicalAgent(
            name="target-agent",
            description="Target description",
            instructions="Target instructions",
            tools=["tool3"],
            model="opus",
            version="1.0"
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_agents(source, target)

        assert merged.name == "source-agent"
        assert merged.description == "Source description"
        assert merged.instructions == "Source instructions"
        assert merged.tools == ["tool1", "tool2"]
        assert merged.model == "sonnet"
        assert merged.version == "2.0"

    def test_merge_agents_falls_back_to_target_model(self):
        """Test that model falls back to target if source is None."""
        from core.canonical_models import CanonicalAgent

        source = CanonicalAgent(
            name="agent",
            description="Description",
            instructions="Instructions",
            model=None
        )
        target = CanonicalAgent(
            name="agent",
            description="Description",
            instructions="Instructions",
            model="opus"
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_agents(source, target)

        assert merged.model == "opus"

    def test_merge_agents_preserves_and_merges_metadata(self):
        """Test that metadata is merged with target preserved and source added."""
        from core.canonical_models import CanonicalAgent

        source = CanonicalAgent(
            name="agent",
            description="Description",
            instructions="Instructions",
            metadata={"source_key": "source_value", "shared_key": "source_wins"}
        )
        target = CanonicalAgent(
            name="agent",
            description="Description",
            instructions="Instructions",
            metadata={"target_key": "target_value", "shared_key": "target_value"},
            source_format="copilot"
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_agents(source, target)

        # Target metadata preserved
        assert merged.metadata["target_key"] == "target_value"
        # Source metadata added (but doesn't overwrite existing)
        assert merged.metadata["source_key"] == "source_value"
        # Target source_format preserved
        assert merged.source_format == "copilot"


class TestMergeSlashCommands:
    """Tests for _merge_slash_commands method."""

    def test_merge_slash_commands_uses_source_core_fields(self):
        """Test that core fields come from source slash command."""
        from core.canonical_models import CanonicalSlashCommand

        source = CanonicalSlashCommand(
            name="source-cmd",
            description="Source description",
            instructions="Source instructions",
            allowed_tools=["tool1", "tool2"],
            argument_hint="source hint",
            model="sonnet",
            version="2.0"
        )
        target = CanonicalSlashCommand(
            name="target-cmd",
            description="Target description",
            instructions="Target instructions",
            allowed_tools=["tool3"],
            argument_hint="target hint",
            model="opus",
            version="1.0"
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.SLASH_COMMAND,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_slash_commands(source, target)

        assert merged.name == "source-cmd"
        assert merged.description == "Source description"
        assert merged.instructions == "Source instructions"
        assert merged.allowed_tools == ["tool1", "tool2"]
        assert merged.argument_hint == "source hint"
        assert merged.model == "sonnet"
        assert merged.version == "2.0"

    def test_merge_slash_commands_falls_back_to_target(self):
        """Test fallback to target for argument_hint and model."""
        from core.canonical_models import CanonicalSlashCommand

        source = CanonicalSlashCommand(
            name="cmd",
            description="Description",
            instructions="Instructions",
            argument_hint=None,
            model=None
        )
        target = CanonicalSlashCommand(
            name="cmd",
            description="Description",
            instructions="Instructions",
            argument_hint="target hint",
            model="opus"
        )

        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path("/tmp/source"),
            target_dir=Path("/tmp/target"),
            source_format="claude",
            target_format="copilot",
            config_type=ConfigType.SLASH_COMMAND,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        merged = orchestrator._merge_slash_commands(source, target)

        assert merged.argument_hint == "target hint"
        assert merged.model == "opus"


class TestSyncFileCLI:
    """Tests for --sync-file CLI argument parsing and validation."""

    def test_sync_file_requires_target_file(self, tmp_path):
        """Test that --sync-file requires --target-file."""
        source_file = tmp_path / "source.json"
        source_file.write_text('{"permissions": {"allow": [], "deny": [], "ask": []}}')

        result = main([
            '--sync-file', str(source_file),
            '--source-format', 'claude',
            '--target-format', 'claude',
            '--only', 'permissions'
        ])

        assert result == EXIT_ERROR

    def test_sync_file_requires_formats(self, tmp_path):
        """Test that --sync-file requires format arguments."""
        source_file = tmp_path / "source.json"
        target_file = tmp_path / "target.json"
        source_file.write_text('{"permissions": {"allow": [], "deny": [], "ask": []}}')
        target_file.write_text('{"permissions": {"allow": [], "deny": [], "ask": []}}')

        # Missing --source-format and --target-format
        result = main([
            '--sync-file', str(source_file),
            '--target-file', str(target_file),
            '--only', 'permissions'
        ])

        assert result == EXIT_ERROR

    def test_sync_file_mutual_exclusivity_with_source_dir(self, tmp_path):
        """Test that --sync-file is mutually exclusive with --source-dir."""
        source_file = tmp_path / "source.json"
        target_file = tmp_path / "target.json"
        source_file.write_text('{"permissions": {"allow": [], "deny": [], "ask": []}}')
        target_file.write_text('{"permissions": {"allow": [], "deny": [], "ask": []}}')

        result = main([
            '--sync-file', str(source_file),
            '--target-file', str(target_file),
            '--source-dir', str(tmp_path),
            '--source-format', 'claude',
            '--target-format', 'claude',
            '--only', 'permissions'
        ])

        assert result == EXIT_ERROR

    def test_sync_file_success(self, tmp_path):
        """Test successful --sync-file invocation."""
        source_file = tmp_path / "source.json"
        target_file = tmp_path / "target.json"
        source_file.write_text('{"permissions": {"allow": ["NewRule"], "deny": [], "ask": []}}')
        target_file.write_text('{"permissions": {"allow": ["ExistingRule"], "deny": [], "ask": []}}')

        result = main([
            '--sync-file', str(source_file),
            '--target-file', str(target_file),
            '--source-format', 'claude',
            '--target-format', 'claude',
            '--only', 'permissions'
        ])

        assert result == EXIT_SUCCESS

        # Verify merge happened
        merged = json.loads(target_file.read_text())
        assert "NewRule" in merged["permissions"]["allow"]
        assert "ExistingRule" in merged["permissions"]["allow"]

    def test_sync_file_with_bidirectional(self, tmp_path):
        """Test --sync-file with --bidirectional flag."""
        source_file = tmp_path / "source.json"
        target_file = tmp_path / "target.json"
        source_file.write_text('{"permissions": {"allow": ["SourceRule"], "deny": [], "ask": []}}')
        target_file.write_text('{"permissions": {"allow": ["TargetRule"], "deny": [], "ask": []}}')

        result = main([
            '--sync-file', str(source_file),
            '--target-file', str(target_file),
            '--source-format', 'claude',
            '--target-format', 'claude',
            '--only', 'permissions',
            '--bidirectional'
        ])

        assert result == EXIT_SUCCESS

        # Verify bidirectional merge
        source_merged = json.loads(source_file.read_text())
        target_merged = json.loads(target_file.read_text())

        assert "SourceRule" in target_merged["permissions"]["allow"]
        assert "TargetRule" in target_merged["permissions"]["allow"]
        assert "SourceRule" in source_merged["permissions"]["allow"]
        assert "TargetRule" in source_merged["permissions"]["allow"]

    def test_sync_file_source_not_found(self, tmp_path):
        """Test error when source file doesn't exist via CLI."""
        target_file = tmp_path / "target.json"
        target_file.write_text('{"permissions": {"allow": [], "deny": [], "ask": []}}')

        result = main([
            '--sync-file', str(tmp_path / "nonexistent.json"),
            '--target-file', str(target_file),
            '--source-format', 'claude',
            '--target-format', 'claude',
            '--only', 'permissions'
        ])

        assert result == EXIT_ERROR


class TestOrchestratorWarningAccumulation:
    """Test that orchestrator accumulates warnings across multiple file conversions."""

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

    def test_warning_accumulation_across_multiple_files(self, tmp_path, registry, state_manager):
        """Test that warnings accumulate across multiple file conversions in directory sync."""
        # For this test, we'll create multiple agent files with deny rules in their metadata
        # Since Claude permissions only work with settings.json (single file), we'll use
        # a different approach: sync agents that contain tool restrictions

        # Actually, let's test with the in-place sync mode which does work with multiple files
        # But for directory sync, Claude only has one settings.json file per directory
        # So we'll create a scenario with multiple syncs in succession

        # Create source file with deny rules
        source_dir = tmp_path / "source"
        source_dir.mkdir()
        (source_dir / "settings.json").write_text(json.dumps({
            "permissions": {
                "deny": ["Bash(rm:*)", "Bash(dd:*)"]
            }
        }))

        # Create target directory
        target_dir = tmp_path / "target"
        target_dir.mkdir()

        # Create orchestrator
        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=state_manager,
            direction='source-to-target',
            dry_run=False,
            force=False,
            verbose=False
        )

        # Run sync
        orchestrator.sync()

        # Get accumulated warnings
        warnings = orchestrator.get_all_warnings()

        # Should have 2 warnings (one from each deny rule)
        assert len(warnings) == 2
        assert any("Bash(rm:*)" in w for w in warnings)
        assert any("Bash(dd:*)" in w for w in warnings)

    def test_warning_accumulation_with_bidirectional_sync(self, tmp_path, registry, state_manager):
        """Test that warnings accumulate from both directions in bidirectional sync."""
        # Create source file with deny rule (will generate warning when converting to copilot)
        source_dir = tmp_path / "source"
        source_dir.mkdir()
        source_file = source_dir / "settings.json"
        source_file.write_text(json.dumps({
            "permissions": {
                "deny": ["Bash(rm:*)"]
            }
        }))

        # Create target directory
        target_dir = tmp_path / "target"
        target_dir.mkdir()

        # Create orchestrator and do initial sync
        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=state_manager,
            direction='both',
            dry_run=False,
            force=False,
            verbose=False
        )

        orchestrator.sync()

        # Should have 1 warning from source-to-target conversion
        warnings = orchestrator.get_all_warnings()
        assert len(warnings) == 1
        assert "Bash(rm:*)" in warnings[0]

    def test_get_all_warnings_returns_copy(self, tmp_path, registry, state_manager):
        """Test that get_all_warnings returns a copy, not the internal list."""
        source_dir = tmp_path / "source"
        source_dir.mkdir()
        target_dir = tmp_path / "target"
        target_dir.mkdir()

        orchestrator = UniversalSyncOrchestrator(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.PERMISSION,
            format_registry=registry,
            state_manager=state_manager,
            direction='both',
            dry_run=False,
            force=False,
            verbose=False
        )

        # Manually add a warning
        orchestrator._accumulated_warnings.append("Test warning")

        # Get warnings
        warnings1 = orchestrator.get_all_warnings()
        warnings2 = orchestrator.get_all_warnings()

        # Should be equal but not the same object
        assert warnings1 == warnings2
        assert warnings1 is not warnings2
        assert warnings1 is not orchestrator._accumulated_warnings

    def test_strict_mode_with_directory_sync(self, tmp_path, registry, state_manager):
        """Test that --strict flag works correctly with directory sync through CLI."""
        # Create source file with deny rules
        source_dir = tmp_path / "source"
        source_dir.mkdir()
        (source_dir / "settings.json").write_text(json.dumps({
            "permissions": {
                "deny": ["Bash(rm:*)"]
            }
        }))

        # Create target directory
        target_dir = tmp_path / "target"
        target_dir.mkdir()

        # Run sync with --strict flag through CLI
        result = main([
            '--source-dir', str(source_dir),
            '--target-dir', str(target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--only', 'permissions',
            '--strict'
        ])

        # Should fail due to lossy conversion
        assert result == EXIT_ERROR

    def test_strict_mode_without_warnings_in_directory_sync(self, tmp_path, registry, state_manager):
        """Test that --strict flag succeeds when no warnings in directory sync."""
        # Create source file with only allow rules (no warnings)
        source_dir = tmp_path / "source"
        source_dir.mkdir()
        (source_dir / "settings.json").write_text(json.dumps({
            "permissions": {
                "allow": ["Bash(ls:*)"]
            }
        }))

        # Create target directory
        target_dir = tmp_path / "target"
        target_dir.mkdir()

        # Run sync with --strict flag through CLI
        result = main([
            '--source-dir', str(source_dir),
            '--target-dir', str(target_dir),
            '--source-format', 'claude',
            '--target-format', 'copilot',
            '--only', 'permissions',
            '--strict'
        ])

        # Should succeed (no warnings)
        assert result == EXIT_SUCCESS


class TestSyncAllConfigTypes:
    """Tests for sync_all_config_types() function."""

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

    def test_sync_all_config_types_auto_detect(self, registry, state_manager, tmp_path):
        """Test auto-detection of config types from directory structure."""
        from core.orchestrator import sync_all_config_types, SyncResult
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create agents directory with agent file
        agents_dir = source_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "test-agent.md").write_text("""---
name: test-agent
description: Test agent
---
Instructions.
""")

        # Create commands directory with command file
        commands_dir = source_dir / "commands"
        commands_dir.mkdir()
        (commands_dir / "test-cmd.md").write_text("""---
description: Test command
---
Command instructions.
""")

        # Track output
        output_lines = []
        def capture_log(msg=""):
            output_lines.append(msg)

        results = sync_all_config_types(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            config_types=None,  # Auto-detect
            skip_confirmation=True,
            logger=capture_log,
        )

        # Should have results for detected config types
        assert len(results) >= 1
        # All results should be successful
        for result in results.values():
            assert result.success

    def test_sync_all_config_types_explicit_types(self, registry, state_manager, tmp_path):
        """Test syncing explicit config types."""
        from core.orchestrator import sync_all_config_types
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create agents subdirectory with agent file
        # sync_all_config_types uses subdirectory-based detection
        agents_dir = source_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "test.md").write_text("""---
name: test
description: Test agent
---
Instructions.
""")

        # Create target agents directory too
        target_agents_dir = target_dir / "agents"
        target_agents_dir.mkdir()

        output_lines = []
        results = sync_all_config_types(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            config_types=[ConfigType.AGENT],
            skip_confirmation=True,
            logger=lambda msg="": output_lines.append(msg),
        )

        # With explicit config_types, sync runs for the specified type
        assert ConfigType.AGENT in results
        assert results[ConfigType.AGENT].success

    def test_sync_all_config_types_preview_display(self, registry, state_manager, tmp_path):
        """Test that preview displays detected configurations."""
        from core.orchestrator import sync_all_config_types
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create agents directory with agent files
        agents_dir = source_dir / "agents"
        agents_dir.mkdir()
        for i in range(3):
            (agents_dir / f"agent-{i}.md").write_text(f"""---
name: agent-{i}
description: Agent {i}
---
Instructions.
""")

        output_lines = []
        sync_all_config_types(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            skip_confirmation=True,
            logger=lambda msg="": output_lines.append(msg),
        )

        # Should have preview output
        output = '\n'.join(output_lines)
        assert 'Detected configurations:' in output
        assert 'agent' in output.lower()

    def test_sync_all_config_types_user_confirmation(self, registry, state_manager, tmp_path):
        """Test user confirmation is requested when skip_confirmation=False."""
        from core.orchestrator import sync_all_config_types
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create agents directory with agent file (for detection)
        agents_dir = source_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "test.md").write_text("""---
name: test
description: Test
---
Instructions.
""")

        output_lines = []
        # Mock input to decline
        with patch('builtins.input', return_value='n'):
            results = sync_all_config_types(
                source_dir=source_dir,
                target_dir=target_dir,
                source_format='claude',
                target_format='copilot',
                format_registry=registry,
                state_manager=state_manager,
                skip_confirmation=False,  # Will prompt
                logger=lambda msg="": output_lines.append(msg),
            )

        # Should be empty (user cancelled)
        assert len(results) == 0
        output = '\n'.join(output_lines)
        assert 'cancelled' in output.lower()

    def test_sync_all_config_types_error_continues(self, registry, state_manager, tmp_path):
        """Test that errors in one config type don't block others."""
        from core.orchestrator import sync_all_config_types
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create valid agent in agents/ subdirectory (via adapter.get_config_subdir())
        agents_dir = source_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "good-agent.md").write_text("""---
name: good-agent
description: Good agent
---
Instructions.
""")

        # Create invalid permission file (settings.json is Claude's permission file format)
        # Invalid JSON will fail to parse during sync
        (source_dir / "settings.json").write_text("invalid json {{{")

        output_lines = []
        results = sync_all_config_types(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            config_types=[ConfigType.AGENT, ConfigType.PERMISSION],
            skip_confirmation=True,
            logger=lambda msg="": output_lines.append(msg),
        )

        # Should have results for both types
        assert len(results) == 2
        # AGENT should succeed
        assert results[ConfigType.AGENT].success
        # PERMISSION should have recorded errors (in stats, not as fatal error)
        # The orchestrator continues even when individual files fail to parse
        perm_result = results[ConfigType.PERMISSION]
        assert perm_result.stats['errors'] >= 1 or not perm_result.success

    def test_sync_all_config_types_combined_summary(self, registry, state_manager, tmp_path):
        """Test combined summary is displayed for multiple config types."""
        from core.orchestrator import sync_all_config_types
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create agents directory with agent file
        agents_dir = source_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "test-agent.md").write_text("""---
name: test-agent
description: Test agent
---
Instructions.
""")

        # Create commands directory with command file
        commands_dir = source_dir / "commands"
        commands_dir.mkdir()
        (commands_dir / "test-cmd.md").write_text("""---
description: Test command
---
Command instructions.
""")

        output_lines = []
        results = sync_all_config_types(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            skip_confirmation=True,
            logger=lambda msg="": output_lines.append(msg),
        )

        # Should have combined summary
        output = '\n'.join(output_lines)
        if len(results) > 1:
            assert 'Combined Summary' in output

    def test_sync_all_config_types_dry_run(self, registry, state_manager, tmp_path):
        """Test dry-run mode doesn't modify files."""
        from core.orchestrator import sync_all_config_types
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        # Create agent in agents/ subdirectory (via adapter.get_config_subdir())
        agents_dir = source_dir / "agents"
        agents_dir.mkdir()
        (agents_dir / "test.md").write_text("""---
name: test
description: Test
---
Instructions.
""")

        output_lines = []
        sync_all_config_types(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            config_types=[ConfigType.AGENT],
            skip_confirmation=True,
            dry_run=True,
            logger=lambda msg="": output_lines.append(msg),
        )

        # Target file should NOT exist in the agents subdirectory
        assert not (target_dir / "agents" / "test.agent.md").exists()

    def test_sync_all_config_types_no_files(self, registry, state_manager, tmp_path):
        """Test behavior when no files are detected."""
        from core.orchestrator import sync_all_config_types
        
        source_dir = tmp_path / "source"
        target_dir = tmp_path / "target"
        source_dir.mkdir()
        target_dir.mkdir()

        output_lines = []
        results = sync_all_config_types(
            source_dir=source_dir,
            target_dir=target_dir,
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            skip_confirmation=True,
            logger=lambda msg="": output_lines.append(msg),
        )

        # Should return empty results
        assert len(results) == 0
        output = '\n'.join(output_lines)
        assert 'No supported config types' in output or 'No files' in output


class TestSyncResult:
    """Tests for SyncResult dataclass."""

    def test_sync_result_success_property(self):
        """Test success property returns True when no error."""
        from core.orchestrator import SyncResult
        
        result = SyncResult(
            config_type=ConfigType.AGENT,
            stats={'source_to_target': 1, 'errors': 0},
            warnings=[],
            error=None
        )
        assert result.success is True

    def test_sync_result_failure_property(self):
        """Test success property returns False when error exists."""
        from core.orchestrator import SyncResult
        
        result = SyncResult(
            config_type=ConfigType.AGENT,
            stats={'errors': 1},
            warnings=[],
            error="Something went wrong"
        )
        assert result.success is False

    def test_sync_result_with_warnings(self):
        """Test SyncResult can store warnings."""
        from core.orchestrator import SyncResult
        
        result = SyncResult(
            config_type=ConfigType.PERMISSION,
            stats={'source_to_target': 1},
            warnings=["Warning 1", "Warning 2"],
            error=None
        )
        assert len(result.warnings) == 2
        assert result.success is True
