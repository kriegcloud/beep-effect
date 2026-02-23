"""
Main CLI entry point for universal agent sync tool.

This module provides the command-line interface for syncing configurations
between different AI coding tools. It supports:
- Multi-format sync (Claude, Copilot, etc.)
- Multiple config types (agents, permissions, prompts)
- Bidirectional and unidirectional sync
- Dry-run mode
- Conflict resolution

Usage:
    python -m cli.main --source-dir ~/.claude/agents --target-dir .github/agents \
                       --source-format claude --target-format copilot \
                       --direction both
"""

import argparse
import os
import sys
from pathlib import Path
from typing import List, Optional

from core.registry import FormatRegistry
from core.orchestrator import UniversalSyncOrchestrator, sync_all_config_types
from core.state_manager import SyncStateManager
from core.canonical_models import ConfigType
from core.profile_paths import ProfilePathResolver

# Import adapters
from adapters import ClaudeAdapter, CopilotAdapter, GeminiAdapter

# Mapping from --only shorthand values to ConfigType enum
# Accepts both singular and plural forms for user convenience
ONLY_TYPE_MAP = {
    'agents': ConfigType.AGENT,
    'agent': ConfigType.AGENT,
    'commands': ConfigType.SLASH_COMMAND,
    'command': ConfigType.SLASH_COMMAND,
    'slash-command': ConfigType.SLASH_COMMAND,
    'permissions': ConfigType.PERMISSION,
    'permission': ConfigType.PERMISSION,
}

# Exit codes
EXIT_SUCCESS = 0
EXIT_ERROR = 1

# Default config type when not specified (used for single-file modes)
DEFAULT_CONFIG_TYPE = ConfigType.AGENT


VERSION = "2.0.0"


def _build_conversion_options(args: argparse.Namespace) -> dict:
    """
    Build conversion options dictionary from command-line arguments.

    Args:
        args: Parsed command-line arguments

    Returns:
        Dictionary of conversion options
    """
    options = {}
    if args.add_argument_hint:
        options['add_argument_hint'] = True
    if args.add_handoffs:
        options['add_handoffs'] = True
    return options


def _parse_only_types(only_arg: str) -> List[ConfigType]:
    """
    Parse and validate the --only argument.

    Args:
        only_arg: Comma-separated list of config type names

    Returns:
        List of validated ConfigType enum values (deduplicated)

    Raises:
        ValueError: If any type name is invalid
    """
    if not only_arg:
        return []

    config_types = []
    invalid_types = []

    for type_name in only_arg.split(','):
        type_name = type_name.strip().lower()
        if not type_name:
            continue

        if type_name in ONLY_TYPE_MAP:
            config_type = ONLY_TYPE_MAP[type_name]
            if config_type not in config_types:
                config_types.append(config_type)
        else:
            invalid_types.append(type_name)

    if invalid_types:
        valid_options = ['agents', 'commands', 'permissions']
        raise ValueError(
            f"Invalid config type(s): {', '.join(invalid_types)}. "
            f"Valid options: {', '.join(valid_options)}"
        )

    return config_types


def create_parser(registry: Optional[FormatRegistry] = None) -> argparse.ArgumentParser:
    """
    Create argument parser for CLI.

    Args:
        registry: Optional FormatRegistry to get dynamic format choices

    Returns:
        Configured ArgumentParser instance
    """
    formats = registry.list_formats() if registry else ['claude', 'copilot', 'gemini']

    parser = argparse.ArgumentParser(
        description='Universal sync tool for AI coding agent configurations',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Auto-discover profile paths (format-only, directories auto-resolved)
  %(prog)s --source-format claude --target-format copilot

  # Sync Claude agents to Copilot (auto-detects all config types)
  %(prog)s --source-dir ~/.claude/agents --target-dir .github/agents \\
           --source-format claude --target-format copilot

  # Sync only agents (skip permissions and commands)
  %(prog)s --source-dir ~/.claude --target-dir .github \\
           --source-format claude --target-format copilot \\
           --only agents

  # Sync only permissions
  %(prog)s --source-dir ~/.claude --target-dir .github \\
           --source-format claude --target-format copilot \\
           --only permissions

  # Sync only commands
  %(prog)s --source-dir ~/.gemini/commands --target-dir .github/prompts \\
           --source-format gemini --target-format copilot \\
           --only commands

  # Single file conversion (auto-detect source, auto-generate output)
  %(prog)s --convert-file ~/.claude/agents/planner.md --target-format copilot

  # Single file conversion with explicit output
  %(prog)s --convert-file agent.md --output agent.agent.md --target-format copilot

  # Bidirectional sync with dry-run
  %(prog)s --source-dir ~/.claude/agents --target-dir .github/agents \\
           --source-format claude --target-format copilot \\
           --direction both --dry-run

  # Sync only agents and commands (skip permissions)
  %(prog)s --source-dir ~/.claude --target-dir .github \\
           --source-format claude --target-format copilot \\
           --only agents,commands

  # Skip confirmation prompts (for CI/scripts)
  %(prog)s --source-dir ~/.claude/agents --target-dir .github/agents \\
           --source-format claude --target-format copilot \\
           --yes

  # Combine --only with --yes for automated multi-type sync
  %(prog)s --source-dir ~/.claude --target-dir .github \\
           --source-format claude --target-format copilot \\
           --only agents,permissions --yes --dry-run

  # Disable auto-discovery (require explicit paths)
  %(prog)s --source-format claude --target-format copilot --no-autodiscover
        """
    )

    parser.add_argument(
        '--version',
        action='version',
        version=f'%(prog)s {VERSION}'
    )

    # Single-file conversion mode
    parser.add_argument(
        '--convert-file',
        type=Path,
        help='Single file to convert (mutually exclusive with --source-dir)'
    )

    parser.add_argument(
        '--output',
        type=Path,
        help='Output file path for single-file conversion (auto-generated if not specified)'
    )

    # Single-file in-place sync mode
    parser.add_argument(
        '--sync-file',
        type=Path,
        help='Source file to sync (for in-place merge mode)'
    )

    parser.add_argument(
        '--target-file',
        type=Path,
        help='Target file to sync with (for in-place merge mode)'
    )

    parser.add_argument(
        '--bidirectional',
        action='store_true',
        help='Sync changes in both directions (source to target and target to source)'
    )

    # Directory sync mode arguments (required for directory sync, not for file conversion)
    parser.add_argument(
        '--source-dir',
        type=Path,
        help='Source directory containing configuration files'
    )

    parser.add_argument(
        '--target-dir',
        type=Path,
        help='Target directory for synced configuration files'
    )

    # Format arguments (optional for auto-detection in file mode)
    parser.add_argument(
        '--source-format',
        type=str,
        choices=formats,
        help='Source format name (auto-detected if not specified)'
    )

    parser.add_argument(
        '--target-format',
        type=str,
        choices=formats,
        help='Target format name (auto-detected from output if not specified)'
    )

    # Optional arguments
    parser.add_argument(
        '--direction',
        type=str,
        default='both',
        choices=['both', 'source-to-target', 'target-to-source'],
        help='Sync direction (default: both)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be done without making changes'
    )

    parser.add_argument(
        '--force',
        action='store_true',
        help='Auto-resolve conflicts using newest file'
    )

    parser.add_argument(
        '--strict',
        action='store_true',
        help='Error on lossy conversions (e.g., Claude deny rules downgraded to VS Code ask)'
    )

    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Verbose output with detailed logging'
    )

    parser.add_argument(
        '--only',
        type=str,
        metavar='TYPES',
        help='Filter to specific config types (comma-separated: agents,commands,permissions)'
    )

    parser.add_argument(
        '--yes', '-y',
        action='store_true',
        help='Skip confirmation prompts (useful for scripts/CI)'
    )

    parser.add_argument(
        '--state-file',
        type=Path,
        help='Custom path for state file (default: ~/.agent_sync_state.json)'
    )

    # Conversion options
    parser.add_argument(
        '--add-argument-hint',
        action='store_true',
        help='Add argument-hint field (only when converting to Copilot)'
    )

    parser.add_argument(
        '--add-handoffs',
        action='store_true',
        help='Add handoffs placeholder (only when converting to Copilot)'
    )

    # Auto-discovery control
    parser.add_argument(
        '--no-autodiscover',
        action='store_true',
        help='Disable auto-discovery; require explicit --source-dir and --target-dir'
    )

    return parser


def setup_registry() -> FormatRegistry:
    """
    Initialize format registry with all available adapters.

    Returns:
        FormatRegistry with registered adapters
    """
    registry = FormatRegistry()

    # Register adapters
    registry.register(ClaudeAdapter())
    registry.register(CopilotAdapter())
    registry.register(GeminiAdapter())

    return registry


def convert_single_file(args) -> int:
    """
    Convert a single file from one format to another.

    Args:
        args: Parsed command-line arguments

    Returns:
        Exit code (0 for success, 1 for error)
    """
    registry = setup_registry()

    # 1. Validate source file
    source_file = args.convert_file.expanduser().resolve()
    if not source_file.exists():
        print(f"Error: File not found: {source_file}", file=sys.stderr)
        return 1
    if source_file.is_dir():
        print(f"Error: Path is a directory, not a file: {source_file}", file=sys.stderr)
        return 1

    # 2. Determine source adapter (explicit or auto-detect)
    if args.source_format:
        source_adapter = registry.get_adapter(args.source_format)
        if not source_adapter:
            print(f"Error: Unknown source format: {args.source_format}", file=sys.stderr)
            return 1
    else:
        source_adapter = registry.detect_format(source_file)
        if not source_adapter:
            print(f"Error: Cannot auto-detect format for: {source_file}", file=sys.stderr)
            return 1

    # 3. Get config type (from --only or default for single-file conversion)
    if args.only:
        try:
            config_types = _parse_only_types(args.only)
            if len(config_types) != 1:
                print("Error: --only must specify exactly one type for single-file conversion", file=sys.stderr)
                return EXIT_ERROR
            config_type = config_types[0]
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            return EXIT_ERROR
    else:
        config_type = DEFAULT_CONFIG_TYPE

    # 4. Determine target adapter (explicit or from output extension)
    if args.target_format:
        target_adapter = registry.get_adapter(args.target_format)
        if not target_adapter:
            print(f"Error: Unknown target format: {args.target_format}", file=sys.stderr)
            return EXIT_ERROR
    elif args.output:
        target_adapter = registry.detect_format(args.output)
        if not target_adapter:
            print(f"Error: Cannot auto-detect target format from: {args.output}", file=sys.stderr)
            return EXIT_ERROR
    else:
        print("Error: --target-format or --output required for conversion", file=sys.stderr)
        return EXIT_ERROR

    # 5. Determine output path (explicit or auto-generate)
    if args.output:
        output_file = args.output.expanduser().resolve()
    else:
        # Auto-generate: same directory, base name + target extension
        filename = source_file.name
        base_name = source_file.stem

        # Handle multi-part extensions
        for ext in ['.agent.md', '.prompt.md', '.perm.json']:
            if filename.endswith(ext):
                base_name = filename[:-len(ext)]
                break

        target_ext = target_adapter.get_file_extension(config_type)
        output_file = source_file.parent / f"{base_name}{target_ext}"

    # 6. Check if source and output are the same (Find #8)
    if source_file == output_file:
        print(f"Error: Source and output files are the same: {source_file}", file=sys.stderr)
        return EXIT_ERROR

    # 7. Build conversion options
    conversion_options = _build_conversion_options(args)

    # 8. Perform conversion
    try:
        if args.verbose:
            print(f"Converting {source_file} -> {output_file}")
            print(f"  Source format: {source_adapter.format_name}")
            print(f"  Target format: {target_adapter.format_name}")

        # Read and convert to canonical
        canonical = source_adapter.read(source_file, config_type)

        # Convert to target format
        output_content = target_adapter.from_canonical(
            canonical, config_type, conversion_options if conversion_options else None
        )

        # Check for conversion warnings
        warnings = target_adapter.get_warnings()
        if warnings:
            print("\nConversion warnings:", file=sys.stderr)
            for warning in warnings:
                print(f"  - {warning}", file=sys.stderr)

            if args.strict:
                print("\nError: Lossy conversions detected with --strict flag", file=sys.stderr)
                return EXIT_ERROR

        if args.dry_run:
            print(f"Would write to: {output_file}")
            if args.verbose:
                print("--- Output content ---")
                print(output_content)
            return EXIT_SUCCESS

        # Write output
        # Find #7: Check for write permissions before attempting write
        output_file.parent.mkdir(parents=True, exist_ok=True)
        if not os.access(output_file.parent, os.W_OK):
             print(f"Error: Permission denied: Cannot write to directory {output_file.parent}", file=sys.stderr)
             return EXIT_ERROR

        try:
            with open(output_file, 'w', encoding='utf-8') as f:
                f.write(output_content)
        except PermissionError:
            print(f"Error: Permission denied writing to {output_file}", file=sys.stderr)
            return EXIT_ERROR
        except FileNotFoundError:
            print(f"Error: Could not find directory for {output_file}", file=sys.stderr)
            return EXIT_ERROR

        if args.verbose:
            print(f"Successfully converted to {output_file}")

        return EXIT_SUCCESS

    except KeyboardInterrupt:
        print("\nConversion cancelled by user", file=sys.stderr)
        return EXIT_ERROR
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc(file=sys.stderr)
        else:
            print("Run with --verbose for detailed traceback", file=sys.stderr)
        return EXIT_ERROR


def main(argv: Optional[list] = None):
    """
    Main entry point for CLI.

    Args:
        argv: Command-line arguments (defaults to sys.argv)

    Returns:
        Exit code (0 for success, 1 for error)
    """
    if argv is None:
        argv = sys.argv[1:]

    registry = setup_registry()
    parser = create_parser(registry)
    args = parser.parse_args(argv)

    # Route to single-file conversion mode if --convert-file is specified
    if args.convert_file:
        # Validate mutual exclusivity
        if args.source_dir:
            print("Error: --convert-file and --source-dir are mutually exclusive", file=sys.stderr)
            return EXIT_ERROR
        return convert_single_file(args)

    # Route to in-place file sync mode if --sync-file is specified
    if args.sync_file:
        # Validate mutual exclusivity
        if args.convert_file or args.source_dir or args.target_dir:
            print("Error: --sync-file is mutually exclusive with --convert-file and directory sync", file=sys.stderr)
            return EXIT_ERROR
        if not args.target_file:
            print("Error: --target-file is required when using --sync-file", file=sys.stderr)
            return EXIT_ERROR
        if not args.source_format or not args.target_format:
            print("Error: --source-format and --target-format are required for in-place sync", file=sys.stderr)
            return EXIT_ERROR

        try:
            # Expand and validate paths
            source_file = args.sync_file.expanduser().resolve()
            target_file = args.target_file.expanduser().resolve()

            if not source_file.exists():
                print(f"Error: Source file does not exist: {source_file}", file=sys.stderr)
                return EXIT_ERROR

            if not target_file.exists():
                print(f"Error: Target file does not exist: {target_file}", file=sys.stderr)
                return EXIT_ERROR

            # Get config type (from --only or default for in-place sync)
            if args.only:
                try:
                    config_types = _parse_only_types(args.only)
                    if len(config_types) != 1:
                        print("Error: --only must specify exactly one type for in-place sync", file=sys.stderr)
                        return EXIT_ERROR
                    config_type = config_types[0]
                except ValueError as e:
                    print(f"Error: {e}", file=sys.stderr)
                    return EXIT_ERROR
            else:
                config_type = DEFAULT_CONFIG_TYPE

            # Setup registry
            registry = setup_registry()

            # Create state manager
            state_file = args.state_file.expanduser().resolve() if args.state_file else None
            state_manager = SyncStateManager(state_file=state_file)

            # Build conversion options
            conversion_options = _build_conversion_options(args)

            # Create orchestrator
            orchestrator = UniversalSyncOrchestrator(
                source_dir=source_file.parent,  # Use parent directory for compatibility
                target_dir=target_file.parent,
                source_format=args.source_format,
                target_format=args.target_format,
                config_type=config_type,
                format_registry=registry,
                state_manager=state_manager,
                direction='both',
                dry_run=args.dry_run,
                force=args.force,
                auto_confirm=args.yes,
                verbose=args.verbose,
                strict=args.strict,
                conversion_options=conversion_options
            )

            # Run in-place sync
            orchestrator.sync_files_in_place(
                source_path=source_file,
                target_path=target_file,
                bidirectional=args.bidirectional,
                dry_run=args.dry_run
            )

            # Check for conversion warnings with --strict
            all_warnings = orchestrator.get_all_warnings()
            if all_warnings and args.strict:
                print("\nError: Lossy conversions detected with --strict flag", file=sys.stderr)
                print("See warnings above for details.", file=sys.stderr)
                return EXIT_ERROR

            return EXIT_SUCCESS

        except KeyboardInterrupt:
            print("\nSync cancelled by user", file=sys.stderr)
            return EXIT_ERROR
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            if args.verbose:
                import traceback
                traceback.print_exc(file=sys.stderr)
            else:
                print("Run with --verbose for detailed traceback", file=sys.stderr)
            return EXIT_ERROR

    # Directory sync mode - validate required arguments and auto-discover paths
    
    # First, validate formats are provided for directory sync
    if not args.source_format:
        print("Error: --source-format is required for directory sync", file=sys.stderr)
        return EXIT_ERROR
    if not args.target_format:
        print("Error: --target-format is required for directory sync", file=sys.stderr)
        return EXIT_ERROR

    # Parse and validate --only if provided
    only_config_types = None
    if args.only is not None:
        try:
            only_config_types = _parse_only_types(args.only)
            if not only_config_types:
                print("Error: --only requires at least one valid config type", file=sys.stderr)
                return EXIT_ERROR
        except ValueError as e:
            print(f"Error: {e}", file=sys.stderr)
            return EXIT_ERROR

    # Auto-discover paths if not explicitly provided
    profile_resolver = ProfilePathResolver()
    
    # Determine whether to use profile-level path or config-type-specific subdirectory
    # - If --only specifies a single type, use the subdirectory for that type
    # - If --only is not specified (multi-config mode), use profile-level path for auto-detection
    use_profile_level = (only_config_types is None) or (len(only_config_types) > 1)
    
    if args.source_dir is None:
        if args.no_autodiscover:
            print("Error: --source-dir required when --no-autodiscover is set", file=sys.stderr)
            return EXIT_ERROR
        # Auto-resolve from format
        try:
            if use_profile_level:
                args.source_dir = profile_resolver.get_profile_path(args.source_format)
            else:
                # Single config type specified via --only
                args.source_dir = profile_resolver.get_config_subdir(args.source_format, only_config_types[0])
            if args.verbose:
                print(f"Auto-discovered source directory: {args.source_dir}")
        except ValueError as e:
            print(f"Error: Cannot auto-discover source path: {e}", file=sys.stderr)
            return EXIT_ERROR

    if args.target_dir is None:
        if args.no_autodiscover:
            print("Error: --target-dir required when --no-autodiscover is set", file=sys.stderr)
            return EXIT_ERROR
        # Auto-resolve from format
        try:
            if use_profile_level:
                args.target_dir = profile_resolver.get_profile_path(args.target_format)
            else:
                # Single config type specified via --only
                args.target_dir = profile_resolver.get_config_subdir(args.target_format, only_config_types[0])
            if args.verbose:
                print(f"Auto-discovered target directory: {args.target_dir}")
        except ValueError as e:
            print(f"Error: Cannot auto-discover target path: {e}", file=sys.stderr)
            return EXIT_ERROR

    try:
        # 1. Expand and validate paths
        source_dir = args.source_dir.expanduser().resolve()
        target_dir = args.target_dir.expanduser().resolve()

        if not source_dir.exists():
            print(f"Error: Source directory does not exist: {source_dir}", file=sys.stderr)
            return EXIT_ERROR

        if not source_dir.is_dir():
            print(f"Error: Source path is not a directory: {source_dir}", file=sys.stderr)
            return EXIT_ERROR

        # Target directory doesn't need to exist (will be created if needed)
        # but if it exists, it must be a directory and writable
        if target_dir.exists():
            if not target_dir.is_dir():
                print(f"Error: Target path exists but is not a directory: {target_dir}", file=sys.stderr)
                return EXIT_ERROR
            if not os.access(target_dir, os.W_OK):
                print(f"Error: Target directory is not writable: {target_dir}", file=sys.stderr)
                return EXIT_ERROR
        else:
            # If it doesn't exist, check if parent is writable
            if not os.access(target_dir.parent, os.W_OK):
                print(f"Error: Target parent directory is not writable: {target_dir.parent}", file=sys.stderr)
                return EXIT_ERROR

        # 2. Setup registry
        registry = setup_registry()

        # 3. Create state manager
        state_file = args.state_file.expanduser().resolve() if args.state_file else None
        state_manager = SyncStateManager(state_file=state_file)

        # 4. Build conversion options
        conversion_options = _build_conversion_options(args)

        # 5. Determine operating mode
        # - If --only is provided, sync those specific types
        # - If --only is not provided, auto-detect and sync all available types
        use_multi_config_mode = (args.only is None)

        if use_multi_config_mode:
            # Multi-config mode: auto-detect and sync all available types
            results = sync_all_config_types(
                source_dir=source_dir,
                target_dir=target_dir,
                source_format=args.source_format,
                target_format=args.target_format,
                format_registry=registry,
                state_manager=state_manager,
                config_types=None,  # Auto-detect
                skip_confirmation=args.yes or args.dry_run,
                direction=args.direction,
                dry_run=args.dry_run,
                force=args.force,
                verbose=args.verbose,
                strict=args.strict,
                conversion_options=conversion_options,
            )

            # Check for errors or strict mode violations
            all_warnings = []
            has_errors = False
            for result in results.values():
                all_warnings.extend(result.warnings)
                if not result.success or result.stats.get('errors', 0) > 0:
                    has_errors = True

            if all_warnings and args.strict:
                print("\nError: Lossy conversions detected with --strict flag", file=sys.stderr)
                print("See warnings above for details.", file=sys.stderr)
                return EXIT_ERROR

            if has_errors:
                return EXIT_ERROR

            return EXIT_SUCCESS

        # Explicit --only mode
        config_types_to_sync = only_config_types

        # Track overall results
        all_warnings = []

        # Process each config type
        for config_type in config_types_to_sync:
            if len(config_types_to_sync) > 1:
                print(f"\n--- Syncing {config_type.value}s ---")

            # Create orchestrator for this config type
            orchestrator = UniversalSyncOrchestrator(
                source_dir=source_dir,
                target_dir=target_dir,
                source_format=args.source_format,
                target_format=args.target_format,
                config_type=config_type,
                format_registry=registry,
                state_manager=state_manager,
                direction=args.direction,
                dry_run=args.dry_run,
                force=args.force,
                auto_confirm=args.yes,
                verbose=args.verbose,
                strict=args.strict,
                conversion_options=conversion_options if conversion_options else None
            )

            # Run sync for this config type
            orchestrator.sync()

            # Accumulate warnings
            all_warnings.extend(orchestrator.get_all_warnings())

        # Check for conversion warnings with --strict
        if all_warnings and args.strict:
            print("\nError: Lossy conversions detected with --strict flag", file=sys.stderr)
            print("See warnings above for details.", file=sys.stderr)
            return EXIT_ERROR

        # Success
        return EXIT_SUCCESS

    except KeyboardInterrupt:
        print("\nSync cancelled by user", file=sys.stderr)
        return EXIT_ERROR
    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        if args.verbose:
            import traceback
            traceback.print_exc(file=sys.stderr)
        else:
            print("Run with --verbose for detailed traceback", file=sys.stderr)
        return EXIT_ERROR


if __name__ == '__main__':
    sys.exit(main())