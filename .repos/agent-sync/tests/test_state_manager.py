"""
Unit tests for SyncStateManager.

Tests cover:
- Initialization and default paths
- State loading from file (including corrupted files)
- State saving to file
- Pair key generation
- Pair state management
- File state tracking (get_file_state, update_file_state)
- State removal (remove_file_state, clear_pair_state)
- Persistence across instances
"""

import pytest
import json
import os
import stat
from unittest import mock
from pathlib import Path

from core.state_manager import SyncStateManager


class TestSyncStateManager:
    """Tests for SyncStateManager."""

    # =========================================================================
    # Fixtures
    # =========================================================================

    @pytest.fixture
    def state_file(self, tmp_path):
        """Create temporary state file path."""
        return tmp_path / "test_state.json"

    @pytest.fixture
    def state_manager(self, state_file):
        """Create SyncStateManager with temp file."""
        return SyncStateManager(state_file)

    @pytest.fixture
    def source_dir(self, tmp_path):
        """Temporary source directory."""
        return tmp_path / "source"

    @pytest.fixture
    def target_dir(self, tmp_path):
        """Temporary target directory."""
        return tmp_path / "target"

    # =========================================================================
    # Phase 1: Initialization Tests
    # =========================================================================

    def test_create_manager(self, state_manager):
        """Test creating state manager initializes state dict."""
        assert state_manager.state is not None
        assert "sync_pairs" in state_manager.state
        assert isinstance(state_manager.state["sync_pairs"], dict)

    def test_create_manager_custom_path(self, state_file):
        """Test custom state file path is used."""
        manager = SyncStateManager(state_file)
        assert manager.state_file == state_file

    def test_create_manager_default_path(self):
        """Test default path is ~/.agent_sync_state.json."""
        manager = SyncStateManager()
        expected_path = Path.home() / ".agent_sync_state.json"
        assert manager.state_file == expected_path

    # =========================================================================
    # Phase 2: State Loading Tests
    # =========================================================================

    def test_load_empty_state(self, state_file):
        """Test loading when state file doesn't exist returns empty structure."""
        assert not state_file.exists()
        manager = SyncStateManager(state_file)
        assert manager.state == {"version": 1, "sync_pairs": {}}

    def test_load_existing_state(self, state_file):
        """Test loading pre-existing valid JSON state."""
        existing_state = {
            "sync_pairs": {
                "/source|/target": {
                    "last_sync": "2025-01-15T10:30:00",
                    "files": {
                        "agent1": {
                            "source_mtime": 12345.0,
                            "target_mtime": 12346.0,
                            "last_action": "source_to_target",
                            "last_sync_time": "2025-01-15T10:30:00"
                        }
                    }
                }
            }
        }
        state_file.write_text(json.dumps(existing_state))

        manager = SyncStateManager(state_file)
        # Should add version: 1 automatically
        assert manager.state["version"] == 1
        assert manager.state["sync_pairs"] == existing_state["sync_pairs"]
        assert "/source|/target" in manager.state["sync_pairs"]
        assert manager.state["sync_pairs"]["/source|/target"]["files"]["agent1"]["source_mtime"] == 12345.0

    def test_load_corrupted_state(self, state_file):
        """Test invalid JSON returns empty structure (graceful degradation)."""
        state_file.write_text("{ invalid json content }")

        manager = SyncStateManager(state_file)
        assert manager.state == {"version": 1, "sync_pairs": {}}

    def test_load_empty_file(self, state_file):
        """Test empty file returns empty structure."""
        state_file.write_text("")

        manager = SyncStateManager(state_file)
        assert manager.state == {"version": 1, "sync_pairs": {}}

    # =========================================================================
    # Phase 3: State Saving Tests
    # =========================================================================

    def test_save_state(self, state_manager, state_file):
        """Test save creates file with correct JSON."""
        state_manager.state["sync_pairs"]["test_pair"] = {"last_sync": None, "files": {}}
        state_manager.save()

        assert state_file.exists()
        with open(state_file) as f:
            data = json.load(f)
        assert "test_pair" in data["sync_pairs"]

    def test_save_state_creates_file(self, state_file):
        """Test save creates new file if doesn't exist."""
        assert not state_file.exists()
        manager = SyncStateManager(state_file)
        manager.save()
        assert state_file.exists()

    def test_save_state_overwrites(self, state_file):
        """Test save overwrites existing file."""
        # Create initial state
        initial_state = {"sync_pairs": {"old_pair": {}}}
        state_file.write_text(json.dumps(initial_state))

        # Load and modify
        manager = SyncStateManager(state_file)
        manager.state["sync_pairs"] = {"new_pair": {"last_sync": None, "files": {}}}
        manager.save()

        # Verify overwritten
        with open(state_file) as f:
            data = json.load(f)
        assert "old_pair" not in data["sync_pairs"]
        assert "new_pair" in data["sync_pairs"]

    def test_save_state_formatting(self, state_manager, state_file):
        """Test save uses 2-space indent JSON formatting."""
        state_manager.state["sync_pairs"]["test"] = {"last_sync": None, "files": {}}
        state_manager.save()

        content = state_file.read_text()
        # Check for 2-space indentation
        assert '  "sync_pairs"' in content
        assert '    "test"' in content

    # =========================================================================
    # Phase 4: Pair Key Generation Tests
    # =========================================================================

    def test_get_pair_key_format(self, state_manager, source_dir, target_dir):
        """Test key is {source}|{target} format."""
        key = state_manager.get_pair_key(source_dir, target_dir)
        assert "|" in key
        parts = key.split("|")
        assert len(parts) == 2
        assert Path(parts[0]) == source_dir.resolve()
        assert Path(parts[1]) == target_dir.resolve()

    def test_get_pair_key_resolves_paths(self, state_manager, tmp_path):
        """Test relative paths are resolved to absolute."""
        # Create a relative path scenario
        relative_source = Path("./relative/source")
        relative_target = Path("./relative/target")

        key = state_manager.get_pair_key(relative_source, relative_target)

        # Key should contain absolute paths (resolved from cwd)
        assert not key.startswith("./")
        assert "|" in key

    def test_get_pair_key_consistent(self, state_manager, source_dir, target_dir):
        """Test same inputs produce same key."""
        key1 = state_manager.get_pair_key(source_dir, target_dir)
        key2 = state_manager.get_pair_key(source_dir, target_dir)
        assert key1 == key2

    # =========================================================================
    # Phase 5: Pair State Tests
    # =========================================================================

    def test_get_pair_state_creates_new(self, state_manager, source_dir, target_dir):
        """Test first access creates entry with empty files dict."""
        pair_state = state_manager.get_pair_state(source_dir, target_dir)

        assert pair_state is not None
        assert "last_sync" in pair_state
        assert pair_state["last_sync"] is None
        assert "files" in pair_state
        assert pair_state["files"] == {}

    def test_get_pair_state_returns_existing(self, state_manager, source_dir, target_dir):
        """Test subsequent access returns same object reference."""
        pair_state1 = state_manager.get_pair_state(source_dir, target_dir)
        pair_state1["files"]["test"] = {"data": "value"}

        pair_state2 = state_manager.get_pair_state(source_dir, target_dir)

        # Should be same object (modifications visible)
        assert pair_state2["files"]["test"]["data"] == "value"

    def test_get_pair_state_structure(self, state_manager, source_dir, target_dir):
        """Test pair state has correct structure."""
        pair_state = state_manager.get_pair_state(source_dir, target_dir)

        assert set(pair_state.keys()) == {"last_sync", "files"}
        assert isinstance(pair_state["files"], dict)

    # =========================================================================
    # Phase 6: File State Tracking Tests
    # =========================================================================

    def test_update_file_state(self, state_manager, source_dir, target_dir):
        """Test storing mtime values and action."""
        state_manager.update_file_state(
            source_dir, target_dir,
            "test-agent",
            source_mtime=12345.0,
            target_mtime=12346.0,
            action="source_to_target"
        )

        file_state = state_manager.get_file_state(source_dir, target_dir, "test-agent")
        assert file_state["source_mtime"] == 12345.0
        assert file_state["target_mtime"] == 12346.0
        assert file_state["last_action"] == "source_to_target"

    def test_update_file_state_timestamps(self, state_manager, source_dir, target_dir):
        """Test last_sync_time is auto-generated."""
        state_manager.update_file_state(
            source_dir, target_dir,
            "test-agent",
            source_mtime=12345.0,
            target_mtime=12346.0,
            action="source_to_target"
        )

        file_state = state_manager.get_file_state(source_dir, target_dir, "test-agent")
        assert "last_sync_time" in file_state
        # Should be ISO format timestamp
        assert "T" in file_state["last_sync_time"]

    def test_update_file_state_updates_pair_last_sync(self, state_manager, source_dir, target_dir):
        """Test pair-level last_sync timestamp is updated."""
        # Initially None
        pair_state = state_manager.get_pair_state(source_dir, target_dir)
        assert pair_state["last_sync"] is None

        state_manager.update_file_state(
            source_dir, target_dir,
            "test-agent",
            source_mtime=12345.0,
            target_mtime=12346.0,
            action="source_to_target"
        )

        # Now should have timestamp
        assert pair_state["last_sync"] is not None
        assert "T" in pair_state["last_sync"]

    def test_update_file_state_none_mtimes(self, state_manager, source_dir, target_dir):
        """Test allowing None for deleted files."""
        state_manager.update_file_state(
            source_dir, target_dir,
            "deleted-agent",
            source_mtime=None,
            target_mtime=None,
            action="deleted"
        )

        file_state = state_manager.get_file_state(source_dir, target_dir, "deleted-agent")
        assert file_state["source_mtime"] is None
        assert file_state["target_mtime"] is None

    def test_get_file_state_exists(self, state_manager, source_dir, target_dir):
        """Test retrieving stored file state."""
        state_manager.update_file_state(
            source_dir, target_dir,
            "existing-agent",
            source_mtime=11111.0,
            target_mtime=22222.0,
            action="target_to_source"
        )

        file_state = state_manager.get_file_state(source_dir, target_dir, "existing-agent")
        assert file_state is not None
        assert file_state["source_mtime"] == 11111.0
        assert file_state["target_mtime"] == 22222.0
        assert file_state["last_action"] == "target_to_source"

    def test_get_file_state_not_exists(self, state_manager, source_dir, target_dir):
        """Test returns None for unknown file."""
        file_state = state_manager.get_file_state(source_dir, target_dir, "nonexistent-agent")
        assert file_state is None

    # =========================================================================
    # Phase 7: State Removal Tests
    # =========================================================================

    def test_remove_file_state(self, state_manager, source_dir, target_dir):
        """Test removing specific file from state."""
        # Add file state
        state_manager.update_file_state(
            source_dir, target_dir,
            "agent-to-remove",
            source_mtime=12345.0,
            target_mtime=12346.0,
            action="source_to_target"
        )
        assert state_manager.get_file_state(source_dir, target_dir, "agent-to-remove") is not None

        # Remove it
        state_manager.remove_file_state(source_dir, target_dir, "agent-to-remove")

        # Should be gone
        assert state_manager.get_file_state(source_dir, target_dir, "agent-to-remove") is None

    def test_remove_file_state_not_exists(self, state_manager, source_dir, target_dir):
        """Test no error when removing non-existent file."""
        # Should not raise
        state_manager.remove_file_state(source_dir, target_dir, "never-existed")

    def test_clear_pair_state(self, state_manager, source_dir, target_dir):
        """Test removing entire pair entry."""
        # Add some state
        state_manager.update_file_state(
            source_dir, target_dir,
            "agent1",
            source_mtime=12345.0,
            target_mtime=12346.0,
            action="source_to_target"
        )
        key = state_manager.get_pair_key(source_dir, target_dir)
        assert key in state_manager.state["sync_pairs"]

        # Clear the pair
        state_manager.clear_pair_state(source_dir, target_dir)

        # Pair should be gone
        assert key not in state_manager.state["sync_pairs"]

    def test_clear_pair_state_not_exists(self, state_manager, source_dir, target_dir):
        """Test no error when clearing non-existent pair."""
        # Should not raise
        state_manager.clear_pair_state(source_dir, target_dir)

    # =========================================================================
    # Phase 8: Integration/Persistence Tests
    # =========================================================================

    def test_state_persists_across_instances(self, state_file, source_dir, target_dir):
        """Test save, new instance, verify data loaded."""
        # Create and populate first instance
        manager1 = SyncStateManager(state_file)
        manager1.update_file_state(
            source_dir, target_dir,
            "persistent-agent",
            source_mtime=99999.0,
            target_mtime=88888.0,
            action="source_to_target"
        )
        manager1.save()

        # Create new instance
        manager2 = SyncStateManager(state_file)

        # Verify data persisted
        file_state = manager2.get_file_state(source_dir, target_dir, "persistent-agent")
        assert file_state is not None
        assert file_state["source_mtime"] == 99999.0
        assert file_state["target_mtime"] == 88888.0

    def test_multiple_files_same_pair(self, state_manager, source_dir, target_dir):
        """Test tracking multiple files in one pair."""
        state_manager.update_file_state(
            source_dir, target_dir,
            "agent-alpha",
            source_mtime=11111.0,
            target_mtime=11112.0,
            action="source_to_target"
        )
        state_manager.update_file_state(
            source_dir, target_dir,
            "agent-beta",
            source_mtime=22221.0,
            target_mtime=22222.0,
            action="target_to_source"
        )
        state_manager.update_file_state(
            source_dir, target_dir,
            "agent-gamma",
            source_mtime=33331.0,
            target_mtime=33332.0,
            action="source_to_target"
        )

        pair_state = state_manager.get_pair_state(source_dir, target_dir)
        assert len(pair_state["files"]) == 3
        assert "agent-alpha" in pair_state["files"]
        assert "agent-beta" in pair_state["files"]
        assert "agent-gamma" in pair_state["files"]

    def test_multiple_pairs(self, state_manager, tmp_path):
        """Test tracking multiple directory pairs."""
        source1 = tmp_path / "source1"
        target1 = tmp_path / "target1"
        source2 = tmp_path / "source2"
        target2 = tmp_path / "target2"

        state_manager.update_file_state(
            source1, target1,
            "agent-pair1",
            source_mtime=11111.0,
            target_mtime=11112.0,
            action="source_to_target"
        )
        state_manager.update_file_state(
            source2, target2,
            "agent-pair2",
            source_mtime=22221.0,
            target_mtime=22222.0,
            action="target_to_source"
        )

        # Verify separate pairs
        assert len(state_manager.state["sync_pairs"]) == 2

        file1 = state_manager.get_file_state(source1, target1, "agent-pair1")
        file2 = state_manager.get_file_state(source2, target2, "agent-pair2")

        assert file1["source_mtime"] == 11111.0
        assert file2["source_mtime"] == 22221.0

        # Verify no cross-contamination
        assert state_manager.get_file_state(source1, target1, "agent-pair2") is None
        assert state_manager.get_file_state(source2, target2, "agent-pair1") is None

    # =========================================================================
    # Phase 9: New Feature Tests (Metadata, Permissions, Errors)
    # =========================================================================

    def test_update_file_state_with_metadata(self, state_manager, source_dir, target_dir):
        """Test saving metadata (formats, config type) to pair state."""
        state_manager.update_file_state(
            source_dir, target_dir,
            "meta-agent",
            source_mtime=123.0,
            target_mtime=456.0,
            action="source_to_target",
            source_format="claude",
            target_format="copilot",
            config_type="agent"
        )

        pair_state = state_manager.get_pair_state(source_dir, target_dir)
        assert pair_state["source_format"] == "claude"
        assert pair_state["target_format"] == "copilot"
        assert pair_state["config_type"] == "agent"

    def test_save_permissions(self, state_manager, state_file):
        """Test state file is saved with restrictive permissions (0600)."""
        state_manager.state["sync_pairs"]["test"] = {}
        state_manager.save()
        
        # Check permissions
        if os.name == 'posix':
            st = os.stat(state_file)
            assert stat.S_IMODE(st.st_mode) == 0o600

    def test_save_error_handling(self, state_manager):
        """Test save handles I/O errors gracefully."""
        # Mock NamedTemporaryFile to raise OSError
        with mock.patch('tempfile.NamedTemporaryFile') as mock_temp:
            mock_temp.side_effect = OSError("Disk full")
            
            with pytest.raises(IOError, match="Failed to save state file"):
                state_manager.save()
