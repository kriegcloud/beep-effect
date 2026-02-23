"""
Base interface for config type handlers.

Handlers encapsulate the logic for converting a specific config type
(AGENT, PERMISSION, SLASH_COMMAND) between a format and canonical representation.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from pathlib import Path
from core.canonical_models import ConfigType, CanonicalConfig


class ConfigTypeHandler(ABC):
    """
    Abstract base class for config type handlers.

    Each handler knows how to convert ONE config type (e.g., AGENT)
    for ONE format (e.g., Claude) to/from canonical representation.

    This enables separation of concerns where each handler focuses
    on a single config type's conversion logic, making the codebase
    more maintainable and scalable.

    Example:
        class ClaudeAgentHandler(ConfigTypeHandler):
            @property
            def config_type(self) -> ConfigType:
                return ConfigType.AGENT

            def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalAgent:
                # Parse Claude agent format
                ...

            def from_canonical(self, canonical_obj: CanonicalAgent, options=None) -> str:
                # Generate Claude agent format
                ...
    """

    @property
    @abstractmethod
    def config_type(self) -> ConfigType:
        """
        The config type this handler processes.

        Returns:
            ConfigType enum value (AGENT, PERMISSION, SLASH_COMMAND, etc.)
        """
        pass

    @abstractmethod
    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalConfig:
        """
        Convert format-specific content to canonical representation.

        Args:
            content: Raw content string from file
            file_path: Optional path to the source file (useful for extracting
                      metadata like filename-based command names)

        Returns:
            Canonical object (CanonicalAgent, CanonicalPermission, etc.)

        Raises:
            ValueError: If content is invalid or malformed
        """
        pass

    @abstractmethod
    def from_canonical(self, canonical_obj: CanonicalConfig,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical representation to format-specific content.

        Args:
            canonical_obj: Canonical object to convert
            options: Optional conversion options (format-specific)

        Returns:
            String content ready to write to file

        Raises:
            ValueError: If canonical_obj is wrong type or invalid
        """
        pass

    def get_warnings(self) -> list:
        """
        Return any conversion warnings generated.

        Override this method if your handler tracks warnings during conversion.

        Returns:
            List of warning messages (empty by default)
        """
        return []