"""
Example format adapter template - coordinator.

This file serves as a template for implementing new format adapters using
the handler-based architecture pattern.

To implement a new adapter:
1. Copy the adapters/example/ directory to adapters/yourformat/
2. Rename ExampleAdapter to YourFormatAdapter
3. Rename ExampleAgentHandler to YourFormatAgentHandler
4. Implement all TODOs in adapter.py and handlers/agent_handler.py
5. Register in cli/main.py or your application

See ClaudeAdapter and CopilotAdapter for working examples.
"""

from pathlib import Path
from typing import List, Optional, Dict, Any

from core.adapter_interface import FormatAdapter
from core.canonical_models import CanonicalAgent, ConfigType, CanonicalConfig
from .handlers.agent_handler import ExampleAgentHandler


class ExampleAdapter(FormatAdapter):
    """
    Example adapter template - coordinator pattern.

    This coordinator delegates to config-type-specific handlers.
    As you add support for more config types (PERMISSION, SLASH_COMMAND, etc.),
    add new handlers and register them in __init__().

    Replace this with your format's description, including:
    - File format (Markdown, JSON, YAML, etc.)
    - File location (e.g., ~/.tool/agents/, .tool/config.json)
    - Unique features or fields
    """

    def __init__(self):
        """Initialize adapter with handlers for each config type."""
        self.warnings: List[str] = []
        self._handlers = {
            ConfigType.AGENT: ExampleAgentHandler()
            # TODO: Add more handlers as you support more config types
            # ConfigType.PERMISSION: ExamplePermissionHandler(),
            # ConfigType.SLASH_COMMAND: ExampleSlashCommandHandler(),
        }

    @property
    def format_name(self) -> str:
        """
        Unique identifier for this format.

        TODO: Change to your format name (e.g., 'cursor', 'windsurf', 'yourformat')
        """
        return "example"

    @property
    def file_extension(self) -> str:
        """
        Primary file extension for this format.

        TODO: Change to your format's file extension (e.g., '.agent.yaml', '.json')
        """
        return ".example"

    def get_file_extension(self, config_type: ConfigType) -> str:
        """
        Get file extension for a specific config type.
        
        TODO: Implement logic if different config types use different extensions.
        """
        return self.file_extension

    @property
    def supported_config_types(self) -> List[ConfigType]:
        """Return list of supported config types (from registered handlers)."""
        return list(self._handlers.keys())

    def can_handle(self, file_path: Path) -> bool:
        """
        Check if this adapter can handle the given file.

        TODO: Implement file detection logic. Examples:
        - Simple extension check: file_path.suffix == '.example'
        - Multiple patterns: file_path.name.endswith(('.example', '.ex'))
        - Specific filename: file_path.name == 'config.json'
        """
        return file_path.suffix == self.file_extension

    def read(self, file_path: Path, config_type: ConfigType) -> CanonicalConfig:
        """Read file and convert to canonical (delegates to handler)."""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return self.to_canonical(content, config_type, file_path)

    def write(self, canonical_obj: CanonicalConfig, file_path: Path, config_type: ConfigType,
              options: dict = None):
        """Write canonical to file (delegates to handler)."""
        content = self.from_canonical(canonical_obj, config_type, options)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

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

    def _get_handler(self, config_type: ConfigType):
        """Get handler for config type or raise error if unsupported."""
        if config_type not in self._handlers:
            raise ValueError(f"Unsupported config type: {config_type}")
        return self._handlers[config_type]
