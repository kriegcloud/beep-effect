"""
Universal sync orchestrator for coordinating multi-format synchronization.

The orchestrator is responsible for:
- Discovering file pairs across formats
- Determining sync actions (which direction, conflicts, deletions)
- Executing conversions via adapters
- Conflict resolution (interactive or automatic)
- Dry-run mode
- Statistics and reporting

This replaces the format-specific AgentSyncer with a universal version
that works with any formats through the adapter interface.
"""

import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime

from .canonical_models import ConfigType, CanonicalAgent, CanonicalPermission, CanonicalSlashCommand
from .registry import FormatRegistry
from .state_manager import SyncStateManager


@dataclass
class FilePair:
    """
    Represents a matched pair of files across formats.

    Attributes:
        base_name: Common identifier (e.g., 'planner' for planner.md <-> planner.agent.md)
        source_path: Path to source file (or None if doesn't exist)
        target_path: Path to target file (or None if doesn't exist)
        source_mtime: Source file modification time
        target_mtime: Target file modification time
    """
    base_name: str
    source_path: Optional[Path]
    target_path: Optional[Path]
    source_mtime: Optional[float]
    target_mtime: Optional[float]


@dataclass
class SyncResult:
    """
    Result of syncing a single config type.

    Attributes:
        config_type: The ConfigType that was synced
        stats: Dictionary of sync statistics
        warnings: List of warnings generated during sync
        error: Error message if sync failed, None if successful
    """
    config_type: ConfigType
    stats: Dict[str, int]
    warnings: List[str]
    error: Optional[str] = None

    @property
    def success(self) -> bool:
        """Return True if sync completed without fatal error."""
        return self.error is None


class UniversalSyncOrchestrator:
    """
    Orchestrates synchronization between any two formats.

    This is the main entry point for sync operations. It coordinates:
    1. File discovery and matching
    2. Change detection via state manager
    3. Conflict resolution
    4. Format conversion via adapters
    5. Statistics tracking

    Example:
        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        orchestrator = UniversalSyncOrchestrator(
            source_dir=Path('~/.claude/agents'),
            target_dir=Path('.github/agents'),
            source_format='claude',
            target_format='copilot',
            config_type=ConfigType.AGENT,
            format_registry=registry,
            state_manager=SyncStateManager()
        )

        orchestrator.sync()
    """

    def __init__(self,
                 source_dir: Path,
                 target_dir: Path,
                 source_format: str,
                 target_format: str,
                 config_type: ConfigType,
                 format_registry: FormatRegistry,
                 state_manager: SyncStateManager,
                 direction: str = 'both',
                 dry_run: bool = False,
                 force: bool = False,
                 auto_confirm: bool = False,
                 verbose: bool = False,
                 strict: bool = False,
                 conversion_options: Optional[Dict[str, Any]] = None,
                 logger: Optional[Any] = None,
                 conflict_resolver: Optional[Any] = None):
        """
        Initialize sync orchestrator.

        Args:
            source_dir: Primary source directory
            target_dir: Primary target directory
            source_format: Source format name (e.g., 'claude')
            target_format: Target format name (e.g., 'copilot')
            config_type: Type of config to sync (AGENT, PERMISSION, SLASH_COMMAND)
            format_registry: Registry containing adapters
            state_manager: State tracking manager
            direction: 'both', 'source-to-target', or 'target-to-source'
            dry_run: If True, don't actually modify files
            force: If True, auto-resolve conflicts using newest file
            auto_confirm: If True, skip confirmation prompts (same behavior as force)
            verbose: If True, print detailed logs
            strict: If True, raise ValueError when lossy conversions are detected before any writes
            conversion_options: Options to pass to adapters (e.g., add_argument_hint)
            logger: Callback for logging output (default: print)
            conflict_resolver: Callback for resolving conflicts (default: CLI interactive)
        """
        self.source_dir = source_dir
        self.target_dir = target_dir
        self.source_format = source_format
        self.target_format = target_format
        self.config_type = config_type
        self.registry = format_registry
        self.state_manager = state_manager
        self.direction = direction
        self.dry_run = dry_run
        self.force = force
        self.auto_confirm = auto_confirm
        self.verbose = verbose
        self.strict = strict
        self.conversion_options = conversion_options or {}
        self.logger = logger or print
        self.conflict_resolver = conflict_resolver or self._default_cli_conflict_resolver

        # Accumulates conversion warnings across the run. Adapters may reset their
        # internal warning lists between operations, so the orchestrator captures
        # them at the correct times.
        self.conversion_warnings: List[str] = []

        # Get adapters from registry
        self.source_adapter = format_registry.get_adapter(source_format)
        self.target_adapter = format_registry.get_adapter(target_format)

        if not self.source_adapter:
            raise ValueError(f"Unknown source format: {source_format}")
        if not self.target_adapter:
            raise ValueError(f"Unknown target format: {target_format}")

        # Validate config type support
        if config_type not in self.source_adapter.supported_config_types:
            supported = ', '.join([ct.value for ct in self.source_adapter.supported_config_types])
            if source_format == 'gemini':
                error_msg = (
                    f"Gemini format does not support config type '{config_type.value}'.\n"
                    f"Supported config types for Gemini: {supported}"
                )
            else:
                error_msg = (
                    f"Format '{source_format}' does not support config type '{config_type.value}'.\n"
                    f"Supported config types: {supported}"
                )
            raise ValueError(error_msg)
        if config_type not in self.target_adapter.supported_config_types:
            supported = ', '.join([ct.value for ct in self.target_adapter.supported_config_types])
            if target_format == 'gemini':
                error_msg = (
                    f"Gemini format does not support config type '{config_type.value}'.\n"
                    f"Supported config types for Gemini: {supported}"
                )
            else:
                error_msg = (
                    f"Format '{target_format}' does not support config type '{config_type.value}'.\n"
                    f"Supported config types: {supported}"
                )
            raise ValueError(error_msg)

        # Statistics
        self.stats = {
            'source_to_target': 0,
            'target_to_source': 0,
            'deletions': 0,
            'conflicts': 0,
            'skipped': 0,
            'errors': 0
        }

        # Run-level warning accumulator (for --strict enforcement)
        self._accumulated_warnings: List[str] = []

    def sync(self):
        """
        Execute sync operation.

        Main orchestration method that:
        1. Discovers file pairs
        2. Determines actions for each pair
        3. Resolves conflicts
        4. Executes conversions
        5. Updates state
        6. Reports statistics
        """
        self.log(f"Syncing {self.config_type.value}s: {self.direction}")
        self.log(f"  Source:  {self.source_dir} ({self.source_format})")
        self.log(f"  Target:  {self.target_dir} ({self.target_format})")
        if self.dry_run:
            self.log("  Mode: DRY RUN (no changes will be made)")
        self.logger()

        # Discover file pairs
        pairs = self._discover_file_pairs()

        if not pairs:
            self.logger("No files found in either directory.")
            self._print_summary()
            return

        # Process each pair
        total = len(pairs)
        for i, pair in enumerate(pairs, 1):
            if not self.verbose:
                # Progress indication (Finding #20)
                sys.stdout.write(f"\rProcessing: [{i}/{total}] {pair.base_name}")
                sys.stdout.flush()

            action = self._determine_action(pair)

            if action == 'skip':
                if self.verbose:
                    self.logger(f"  Skip: {pair.base_name} (no changes)")
                self.stats['skipped'] += 1
                continue

            if action == 'conflict':
                self.stats['conflicts'] += 1
                resolved_action = self._resolve_conflict(pair)
                if not resolved_action:
                    self.logger(f"  Skip: {pair.base_name} (conflict skipped)")
                    self.stats['skipped'] += 1
                    continue
                action = resolved_action

            # Display action being performed
            action_display = {
                'source_to_target': f"{self.source_format} -> {self.target_format}",
                'target_to_source': f"{self.target_format} -> {self.source_format}",
                'delete_target': f"Delete from {self.target_format}",
                'delete_source': f"Delete from {self.source_format}"
            }
            prefix = "[DRY-RUN] " if self.dry_run else ""
            self.logger(f"{prefix}{pair.base_name}: {action_display.get(action, action)}")

            # Execute the sync action
            self._execute_sync_action(pair, action)

        if not self.verbose and total > 0:
            # Clear progress line
            sys.stdout.write("\r" + " " * 80 + "\r")
            sys.stdout.flush()

        # Save state (unless dry run)
        if not self.dry_run:
            self.state_manager.save()

        # Print summary
        self._print_summary()

    def _discover_file_pairs(self) -> List[FilePair]:
        """
        Discover and match files between source and target directories.

        Returns:
            List of FilePair objects representing matched files
        """
        files_by_match_name: Dict[str, Dict[str, Any]] = {}

        # Discover source files
        source_extension = self.source_adapter.get_file_extension(self.config_type)
        source_pattern = f"*{source_extension}"
        for file_path in self.source_dir.glob(source_pattern):
            if not self.source_adapter.can_handle(file_path):
                continue

            original_base_name = self._extract_base_name(file_path, source_extension)
            match_name = original_base_name.lower()

            if match_name in files_by_match_name:
                existing_path = files_by_match_name[match_name]['source_path']
                if existing_path:
                    self.log(f"Warning: Base name collision: '{file_path.name}' and '{existing_path.name}' both map to '{match_name}'. Skipping '{file_path.name}'.")
                    continue

            # Handle race condition: file may be deleted between glob and stat
            try:
                source_mtime = file_path.stat().st_mtime
            except FileNotFoundError:
                self.log(f"Warning: File disappeared during discovery: {file_path}")
                continue

            files_by_match_name[match_name] = {
                'source_path': file_path,
                'source_mtime': source_mtime,
                'target_path': None,
                'target_mtime': None
            }

        # Discover target files
        target_extension = self.target_adapter.get_file_extension(self.config_type)
        target_pattern = f"*{target_extension}"
        for file_path in self.target_dir.glob(target_pattern):
            if not self.target_adapter.can_handle(file_path):
                continue

            original_base_name = self._extract_base_name(file_path, target_extension)
            match_name = original_base_name.lower()

            # Handle race condition: file may be deleted between glob and stat
            try:
                target_mtime = file_path.stat().st_mtime
            except FileNotFoundError:
                self.log(f"Warning: File disappeared during discovery: {file_path}")
                continue

            if match_name in files_by_match_name:
                if files_by_match_name[match_name]['target_path']:
                    existing_path = files_by_match_name[match_name]['target_path']
                    self.log(f"Warning: Base name collision in target: '{file_path.name}' and '{existing_path.name}' both map to '{match_name}'. Skipping '{file_path.name}'.")
                    continue

                files_by_match_name[match_name]['target_path'] = file_path
                files_by_match_name[match_name]['target_mtime'] = target_mtime
            else:
                files_by_match_name[match_name] = {
                    'source_path': None,
                    'source_mtime': None,
                    'target_path': file_path,
                    'target_mtime': target_mtime
                }

        # Convert to FilePair list, sorted by match name for consistency
        return [
            FilePair(
                base_name=match_name,
                source_path=data['source_path'],
                target_path=data['target_path'],
                source_mtime=data['source_mtime'],
                target_mtime=data['target_mtime']
            )
            for match_name, data in sorted(files_by_match_name.items())
        ]

    def _determine_action(self, pair: FilePair) -> str:
        """
        Determine what sync action is needed for a file pair.

        Args:
            pair: FilePair to analyze

        Returns:
            Action string: 'source_to_target', 'target_to_source', 'conflict',
                          'delete_target', 'delete_source', or 'skip'
        """
        file_state = self.state_manager.get_file_state(
            self.source_dir, self.target_dir, pair.base_name
        )

        # DELETION: Source was deleted (state shows it existed, target still exists)
        if not pair.source_path and pair.target_path and file_state and file_state.get('source_mtime'):
            if self.direction in ['both', 'source-to-target']:
                return 'delete_target'
            return 'skip'

        # DELETION: Target was deleted (state shows it existed, source still exists)
        if not pair.target_path and pair.source_path and file_state and file_state.get('target_mtime'):
            if self.direction in ['both', 'target-to-source']:
                return 'delete_source'
            return 'skip'

        # BOTH DELETED: Both files gone but state exists
        if not pair.source_path and not pair.target_path:
            return 'skip'

        # NEW FILE: Source only (no target, no prior state)
        if pair.source_path and not pair.target_path:
            if self.direction in ['both', 'source-to-target']:
                return 'source_to_target'
            return 'skip'

        # NEW FILE: Target only (no source, no prior state)
        if pair.target_path and not pair.source_path:
            if self.direction in ['both', 'target-to-source']:
                return 'target_to_source'
            return 'skip'

        # BOTH FILES EXIST
        if pair.source_path and pair.target_path:
            if not file_state:
                # First sync - use newer file
                if pair.source_mtime > pair.target_mtime:
                    if self.direction in ['both', 'source-to-target']:
                        return 'source_to_target'
                    return 'skip'
                elif pair.target_mtime > pair.source_mtime:
                    if self.direction in ['both', 'target-to-source']:
                        return 'target_to_source'
                    return 'skip'
                return 'skip'  # Same mtime

            # Check changes since last sync
            last_source_mtime = file_state.get('source_mtime')
            last_target_mtime = file_state.get('target_mtime')

            # Use epsilon for float comparison to avoid precision issues
            epsilon = 0.01
            source_changed = last_source_mtime is None or pair.source_mtime > (last_source_mtime + epsilon)
            target_changed = last_target_mtime is None or pair.target_mtime > (last_target_mtime + epsilon)

            if source_changed and target_changed:
                return 'conflict'

            if source_changed:
                if self.direction in ['both', 'source-to-target']:
                    return 'source_to_target'
                return 'skip'

            if target_changed:
                if self.direction in ['both', 'target-to-source']:
                    return 'target_to_source'
                return 'skip'

        return 'skip'  # No changes

    def _default_cli_conflict_resolver(self, pair: FilePair) -> Optional[str]:
        """Default interactive CLI conflict resolver."""
        print(f"\nCONFLICT: Both files modified for '{pair.base_name}'")
        print(f"  Source: {pair.source_path}")
        print(f"    Modified: {datetime.fromtimestamp(pair.source_mtime)}")
        print(f"  Target: {pair.target_path}")
        print(f"    Modified: {datetime.fromtimestamp(pair.target_mtime)}")
        print("\nChoose action:")
        print(f"  1. Use source version ({self.source_format})")
        print(f"  2. Use target version ({self.target_format})")
        print("  3. Skip this file")

        while True:
            choice = input("Enter choice (1/2/3): ").strip()
            if choice == '1':
                return 'source_to_target'
            elif choice == '2':
                return 'target_to_source'
            elif choice == '3':
                return None
            print("Invalid choice. Enter 1, 2, or 3.")

    def _resolve_conflict(self, pair: FilePair) -> Optional[str]:
        """
        Resolve sync conflict interactively or automatically.

        Args:
            pair: FilePair with conflict

        Returns:
            Resolved action or None to skip
        """
        if self.force or self.auto_confirm:
            # Handle None mtimes (treat as 0/oldest)
            source_mtime = pair.source_mtime or 0
            target_mtime = pair.target_mtime or 0

            # Use newest file
            if source_mtime > target_mtime:
                flag_name = "--force" if self.force else "--yes"
                self.log(f"  Conflict resolved ({flag_name}): Using source (newer)")
                return 'source_to_target'
            else:
                flag_name = "--force" if self.force else "--yes"
                self.log(f"  Conflict resolved ({flag_name}): Using target (newer)")
                return 'target_to_source'

        return self.conflict_resolver(pair)

    def _execute_sync_action(self, pair: FilePair, action: str):
        """
        Execute sync action for a file pair.

        Args:
            pair: FilePair to sync
            action: Action to execute
        """
        try:
            if action == 'source_to_target':
                # Race condition check: Verify target hasn't changed since discovery
                if pair.target_path and pair.target_path.exists():
                    current_mtime = pair.target_path.stat().st_mtime
                    if pair.target_mtime and current_mtime > pair.target_mtime:
                        self.logger(f"  Skipped: {pair.base_name} (Target modified since discovery)")
                        self.stats['skipped'] += 1
                        return

                # Read source and convert to canonical
                canonical = self.source_adapter.read(pair.source_path, self.config_type)

                # Determine target path
                target_path = pair.target_path
                if target_path is None:
                    target_extension = self.target_adapter.get_file_extension(self.config_type)
                    target_path = self.target_dir / f"{pair.base_name}{target_extension}"

                # Convert to target format (surfaces warnings)
                target_content = self.target_adapter.from_canonical(canonical, self.config_type, self.conversion_options)

                # Log conversion warnings and accumulate them for run-level tracking
                for warning in self.source_adapter.get_warnings():
                    self.log(f"  Warning: {warning}")
                    self._accumulated_warnings.append(warning)
                self.source_adapter.clear_conversion_warnings()

                target_warnings = self.target_adapter.get_warnings()
                for warning in target_warnings:
                    self.log(f"  Warning: {warning}")
                    self._accumulated_warnings.append(warning)
                self.target_adapter.clear_conversion_warnings()

                # In strict mode, abort if there are lossy conversion warnings
                if self.strict and target_warnings:
                    raise RuntimeError(f"Lossy conversion for {pair.base_name}")

                # Write to target (unless dry run)
                if self.dry_run:
                    target_mtime = pair.target_mtime or datetime.now().timestamp()
                else:
                    target_path.parent.mkdir(parents=True, exist_ok=True)
                    target_path.write_text(target_content, encoding='utf-8')
                    target_mtime = target_path.stat().st_mtime

                # Update state (unless dry run)
                if not self.dry_run:
                    self.state_manager.update_file_state(
                        self.source_dir, self.target_dir, pair.base_name,
                        pair.source_mtime, target_mtime, 'source_to_target',
                        self.source_format, self.target_format, self.config_type.value
                    )

                self.stats['source_to_target'] += 1

            elif action == 'target_to_source':
                # Race condition check: Verify source hasn't changed since discovery
                if pair.source_path and pair.source_path.exists():
                    current_mtime = pair.source_path.stat().st_mtime
                    if pair.source_mtime and current_mtime > pair.source_mtime:
                        self.logger(f"  Skipped: {pair.base_name} (Source modified since discovery)")
                        self.stats['skipped'] += 1
                        return

                # Read target and convert to canonical
                canonical = self.target_adapter.read(pair.target_path, self.config_type)

                # Determine source path
                source_path = pair.source_path
                if source_path is None:
                    source_extension = self.source_adapter.get_file_extension(self.config_type)
                    source_path = self.source_dir / f"{pair.base_name}{source_extension}"

                # Convert to source format (surfaces warnings)
                source_content = self.source_adapter.from_canonical(canonical, self.config_type, self.conversion_options)

                # Log conversion warnings and accumulate them for run-level tracking
                source_warnings = self.source_adapter.get_warnings()
                for warning in source_warnings:
                    self.log(f"  Warning: {warning}")
                    self._accumulated_warnings.append(warning)
                self.source_adapter.clear_conversion_warnings()

                for warning in self.target_adapter.get_warnings():
                    self.log(f"  Warning: {warning}")
                    self._accumulated_warnings.append(warning)
                self.target_adapter.clear_conversion_warnings()

                # In strict mode, abort if there are lossy conversion warnings
                if self.strict and source_warnings:
                    raise RuntimeError(f"Lossy conversion for {pair.base_name}")

                # Write to source (unless dry run)
                if self.dry_run:
                    source_mtime = pair.source_mtime or datetime.now().timestamp()
                else:
                    source_path.parent.mkdir(parents=True, exist_ok=True)
                    source_path.write_text(source_content, encoding='utf-8')
                    source_mtime = source_path.stat().st_mtime

                # Update state (unless dry run)
                if not self.dry_run:
                    self.state_manager.update_file_state(
                        self.source_dir, self.target_dir, pair.base_name,
                        source_mtime, pair.target_mtime, 'target_to_source',
                        self.source_format, self.target_format, self.config_type.value
                    )

                self.stats['target_to_source'] += 1

            elif action == 'delete_target':
                if not self.dry_run and pair.target_path:
                    try:
                        pair.target_path.unlink()
                    except FileNotFoundError:
                        pass  # Already deleted, no action needed
                if not self.dry_run:
                    self.state_manager.remove_file_state(
                        self.source_dir, self.target_dir, pair.base_name
                    )
                self.stats['deletions'] += 1

            elif action == 'delete_source':
                if not self.dry_run and pair.source_path:
                    try:
                        pair.source_path.unlink()
                    except FileNotFoundError:
                        pass  # Already deleted, no action needed
                if not self.dry_run:
                    self.state_manager.remove_file_state(
                        self.source_dir, self.target_dir, pair.base_name
                    )
                self.stats['deletions'] += 1

        except (IOError, ValueError, RuntimeError) as e:
            self.logger(f"  Error syncing {pair.base_name}: {e}")
            self.stats['errors'] += 1
        except Exception as e:
            # Re-raise system exceptions
            if isinstance(e, (KeyboardInterrupt, SystemExit)):
                raise
            self.logger(f"  Unexpected error syncing {pair.base_name}: {e}")
            self.stats['errors'] += 1

    def log(self, message: str):
        """Print message if verbose mode enabled."""
        if self.verbose:
            self.logger(message)

    def get_all_warnings(self) -> List[str]:
        """
        Get all warnings accumulated during the sync run.

        Returns:
            List of warning messages from all conversions
        """
        return self._accumulated_warnings.copy()

    def _print_summary(self):
        """Print sync statistics summary."""
        self.logger()
        self.logger("=" * 60)
        self.logger("Summary:")
        self.logger(f"  {self.source_format} -> {self.target_format}: {self.stats['source_to_target']}")
        self.logger(f"  {self.target_format} -> {self.source_format}: {self.stats['target_to_source']}")
        self.logger(f"  Deletions:  {self.stats['deletions']}")
        self.logger(f"  Conflicts:  {self.stats['conflicts']}")
        self.logger(f"  Skipped:    {self.stats['skipped']}")
        self.logger(f"  Errors:     {self.stats['errors']}")
        self.logger("=" * 60)
        if self.dry_run:
            self.logger()
            self.logger("This was a dry run. Use without --dry-run to apply changes.")

    def _extract_base_name(self, file_path: Path, extension: str) -> str:
        """
        Extract base name from file, handling compound extensions like .agent.md.

        Args:
            file_path: Path to the file
            extension: The extension to remove (e.g., '.md' or '.agent.md')

        Returns:
            Base name without the extension
        """
        if not file_path.name:
            return ""

        name = file_path.name

        # Normalize extension: ensure it starts with a dot if not empty
        if extension and not extension.startswith('.'):
            extension = '.' + extension

        if extension and name.endswith(extension):
            return name[:-len(extension)]

        # Fallback to stem for files without extension or non-matching extension
        # Path.stem handles .hidden files by returning the full name
        return file_path.stem

    def sync_files_in_place(self, source_path: Path, target_path: Path, bidirectional: bool = False, dry_run: bool = False) -> None:
        """Sync two live config files in-place with intelligent merging.

        This method enables true bidirectional sync where changes from source are merged
        into target (rather than replacing the entire target file). Optionally, changes
        from target can be merged back into source.

        When strict mode is enabled (self.strict=True), all conversions are performed
        first to detect warnings, and if any warnings are found, a ValueError is raised
        BEFORE any files are modified.

        Args:
            source_path: Path to source config file
            target_path: Path to target config file
            bidirectional: If True, sync changes both ways
            dry_run: If True, show changes without writing
        """
        self.log(f"Syncing files in-place (merge mode):")
        self.log(f"  Source: {source_path}")
        self.log(f"  Target: {target_path}")
        if bidirectional:
            self.log(f"  Direction: bidirectional (merge both ways)")
        else:
            self.log(f"  Direction: {self.source_format} -> {self.target_format}")
        if dry_run:
            self.log("  Mode: DRY RUN (no changes will be made)")
        if self.strict:
            self.log("  Mode: STRICT (will fail on lossy conversions)")
        self.log("")  # Blank line for readability

        try:
            # Validate files exist
            if not source_path.exists():
                raise IOError(f"Source file not found: {source_path}")
            if not target_path.exists():
                raise IOError(f"Target file not found: {target_path}")

            # Phase 1: Read and convert (gather warnings before any writes)

            # 1. Read both files
            source_content = source_path.read_text(encoding='utf-8')
            target_content = target_path.read_text(encoding='utf-8')

            # 2. Convert both to canonical
            source_canonical = self.source_adapter.read(source_path, self.config_type)
            # Capture warnings from reading source
            for warning in self.source_adapter.get_warnings():
                self.log(f"  Warning: {warning}")
                self._accumulated_warnings.append(warning)
            self.source_adapter.clear_conversion_warnings()

            target_canonical = self.target_adapter.read(target_path, self.config_type)
            # Capture warnings from reading target
            for warning in self.target_adapter.get_warnings():
                self.log(f"  Warning: {warning}")
                self._accumulated_warnings.append(warning)
            self.target_adapter.clear_conversion_warnings()

            # 3. Merge source into target
            merged_canonical = self._merge_canonical(
                source=source_canonical,
                target=target_canonical,
                config_type=self.config_type
            )

            # 4. Convert merged result back to target format (this may generate warnings)
            merged_content = self.target_adapter.from_canonical(
                merged_canonical, self.config_type,
                self.conversion_options
            )

            # Accumulate warnings from target conversion
            for warning in self.target_adapter.get_warnings():
                self.log(f"  Warning: {warning}")
                self._accumulated_warnings.append(warning)
            self.target_adapter.clear_conversion_warnings()

            # 5. If bidirectional, also prepare source conversion (gather all warnings first)
            source_merged_content = None
            if bidirectional:
                # Merge target into source
                source_merged_canonical = self._merge_canonical(
                    source=merged_canonical,  # Use the already-merged canonical
                    target=source_canonical,
                    config_type=self.config_type
                )

                # Convert back to source format (this may generate warnings)
                source_merged_content = self.source_adapter.from_canonical(
                    source_merged_canonical, self.config_type,
                    self.conversion_options
                )

                # Accumulate warnings from source conversion
                for warning in self.source_adapter.get_warnings():
                    self.log(f"  Warning: {warning}")
                    self._accumulated_warnings.append(warning)
                self.source_adapter.clear_conversion_warnings()

            # Phase 2: Check strict mode BEFORE any writes
            if self.strict and self._accumulated_warnings:
                error_msg = "Lossy conversions detected with --strict flag. No files were modified."
                self.logger(f"\nError: {error_msg}")
                for warning in self._accumulated_warnings:
                    self.logger(f"  - {warning}")
                raise ValueError("Lossy conversions detected with --strict flag")

            # Phase 3: Write files (only reached if not strict or no warnings)

            # Write target (unless dry run or no changes)
            target_changed = merged_content != target_content
            if not dry_run:
                if target_changed:
                    target_path.write_text(merged_content, encoding='utf-8')
                    self.logger(f"Updated {self.target_format}: {target_path}")
                    self.stats['source_to_target'] += 1
                else:
                    self.logger(f"No changes needed for {self.target_format}: {target_path}")
            else:
                if target_changed:
                    self.logger(f"Would update {self.target_format}: {target_path}")
                    self.stats['source_to_target'] += 1
                else:
                    self.logger(f"No changes needed for {self.target_format}: {target_path}")

            # Write source if bidirectional (unless dry run or no changes)
            if bidirectional and source_merged_content is not None:
                source_changed = source_merged_content != source_content
                if not dry_run:
                    if source_changed:
                        source_path.write_text(source_merged_content, encoding='utf-8')
                        self.logger(f"Updated {self.source_format}: {source_path}")
                        self.stats['target_to_source'] += 1
                    else:
                        self.logger(f"No changes needed for {self.source_format}: {source_path}")
                else:
                    if source_changed:
                        self.logger(f"Would update {self.source_format}: {source_path}")
                        self.stats['target_to_source'] += 1
                    else:
                        self.logger(f"No changes needed for {self.source_format}: {source_path}")

            self._print_summary()

        except (IOError, ValueError, RuntimeError) as e:
            if "Lossy conversions detected" not in str(e):
                self.logger(f"Error syncing files: {e}")
                self.stats['errors'] += 1
            raise
        except Exception as e:
            if isinstance(e, (KeyboardInterrupt, SystemExit)):
                raise
            self.logger(f"Unexpected error syncing files: {e}")
            self.stats['errors'] += 1
            raise

    def _merge_canonical(self, source, target, config_type):
        """Intelligently merge source canonical model into target.

        Strategy depends on config_type:
        - PERMISSION: Merge permission arrays (add new rules, preserve existing)
        - AGENT: Match by name, update if source has newer content
        - SLASH_COMMAND: Match by name, update if source has newer content
        """
        if config_type == ConfigType.PERMISSION:
            return self._merge_permissions(source, target)
        elif config_type == ConfigType.AGENT:
            return self._merge_agents(source, target)
        elif config_type == ConfigType.SLASH_COMMAND:
            return self._merge_slash_commands(source, target)
        else:
            raise ValueError(f"Unknown config type: {config_type}")

    def _merge_permissions(self, source, target):
        """Merge permission rules from source into target.

        Logic:
        - Add new rules from source to target (avoid duplicates)
        - Preserve all target rules not in source
        """
        merged_allow = target.allow.copy()
        merged_deny = target.deny.copy()
        merged_ask = target.ask.copy()

        for rule in source.allow:
            if rule not in merged_allow:
                merged_allow.append(rule)

        for rule in source.deny:
            if rule not in merged_deny:
                merged_deny.append(rule)

        for rule in source.ask:
            if rule not in merged_ask:
                merged_ask.append(rule)

        merged = CanonicalPermission(
            allow=merged_allow,
            deny=merged_deny,
            ask=merged_ask,
            default_mode=target.default_mode or source.default_mode,
            metadata=target.metadata.copy()
        )

        return merged

    def _merge_agents(self, source, target):
        """Merge agent from source into target.

        Merging strategy:
        - Core fields (name, description, instructions, tools, version) come from source
        - Model falls back to target if source is None
        - Target metadata is preserved, with source metadata merged in (source wins conflicts)
        - Target source_format is preserved for round-trip compatibility
        """
        merged = CanonicalAgent(
            name=source.name,
            description=source.description,
            instructions=source.instructions,
            tools=source.tools.copy() if source.tools else [],
            model=source.model or target.model,
            metadata=target.metadata.copy(),
            source_format=target.source_format,
            version=source.version
        )

        for key, value in source.metadata.items():
            if key not in merged.metadata:
                merged.metadata[key] = value

        return merged

    def _merge_slash_commands(self, source, target):
        """Merge slash command from source into target.

        Merging strategy:
        - Core fields (name, description, instructions, allowed_tools, version) come from source
        - argument_hint and model fall back to target if source is None
        - Target metadata is preserved, with source metadata merged in (source wins conflicts)
        - Target source_format is preserved for round-trip compatibility
        """
        merged = CanonicalSlashCommand(
            name=source.name,
            description=source.description,
            instructions=source.instructions,
            argument_hint=source.argument_hint or target.argument_hint,
            model=source.model or target.model,
            allowed_tools=source.allowed_tools.copy() if source.allowed_tools else [],
            metadata=target.metadata.copy(),
            source_format=target.source_format,
            version=source.version
        )

        for key, value in source.metadata.items():
            if key not in merged.metadata:
                merged.metadata[key] = value

        return merged


def sync_all_config_types(
    source_dir: Path,
    target_dir: Path,
    source_format: str,
    target_format: str,
    format_registry: FormatRegistry,
    state_manager: SyncStateManager,
    config_types: Optional[List[ConfigType]] = None,
    skip_confirmation: bool = False,
    direction: str = 'both',
    dry_run: bool = False,
    force: bool = False,
    verbose: bool = False,
    strict: bool = False,
    conversion_options: Optional[Dict[str, Any]] = None,
    logger: Optional[Any] = None,
) -> Dict[ConfigType, SyncResult]:
    """
    Sync multiple config types in sequence.

    This function enables syncing agents, permissions, and slash commands
    in a single operation. It auto-detects available config types if not
    specified, displays a preview with file counts, and syncs each type
    independently.

    Args:
        source_dir: Primary source directory
        target_dir: Primary target directory
        source_format: Source format name (e.g., 'claude')
        target_format: Target format name (e.g., 'copilot')
        format_registry: Registry containing adapters
        state_manager: State tracking manager
        config_types: Types to sync (None = auto-detect all supported types)
        skip_confirmation: If True, don't prompt user for confirmation
        direction: 'both', 'source-to-target', or 'target-to-source'
        dry_run: If True, don't actually modify files
        force: If True, auto-resolve conflicts using newest file
        verbose: If True, print detailed logs
        strict: If True, enables strict validation mode to flag lossy conversions as errors
        conversion_options: Options to pass to adapters
        logger: Callback for logging output (default: print)

    Returns:
        Dict mapping each config type to its SyncResult

    Example:
        results = sync_all_config_types(
            source_dir=Path('~/.claude'),
            target_dir=Path('.github'),
            source_format='claude',
            target_format='copilot',
            format_registry=registry,
            state_manager=state_manager,
            skip_confirmation=True  # For CI/scripts
        )

        for config_type, result in results.items():
            if result.success:
                print(f"{config_type.value}: {result.stats['source_to_target']} synced")
            else:
                print(f"{config_type.value}: FAILED - {result.error}")
    """
    log = logger or print

    # 1. Determine which config types to sync
    # Also cache source_counts if we do auto-detection to avoid re-scanning
    source_counts = None
    if config_types is None:
        # Auto-detect from source directory
        source_counts = format_registry.detect_config_types_in_directory(
            source_dir, source_format
        )
        # Filter to types supported by both source and target
        config_types = [
            ct for ct in source_counts.keys()
            if format_registry.validate_conversion_support(
                source_format, target_format, ct
            )
        ]

    if not config_types:
        log("No supported config types detected in source directory.")
        return {}

    # 2. Count files per config type for preview
    # Reuse source_counts if already computed during auto-detection
    if source_counts is None:
        source_counts = format_registry.detect_config_types_in_directory(
            source_dir, source_format
        )
    target_counts = format_registry.detect_config_types_in_directory(
        target_dir, target_format
    )

    file_counts: Dict[ConfigType, int] = {}
    for ct in config_types:
        # Count is max of source and target (either may have files to sync)
        file_counts[ct] = max(
            source_counts.get(ct, 0),
            target_counts.get(ct, 0)
        )

    # 3. Display preview
    log("Detected configurations:")
    for ct, count in file_counts.items():
        if count > 0:
            # Use plural form for display, with human-readable names
            display_base = ct.value.replace("_", " ")
            type_name = display_base if display_base.endswith('s') else display_base + "s"
            log(f"  - {count} {type_name}")

    total_files = sum(file_counts.values())
    if total_files == 0:
        log("\nNo files to sync.")
        return {}

    # 4. Confirm with user (unless skipped)
    if not skip_confirmation and not dry_run:
        log("")
        try:
            response = input("Proceed with sync? [y/N] ").strip().lower()
            if response not in ('y', 'yes'):
                log("Sync cancelled.")
                return {}
        except (EOFError, KeyboardInterrupt):
            log("\nSync cancelled.")
            return {}

    # 5. Sync each config type independently
    results: Dict[ConfigType, SyncResult] = {}

    for ct in config_types:
        # Use human-readable display name
        display_name = ct.value.replace("_", " ") + "s"
        if verbose or len(config_types) > 1:
            log(f"\n--- Syncing {display_name} ---")

        try:
            # Determine actual source/target directories based on config type
            # Each format defines its own subdirectory structure via get_config_subdir()
            # For example: Claude uses commands/, Copilot uses prompts/ for slash commands
            source_adapter = format_registry.get_adapter(source_format)
            target_adapter = format_registry.get_adapter(target_format)
            source_subdir = source_adapter.get_config_subdir(ct)
            target_subdir = target_adapter.get_config_subdir(ct)
            actual_source_dir = source_dir / source_subdir if source_subdir else source_dir
            actual_target_dir = target_dir / target_subdir if target_subdir else target_dir

            # Ensure target directory exists
            if not dry_run:
                actual_target_dir.mkdir(parents=True, exist_ok=True)

            orchestrator = UniversalSyncOrchestrator(
                source_dir=actual_source_dir,
                target_dir=actual_target_dir,
                source_format=source_format,
                target_format=target_format,
                config_type=ct,
                format_registry=format_registry,
                state_manager=state_manager,
                direction=direction,
                dry_run=dry_run,
                force=force,
                auto_confirm=skip_confirmation,
                verbose=verbose,
                strict=strict,
                conversion_options=conversion_options,
                logger=logger,
            )

            orchestrator.sync()

            # Collect warnings for this config type
            warnings = orchestrator.get_all_warnings()

            results[ct] = SyncResult(
                config_type=ct,
                stats=orchestrator.stats.copy(),
                warnings=warnings,
                error=None,
            )

        except Exception as e:
            # Continue with other types even if one fails
            error_msg = str(e)
            log(f"Error syncing {display_name}: {error_msg}")
            results[ct] = SyncResult(
                config_type=ct,
                stats={
                    'source_to_target': 0,
                    'target_to_source': 0,
                    'deletions': 0,
                    'conflicts': 0,
                    'skipped': 0,
                    'errors': 1,
                },
                warnings=[],
                error=error_msg,
            )

    # 6. Display combined summary
    if len(config_types) > 1:
        _print_combined_summary(results, source_format, target_format, dry_run, log)

    return results


def _print_combined_summary(
    results: Dict[ConfigType, SyncResult],
    source_format: str,
    target_format: str,
    dry_run: bool,
    logger: Any
):
    """Print combined summary for multi-config sync."""
    logger("")
    logger("=" * 60)
    logger("Combined Summary:")
    logger("")

    total_s2t = 0
    total_t2s = 0
    total_deletions = 0
    total_conflicts = 0
    total_skipped = 0
    total_errors = 0
    failed_types = []

    for ct, result in results.items():
        if result.success:
            total_s2t += result.stats['source_to_target']
            total_t2s += result.stats['target_to_source']
            total_deletions += result.stats['deletions']
            total_conflicts += result.stats['conflicts']
            total_skipped += result.stats['skipped']
        else:
            failed_types.append(ct.value)

        # Always aggregate error count from stats to avoid double-counting.
        total_errors += result.stats.get('errors', 0)
    logger(f"  {source_format} -> {target_format}: {total_s2t}")
    logger(f"  {target_format} -> {source_format}: {total_t2s}")
    logger(f"  Deletions:  {total_deletions}")
    logger(f"  Conflicts:  {total_conflicts}")
    logger(f"  Skipped:    {total_skipped}")
    logger(f"  Errors:     {total_errors}")

    if failed_types:
        logger("")
        logger(f"  Failed types: {', '.join(failed_types)}")

    logger("=" * 60)

    if dry_run:
        logger("")
        logger("This was a dry run. Use without --dry-run to apply changes.")
