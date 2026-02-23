"""
Format adapter interface defining the contract for all format converters.

This module defines the abstract base class that all format adapters must implement.
Each AI coding tool (Claude, Copilot, Cursor, etc.) gets its own adapter that knows
how to convert between that tool's format and the canonical representation.

Design pattern: Adapter pattern + Strategy pattern
- Adapter: Converts between incompatible interfaces (tool format <-> canonical)
- Strategy: Different conversion strategies can be plugged in per format

Benefits:
- Uniform interface for all formats
- Easy to add new formats (just implement this interface)
- Testable in isolation
- Plugin-compatible (third parties can add formats)
"""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import List, Optional, Any, Dict, Union
from .canonical_models import ConfigType, CanonicalConfig, CanonicalAgent, CanonicalPermission, CanonicalSlashCommand


class FormatAdapter(ABC):
    """
    Abstract base class for format adapters.

    Each AI tool format (Claude Code, GitHub Copilot, Cursor, etc.) implements
    this interface to provide bidirectional conversion with the canonical format.

    Lifecycle:
    1. Register adapter with FormatRegistry
    2. Registry uses can_handle() to detect which adapter to use for a file
    3. read() parses file → to_canonical() → returns canonical object
    4. write() takes canonical object → from_canonical() → writes file
    """

    @property
    @abstractmethod
    def format_name(self) -> str:
        """
        Unique identifier for this format.

        Examples: 'claude', 'copilot', 'cursor', 'windsurf'
        Used for registry lookups and CLI arguments.
        """
        pass

    @property
    @abstractmethod
    def file_extension(self) -> str:
        """
        Primary file extension for this format.

        Examples: '.md', '.agent.md', '.json'
        Used for file discovery and matching.
        """
        pass

    @abstractmethod
    def get_file_extension(self, config_type: ConfigType) -> str:
        """
        Get file extension for a specific config type.

        Must be implemented by subclasses to return the correct extension for each config type.
        """
        pass

    @property
    @abstractmethod
    def supported_config_types(self) -> List[ConfigType]:
        """
        Which configuration types this format supports.

        Examples:
        - Claude: [ConfigType.AGENT, ConfigType.PERMISSION]
        - Copilot: [ConfigType.AGENT]
        - Cursor: [ConfigType.AGENT, ConfigType.SLASH_COMMAND]

        Returns:
            List of ConfigType enums this adapter can handle
        """
        pass

    @abstractmethod
    def can_handle(self, file_path: Path) -> bool:
        """
        Check if this adapter can handle the given file.

        Used by FormatRegistry to auto-detect format from file path.
        Should check file extension, naming patterns, or even peek at content.

        Args:
            file_path: Path to file to check

        Returns:
            True if this adapter can handle this file

        Example:
            def can_handle(self, file_path: Path) -> bool:
                return file_path.suffix == '.md' and not file_path.name.endswith('.agent.md')
        """
        pass

    @abstractmethod
    def read(self, file_path: Path, config_type: ConfigType) -> CanonicalConfig:
        """
        Read a file and convert to canonical format.

        Args:
            file_path: Path to file to read
            config_type: Type of config to read (AGENT, PERMISSION, SLASH_COMMAND)

        Returns:
            Union[CanonicalAgent, CanonicalPermission, CanonicalSlashCommand]

        Raises:
            ValueError: If file format is invalid
            FileNotFoundError: If file doesn't exist
            IOError: If file cannot be read
        """
        pass

    @abstractmethod
    def write(self, canonical_obj: CanonicalConfig, file_path: Path, config_type: ConfigType,
              options: Optional[Dict[str, Any]] = None):
        """
        Write canonical format to file in this format.

        Args:
            canonical_obj: Union[CanonicalAgent, CanonicalPermission, CanonicalSlashCommand]
            file_path: Where to write the file
            config_type: Type of config being written
            options: Optional conversion options (e.g., add_argument_hint)

        Raises:
            ValueError: If canonical_obj is invalid
            IOError: If file cannot be written
        """
        pass

    @abstractmethod
    def to_canonical(self, content: str, config_type: ConfigType,
                     file_path: Optional[Path] = None) -> CanonicalConfig:
        """
        Convert raw content string to canonical representation.

        This is the core parsing/conversion logic. Extracts fields from the
        format-specific structure and maps them to canonical fields.

        Args:
            content: Raw file content as string
            config_type: What type of config this is
            file_path: Optional path to the source file (useful for extracting
                      metadata like filename-based command names)

        Returns:
            Union[CanonicalAgent, CanonicalPermission, CanonicalSlashCommand]

        Example:
            def to_canonical(self, content: str, config_type: ConfigType, file_path=None) -> CanonicalAgent:
                frontmatter, body = self._parse_yaml_frontmatter(content)
                return CanonicalAgent(
                    name=frontmatter['name'],
                    description=frontmatter['description'],
                    instructions=body,
                    tools=self._parse_tools(frontmatter.get('tools')),
                    model=self._normalize_model(frontmatter.get('model')),
                    source_format=self.format_name
                )
        """
        pass

    @abstractmethod
    def from_canonical(self, canonical_obj: CanonicalConfig, config_type: ConfigType,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical representation to this format's string.

        This is the core serialization logic. Takes canonical fields and
        generates format-specific output.

        Args:
            canonical_obj: The canonical object to convert
            config_type: What type of config this is
            options: Optional conversion options (e.g., add_argument_hint=True)

        Returns:
            String content ready to write to file

        Example:
            def from_canonical(self, agent: CanonicalAgent, config_type: ConfigType) -> str:
                frontmatter = {
                    'name': agent.name,
                    'description': agent.description,
                    'tools': ', '.join(agent.tools),
                    'model': self._denormalize_model(agent.model)
                }
                yaml_str = yaml.dump(frontmatter)
                return f"---\n{yaml_str}---\n{agent.instructions}\n"
        """
        pass

    def get_warnings(self) -> List[str]:
        """
        Return warnings about data loss or unsupported features.

        Should return warnings for the most recent operation.
        Implementations should clear internal warning storage after this is called
        or provide a clear_conversion_warnings() mechanism.

        Returns:
            List of warning messages
        """
        return []

    def clear_conversion_warnings(self):
        """
        Clear any stored conversion warnings.
        """
        pass

    def validate(self, canonical_obj: Any, config_type: ConfigType) -> List[str]:
        """
        Validate that canonical object can be converted to this format.

        Optional method to check if conversion will succeed and identify issues.

        Returns:
            List of validation error messages (empty if valid)
        """
        return []

    def get_config_subdir(self, config_type: ConfigType) -> Optional[str]:
        """
        Get subdirectory name for a specific config type.

        Returns the subdirectory where files of this config type are stored
        relative to the format's profile directory.

        Default mappings (can be overridden by subclasses):
        - AGENT: "agents"
        - SLASH_COMMAND: "commands"
        - PERMISSION: None (root directory)

        Args:
            config_type: The type of configuration

        Returns:
            Subdirectory name, or None if files are in root directory
        """
        default_subdirs = {
            ConfigType.AGENT: "agents",
            ConfigType.SLASH_COMMAND: "commands",
            ConfigType.PERMISSION: None,
        }
        return default_subdirs.get(config_type)