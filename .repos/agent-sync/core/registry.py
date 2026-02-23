"""
Format registry for managing available format adapters.

The registry acts as a central directory of all format adapters, providing:
- Adapter registration and lookup
- Auto-detection of format from file paths
- Validation of format support for config types
- Discovery of available formats

Adapters can be dynamically registered without modifying core code.
"""

from typing import Dict, List, Optional
from pathlib import Path
from .adapter_interface import FormatAdapter
from .canonical_models import ConfigType


class FormatRegistry:
    """
    Central registry for all format adapters.

    Usage:
        registry = FormatRegistry()
        registry.register(ClaudeAdapter())
        registry.register(CopilotAdapter())

        adapter = registry.get_adapter('claude')
        adapter = registry.detect_format(Path('agent.md'))

    Thread Safety:
        The registry is not thread-safe for concurrent registration or
        unregistration. It is recommended to register all adapters during
        application startup. Once initialized, concurrent read operations
        (get_adapter, detect_format, etc.) are safe.
    """

    def __init__(self):
        """Initialize empty registry."""
        self._adapters: Dict[str, FormatAdapter] = {}

    def register(self, adapter: FormatAdapter):
        """
        Register a new format adapter.

        Args:
            adapter: FormatAdapter instance to register

        Raises:
            ValueError: If adapter with same format_name already registered

        Example:
            registry.register(ClaudeAdapter())
            registry.register(CopilotAdapter())
        """
        if adapter.format_name in self._adapters:
            existing = self._adapters[adapter.format_name]
            raise ValueError(
                f"Adapter for format '{adapter.format_name}' already registered "
                f"(existing: {existing.__class__.__name__}, new: {adapter.__class__.__name__})"
            )
        self._adapters[adapter.format_name] = adapter

    def unregister(self, format_name: str):
        """
        Unregister a format adapter.

        Args:
            format_name: Name of format to unregister
        """
        if format_name in self._adapters:
            del self._adapters[format_name]

    def get_adapter(self, format_name: str) -> Optional[FormatAdapter]:
        """
        Get adapter by format name.

        Args:
            format_name: Format identifier (e.g., 'claude', 'copilot')

        Returns:
            FormatAdapter instance or None if not found
        """
        return self._adapters.get(format_name)

    def detect_format(self, file_path: Path) -> Optional[FormatAdapter]:
        """
        Auto-detect format from file path.

        Iterates through registered adapters and returns the first one
        whose can_handle() method returns True.

        Registration order matters - the first matching adapter is returned.
        If multiple adapters could handle the file, a warning is issued.

        Args:
            file_path: Path to file to detect format for

        Returns:
            FormatAdapter that can handle this file, or None if no match

        Example:
            adapter = registry.detect_format(Path('~/.claude/agents/planner.md'))
            # Returns ClaudeAdapter instance
        """
        import warnings
        
        matches = []
        for adapter in self._adapters.values():
            if adapter.can_handle(file_path):
                matches.append(adapter)
        
        if not matches:
            return None
            
        if len(matches) > 1:
            adapter_names = [a.format_name for a in matches]
            warnings.warn(
                f"Multiple adapters match file '{file_path}': {adapter_names}. "
                f"Using the first match: '{matches[0].format_name}'.",
                RuntimeWarning
            )
            
        return matches[0]

    def list_formats(self) -> List[str]:
        """
        List all registered format names.

        Returns:
            List of format identifiers

        Example:
            formats = registry.list_formats()
            # ['claude', 'copilot', 'cursor']
        """
        return list(self._adapters.keys())

    def supports_config_type(self, format_name: str, config_type: ConfigType) -> bool:
        """
        Check if format supports a specific config type.

        Args:
            format_name: Format identifier
            config_type: ConfigType to check

        Returns:
            True if format supports this config type

        Example:
            registry.supports_config_type('claude', ConfigType.AGENT)  # True
            registry.supports_config_type('copilot', ConfigType.PERMISSION)  # False
        """
        adapter = self.get_adapter(format_name)
        return bool(adapter and config_type in adapter.supported_config_types)

    def validate_conversion_support(self, source_format: str, target_format: str,
                                 config_type: ConfigType) -> bool:
        """
        Validate that both formats support the given config type for conversion.

        Args:
            source_format: Source format identifier
            target_format: Target format identifier
            config_type: ConfigType to validate

        Returns:
            True if both formats support the config type

        Example:
            if registry.validate_conversion_support('claude', 'copilot', ConfigType.AGENT):
                # Proceed with conversion
        """
        return (self.supports_config_type(source_format, config_type) and
                self.supports_config_type(target_format, config_type))

    def get_formats_supporting(self, config_type: ConfigType) -> List[str]:
        """
        Get all formats that support a specific config type.

        Args:
            config_type: ConfigType to filter by

        Returns:
            List of format names that support this config type

        Example:
            formats = registry.get_formats_supporting(ConfigType.AGENT)
            # ['claude', 'copilot', 'cursor', 'windsurf']
        """
        return [
            format_name
            for format_name, adapter in self._adapters.items()
            if config_type in adapter.supported_config_types
        ]

    def detect_config_types_in_directory(
        self,
        path: Path,
        format_name: str
    ) -> Dict[ConfigType, int]:
        """
        Scan directory and return detected config types with file counts.

        Searches for files in format-specific subdirectories. Each adapter defines
        its own subdirectory mapping via get_config_subdir(). Common mappings:
        - AGENT: agents/
        - SLASH_COMMAND: commands/ (Claude/Gemini) or prompts/ (Copilot)
        - PERMISSION: root directory

        Args:
            path: Directory to scan
            format_name: Format to use for detection (e.g., 'claude', 'copilot')

        Returns:
            Dict mapping ConfigType to count of matching files.
            Only includes config types with count > 0.
            Returns empty dict if format not found or no files match.

        Example:
            result = registry.detect_config_types_in_directory(Path('~/.claude'), 'claude')
            # {ConfigType.AGENT: 5, ConfigType.SLASH_COMMAND: 12}
        """
        adapter = self.get_adapter(format_name)
        if not adapter:
            return {}

        result = {}
        path = Path(path)

        for config_type in adapter.supported_config_types:
            subdir = adapter.get_config_subdir(config_type)
            search_path = path / subdir if subdir else path

            if not search_path.exists():
                continue

            extension = adapter.get_file_extension(config_type)
            pattern = f"*{extension}"
            count = len(list(search_path.glob(pattern)))

            if count > 0:
                result[config_type] = count

        return result
