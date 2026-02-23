"""
Sync state manager for tracking file modification history.

The state manager persists sync history to avoid unnecessary syncs and
enable intelligent change detection. It tracks:
- Last sync time per directory pair
- File modification times at last sync
- Last sync action (which direction)
- Sync metadata (conflicts resolved, errors, etc.)

State is stored in ~/.agent_sync_state.json by default, allowing it to
work across multiple projects and repositories.
"""

import json
import os
import tempfile
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime


class SyncStateManager:
    """
    Manages sync state persistence and retrieval.

    State format:
    {
      "version": 1,
      "sync_pairs": {
        "/home/user/.claude/agents|/home/user/project/.github/agents": {
          "last_sync": "2025-01-15T10:30:00Z",
          "source_format": "claude",
          "target_format": "copilot",
          "config_type": "agent",
          "files": {
            "planner": {
              "source_mtime": 1705315800.0,
              "target_mtime": 1705315800.0,
              "last_action": "source_to_target",
              "last_sync_time": "2025-01-15T10:30:00Z"
            }
          }
        }
      }
    }

    Usage:
        state_manager = SyncStateManager()
        file_state = state_manager.get_file_state(source_dir, target_dir, 'planner')
        state_manager.update_file_state(source_dir, target_dir, 'planner', ...)
        state_manager.save()
    """

    def __init__(self, state_file: Optional[Path] = None):
        """
        Initialize state manager.

        Args:
            state_file: Path to state file (defaults to ~/.agent_sync_state.json)
        """
        try:
            self.state_file = state_file or Path.home() / ".agent_sync_state.json"
        except (RuntimeError, OSError):
            # Fallback to current directory if home is not accessible
            self.state_file = state_file or Path.cwd() / ".agent_sync_state.json"
        
        self.state = self._load_state()

    def _load_state(self) -> Dict:
        """
        Load sync state from file.

        Returns:
            State dictionary or empty structure if file doesn't exist
        """
        default_state = {"version": 1, "sync_pairs": {}}

        if self.state_file.exists():
            try:
                with open(self.state_file, 'r', encoding='utf-8') as f:
                    state = json.load(f)
                    # Add version if missing (migration strategy)
                    if "version" not in state:
                        state["version"] = 1
                    return state
            except json.JSONDecodeError:
                # Corrupted state file, start fresh
                return default_state
        return default_state

    def save(self):
        """
        Save current state to file.

        Uses atomic write (write to temp file then rename) to prevent corruption.
        Sets secure permissions (600) on the file.
        """
        try:
            # Create temp file in same directory to ensure atomic rename works
            # (rename across filesystems can fail)
            directory = self.state_file.parent
            if not directory.exists():
                directory.mkdir(parents=True, exist_ok=True)

            with tempfile.NamedTemporaryFile('w', dir=directory, delete=False, encoding='utf-8') as tf:
                json.dump(self.state, tf, indent=2)
                temp_path = Path(tf.name)

            # Set permissions to read/write for owner only (skip on Windows where it's unsupported)
            try:
                os.chmod(temp_path, 0o600)
            except OSError:
                pass  # Windows doesn't support Unix-style permissions

            # Atomic rename
            temp_path.replace(self.state_file)

        except (IOError, OSError) as e:
            # If we created a temp file but failed to rename, clean it up
            if 'temp_path' in locals() and temp_path.exists():
                try:
                    os.unlink(temp_path)
                except OSError:
                    pass
            # Re-raise to let caller know save failed
            raise IOError(f"Failed to save state file: {e}")

    def get_pair_key(self, source_dir: Path, target_dir: Path) -> str:
        """
        Generate unique key for directory pair.

        Args:
            source_dir: Source directory path
            target_dir: Target directory path

        Returns:
            Unique key string
        """
        return f"{source_dir.resolve()}|{target_dir.resolve()}"

    def get_pair_state(self, source_dir: Path, target_dir: Path) -> Dict:
        """
        Get state for specific sync pair.

        Args:
            source_dir: Source directory
            target_dir: Target directory

        Returns:
            State dictionary for this pair
        """
        key = self.get_pair_key(source_dir, target_dir)
        if key not in self.state["sync_pairs"]:
            self.state["sync_pairs"][key] = {
                "last_sync": None,
                "files": {}
            }
        return self.state["sync_pairs"][key]

    def update_file_state(self,
                         source_dir: Path,
                         target_dir: Path,
                         file_name: str,
                         source_mtime: Optional[float],
                         target_mtime: Optional[float],
                         action: str,
                         source_format: Optional[str] = None,
                         target_format: Optional[str] = None,
                         config_type: Optional[str] = None):
        """
        Update state for a specific file after sync.

        Args:
            source_dir: Source directory
            target_dir: Target directory
            file_name: Base name of file (without extension)
            source_mtime: Source file modification time
            target_mtime: Target file modification time
            action: Sync action performed (source_to_target, target_to_source, etc.)
            source_format: Format of source files (e.g., 'claude')
            target_format: Format of target files (e.g., 'copilot')
            config_type: Type of configuration (e.g., 'agent')
        """
        pair_state = self.get_pair_state(source_dir, target_dir)

        # Update pair metadata if provided
        if source_format:
            pair_state["source_format"] = source_format
        if target_format:
            pair_state["target_format"] = target_format
        if config_type:
            pair_state["config_type"] = config_type

        pair_state["files"][file_name.lower()] = {
            "source_mtime": source_mtime,
            "target_mtime": target_mtime,
            "last_action": action,
            "last_sync_time": datetime.now().isoformat()
        }
        pair_state["last_sync"] = datetime.now().isoformat()

    def get_file_state(self,
                      source_dir: Path,
                      target_dir: Path,
                      file_name: str) -> Optional[Dict]:
        """
        Get state for a specific file.

        Args:
            source_dir: Source directory
            target_dir: Target directory
            file_name: Base name of file

        Returns:
            File state dict or None if no previous sync
        """
        pair_state = self.get_pair_state(source_dir, target_dir)
        return pair_state["files"].get(file_name.lower())

    def remove_file_state(self,
                         source_dir: Path,
                         target_dir: Path,
                         file_name: str):
        """
        Remove state for a specific file (e.g., after deletion).

        Args:
            source_dir: Source directory
            target_dir: Target directory
            file_name: Base name of file to remove
        """
        pair_state = self.get_pair_state(source_dir, target_dir)
        if file_name.lower() in pair_state["files"]:
            del pair_state["files"][file_name.lower()]

    def clear_pair_state(self, source_dir: Path, target_dir: Path):
        """
        Clear all state for a directory pair.

        Args:
            source_dir: Source directory
            target_dir: Target directory
        """
        key = self.get_pair_key(source_dir, target_dir)
        if key in self.state["sync_pairs"]:
            del self.state["sync_pairs"][key]
