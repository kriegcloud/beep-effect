"""
GitHub Copilot format adapter - coordinator.

Delegates to config-type-specific handlers.
"""

from pathlib import Path
from typing import List, Optional, Dict, Any, Union

from core.adapter_interface import FormatAdapter
from core.canonical_models import CanonicalAgent, CanonicalPermission, CanonicalSlashCommand, ConfigType, CanonicalConfig
from .handlers.agent_handler import CopilotAgentHandler
from .handlers.perm_handler import CopilotPermissionHandler
from .handlers.slash_command_handler import CopilotSlashCommandHandler


class CopilotAdapter(FormatAdapter):
    """
    Adapter for GitHub Copilot format.

    Coordinates between different config type handlers.
    """

    def __init__(self):
        """Initialize adapter with handlers."""
        self.warnings: List[str] = []
        self._handlers = {
            ConfigType.AGENT: CopilotAgentHandler(),
            ConfigType.PERMISSION: CopilotPermissionHandler(),
            ConfigType.SLASH_COMMAND: CopilotSlashCommandHandler()
        }

    @property
    def format_name(self) -> str:
        return "copilot"

    @property
    def file_extension(self) -> str:
        return ".agent.md"

    def get_file_extension(self, config_type: ConfigType) -> str:
        """Copilot uses .perm.json for permissions, .prompt.md for prompts, and .agent.md for agents."""
        if config_type == ConfigType.PERMISSION:
            return ".perm.json"
        if config_type == ConfigType.SLASH_COMMAND:
            return ".prompt.md"
        return self.file_extension

    def get_config_subdir(self, config_type: ConfigType) -> Optional[str]:
        """Copilot uses 'prompts' folder for both agents and slash commands at user-level."""
        if config_type in (ConfigType.SLASH_COMMAND, ConfigType.AGENT):
            return "prompts"
        return super().get_config_subdir(config_type)

    @property
    def supported_config_types(self) -> List[ConfigType]:
        return list(self._handlers.keys())

    def can_handle(self, file_path: Path) -> bool:
        """Check if file is a Copilot agent file, permission file, or prompt file."""
        return (file_path.name.endswith('.agent.md') or
                file_path.name.endswith('.perm.json') or
                file_path.name.endswith('.prompt.md'))

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
              file_path: Path,
              config_type: ConfigType, options: dict = None):
        """Write canonical to file in Copilot format."""
        content = self.from_canonical(canonical_obj, config_type, options)
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except PermissionError:
            raise ValueError(f"Permission denied: {file_path}")
        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")

    def to_canonical(self, content: str, config_type: ConfigType, file_path: Optional[Path] = None) -> CanonicalConfig:
        """Convert Copilot format to canonical (delegates to handler)."""
        self.warnings = []
        handler = self._get_handler(config_type)
        return handler.to_canonical(content, file_path)

    def from_canonical(self, canonical_obj: CanonicalConfig, config_type: ConfigType,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """Convert canonical to Copilot format (delegates to handler)."""
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