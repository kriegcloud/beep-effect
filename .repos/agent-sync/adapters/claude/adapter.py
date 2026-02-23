"""
Claude Code format adapter - coordinator.

Delegates to config-type-specific handlers.
"""

from pathlib import Path
from typing import List, Optional, Dict, Any, Union

from core.adapter_interface import FormatAdapter
from core.canonical_models import CanonicalAgent, CanonicalPermission, CanonicalSlashCommand, ConfigType, CanonicalConfig
from .handlers.agent_handler import ClaudeAgentHandler
from .handlers.perm_handler import ClaudePermissionHandler
from .handlers.slash_command_handler import ClaudeSlashCommandHandler


class ClaudeAdapter(FormatAdapter):
    """
    Adapter for Claude Code format.

    Coordinates between different config type handlers.
    """

    def __init__(self):
        """Initialize adapter with handlers for each config type."""
        self.warnings: List[str] = []
        self._handlers = {
            ConfigType.AGENT: ClaudeAgentHandler(),
            ConfigType.PERMISSION: ClaudePermissionHandler(),
            ConfigType.SLASH_COMMAND: ClaudeSlashCommandHandler()
        }

    @property
    def format_name(self) -> str:
        return "claude"

    @property
    def file_extension(self) -> str:
        return ".md"

    def get_file_extension(self, config_type: ConfigType) -> str:
        """Claude uses .json for permissions (settings.json) and .md for agents."""
        if config_type == ConfigType.PERMISSION:
            return ".json"
        return self.file_extension

    @property
    def supported_config_types(self) -> List[ConfigType]:
        return list(self._handlers.keys())

    def can_handle(self, file_path: Path) -> bool:
        """
        Check if file is a Claude agent file, slash command file, or settings file.

        Note: This method checks if the file matches the format-level patterns
        (file extensions and directory structures) used by Claude. It does not
        guarantee that the file content is valid for a specific ConfigType.
        ConfigType-specific logic is handled by individual handlers during conversion.

        Claude agents are .md files that are NOT .agent.md or .prompt.md files.
        Slash commands are .md files in .claude/commands/ directory.
        Settings are settings.json or settings.local.json.
        """
        if file_path.name in ('settings.json', 'settings.local.json'):
            return True

        # Check if file is a slash command (.md file in .claude/commands/)
        path_parts = file_path.parts
        if '.claude' in path_parts and 'commands' in path_parts:
            return file_path.suffix == '.md'

        # Otherwise, check if it's a regular agent file
        return (file_path.suffix == '.md' and
                not file_path.name.endswith(('.agent.md', '.prompt.md', '.perm.json')))

    def read(self, file_path: Path, config_type: ConfigType) -> CanonicalConfig:
        """Read file and convert to canonical."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except PermissionError:
            raise ValueError(f"Permission denied: {file_path}")
        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")
        return self.to_canonical(content, config_type, file_path)

    def write(self, canonical_obj: CanonicalConfig,
              file_path: Path, config_type: ConfigType, options: dict = None):
        """Write canonical to file in Claude format."""
        content = self.from_canonical(canonical_obj, config_type, options)
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except PermissionError:
            raise ValueError(f"Permission denied: {file_path}")
        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")

    def to_canonical(self, content: str, config_type: ConfigType, file_path: Optional[Path] = None) -> CanonicalConfig:
        """Convert Claude format to canonical (delegates to handler)."""
        self.warnings = []
        handler = self._get_handler(config_type)
        return handler.to_canonical(content, file_path)

    def from_canonical(self, canonical_obj: CanonicalConfig,
                      config_type: ConfigType,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """Convert canonical to Claude format (delegates to handler)."""
        self.warnings = []
        handler = self._get_handler(config_type)

        # Pass adapter reference to handler so it can append warnings
        handler_options = options.copy() if options else {}
        handler_options['adapter'] = self

        return handler.from_canonical(canonical_obj, handler_options)

    def get_warnings(self) -> List[str]:
        return self.warnings

    def clear_conversion_warnings(self):
        self.warnings = []

    def _get_handler(self, config_type: ConfigType):
        """Get handler for config type."""
        if config_type not in self._handlers:
            raise ValueError(f"Unsupported config type: {config_type}")
        return self._handlers[config_type]