"""
Gemini CLI format adapter - coordinator.

This adapter supports Gemini CLI custom commands (slash commands) using TOML format.

Gemini custom commands:
- Format: TOML files in ~/.gemini/commands/
- File extension: .toml
- Namespace support via directory structure (git/review.toml → "git:review")
- Placeholder syntax: {{args}}, !{cmd}, @{file}

Note: Based on research findings, Gemini agents and permissions are not supported
due to architectural mismatches:
- Agents: Gemini aliases are model presets, not instruction-based agents
- Permissions: Incompatible security models (folder trust vs. tool patterns)
"""

from pathlib import Path
from typing import List, Optional, Dict, Any

from core.adapter_interface import FormatAdapter
from core.canonical_models import ConfigType, CanonicalConfig
from .handlers.slash_command_handler import GeminiSlashCommandHandler


class GeminiAdapter(FormatAdapter):
    """
    Gemini CLI adapter - coordinator pattern.

    This coordinator delegates to config-type-specific handlers.
    Currently supports only SLASH_COMMAND (custom commands in TOML format).
    """

    def __init__(self):
        """Initialize adapter with handlers for each config type."""
        self.warnings: List[str] = []
        self._handlers = {
            ConfigType.SLASH_COMMAND: GeminiSlashCommandHandler()
        }

    @property
    def format_name(self) -> str:
        """Unique identifier for this format."""
        return "gemini"

    @property
    def file_extension(self) -> str:
        """Primary file extension for this format."""
        return ".toml"

    def get_file_extension(self, config_type: ConfigType) -> str:
        """
        Get file extension for a specific config type.

        For Gemini, only SLASH_COMMAND is supported with .toml extension.
        """
        if config_type == ConfigType.SLASH_COMMAND:
            return ".toml"
        raise ValueError(f"Unsupported config type for Gemini: {config_type}")

    @property
    def supported_config_types(self) -> List[ConfigType]:
        """Return list of supported config types (from registered handlers)."""
        return list(self._handlers.keys())

    def can_handle(self, file_path: Path) -> bool:
        """
        Check if this adapter can handle the given file.

        Gemini custom commands use .toml extension.
        """
        return file_path.suffix == '.toml'

    def read(self, file_path: Path, config_type: ConfigType) -> CanonicalConfig:
        """Read file and convert to canonical (delegates to handler)."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except PermissionError:
            raise ValueError(f"Permission denied: {file_path}")
        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")
        return self.to_canonical(content, config_type, file_path)

    def write(self, canonical_obj: CanonicalConfig, file_path: Path, config_type: ConfigType,
              options: dict = None):
        """Write canonical to file (delegates to handler)."""
        content = self.from_canonical(canonical_obj, config_type, options)
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
        except PermissionError:
            raise ValueError(f"Permission denied: {file_path}")
        except FileNotFoundError:
            raise ValueError(f"File not found: {file_path}")

    def to_canonical(self, content: str, config_type: ConfigType, file_path: Optional[Path] = None) -> CanonicalConfig:
        """
        Convert format-specific content to canonical (delegates to handler).

        The coordinator doesn't parse content - it finds the right handler
        and delegates to it.
        """
        self.warnings = []
        handler = self._get_handler(config_type)
        return handler.to_canonical(content, file_path)

    def from_canonical(self, canonical_obj: CanonicalConfig, config_type: ConfigType,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical to format-specific content (delegates to handler).

        The coordinator doesn't generate content - it finds the right handler
        and delegates to it.
        """
        self.warnings = []
        handler = self._get_handler(config_type)
        return handler.from_canonical(canonical_obj, options)

    def get_warnings(self) -> List[str]:
        """Return warnings about data loss or unsupported features."""
        return self.warnings

    def clear_conversion_warnings(self):
        """Clear any stored conversion warnings."""
        self.warnings = []

    def _get_handler(self, config_type: ConfigType):
        """Get handler for config type or raise error if unsupported."""
        if config_type not in self._handlers:
            raise ValueError(
                f"Unsupported config type: {config_type}. "
                f"Gemini adapter only supports: {list(self._handlers.keys())}"
            )
        return self._handlers[config_type]
