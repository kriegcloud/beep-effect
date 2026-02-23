"""
Claude slash command config type handler.

Handles conversion of slash command configurations between Claude format
and canonical representation.
"""

from typing import Any, Dict, Optional, List
from pathlib import Path
from core.canonical_models import CanonicalSlashCommand, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler
from adapters.shared.frontmatter import parse_yaml_frontmatter, build_yaml_frontmatter
from adapters.shared.utils import parse_tool_list


class ClaudeSlashCommandHandler(ConfigTypeHandler):
    """Handler for Claude slash command files (.md with optional YAML frontmatter)."""

    @property
    def config_type(self) -> ConfigType:
        return ConfigType.SLASH_COMMAND

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalSlashCommand:
        """
        Convert Claude slash command file to canonical.

        Parses YAML frontmatter and markdown body for slash commands.
        The command name is derived from the file path, not frontmatter.
        Frontmatter is optional - if not present, entire content is treated as instructions.
        """
        # Try to parse frontmatter, but handle case where it's missing
        try:
            frontmatter, body = parse_yaml_frontmatter(content)
        except ValueError as e:
            if "No YAML frontmatter found" in str(e):
                # No frontmatter found, treat entire content as body
                frontmatter = {}
                body = content.strip()
            else:
                # Re-raise other ValueErrors
                raise

        # Validate frontmatter - check for obvious syntax errors like unclosed quotes
        if frontmatter and not isinstance(frontmatter, dict):
            raise ValueError(f"Invalid frontmatter format: expected dict, got {type(frontmatter).__name__}")

        # Check for unclosed quotes in the original YAML content if frontmatter was found
        if '---' in content[:100]:  # Only check if frontmatter exists
            yaml_section = content.split('---')[1] if len(content.split('---')) > 1 else ''
            if self._has_unclosed_quotes(yaml_section):
                raise ValueError("Invalid YAML: unclosed quotes in frontmatter")

        # Derive name from multiple sources (in order of preference):
        # 1. From frontmatter (for round-trip fidelity)
        # 2. From file_path (derived from filename)
        # 3. Empty string as fallback
        name = frontmatter.get('name', '')
        if not name and file_path:
            name = file_path.stem

        # Create canonical slash command
        # Handle argument-hint which might be parsed as a list by YAML (e.g., [message] -> ['message'])
        argument_hint = frontmatter.get('argument-hint')
        if isinstance(argument_hint, list) and len(argument_hint) == 1:
            # Convert single-element list back to string representation
            argument_hint = f"[{argument_hint[0]}]"

        # Claude format requires description
        description = frontmatter.get('description', '')
        if not description:
            raise ValueError("Claude slash commands must have a non-empty description")

        slash_command = CanonicalSlashCommand(
            name=name,
            description=description,
            instructions=body,
            argument_hint=argument_hint,
            model=frontmatter.get('model'),
            allowed_tools=parse_tool_list(frontmatter.get('allowed-tools', '')),
            source_format='claude'
        )

        # Preserve Claude-specific fields in metadata
        if frontmatter and 'disable-model-invocation' in frontmatter:
            slash_command.add_metadata('claude_disable_model_invocation', frontmatter['disable-model-invocation'])

        return slash_command

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical slash command to Claude format.

        Generates YAML frontmatter with Claude-specific fields.
        """
        if not isinstance(canonical_obj, CanonicalSlashCommand):
            raise ValueError("Expected CanonicalSlashCommand")

        options = options or {}

        # Build frontmatter
        frontmatter = {}

        # Add name for round-trip fidelity (even though typically derived from filename)
        if canonical_obj.name:
            frontmatter['name'] = canonical_obj.name

        # Add description if present
        if canonical_obj.description:
            frontmatter['description'] = canonical_obj.description

        # Add allowed-tools if present (convert list to comma-separated string)
        if canonical_obj.allowed_tools:
            frontmatter['allowed-tools'] = ', '.join(canonical_obj.allowed_tools)

        # Add argument-hint if present
        if canonical_obj.argument_hint:
            frontmatter['argument-hint'] = canonical_obj.argument_hint

        # Add model if present
        if canonical_obj.model:
            frontmatter['model'] = canonical_obj.model

        # Restore Claude-specific metadata
        if canonical_obj.has_metadata('claude_disable_model_invocation'):
            frontmatter['disable-model-invocation'] = canonical_obj.get_metadata('claude_disable_model_invocation')

        return build_yaml_frontmatter(frontmatter, canonical_obj.instructions)

    def _has_unclosed_quotes(self, yaml_content: str) -> bool:
        """
        Check for unclosed quotes in YAML content.

        Args:
            yaml_content: YAML frontmatter content (without --- delimiters)

        Returns:
            True if there are unclosed quotes, False otherwise
        """
        in_single = False
        in_double = False
        i = 0
        while i < len(yaml_content):
            char = yaml_content[i]

            # Handle escapes
            if char == '\\' and i + 1 < len(yaml_content):
                i += 2
                continue

            # Toggle quote states
            if char == '"' and not in_single:
                in_double = not in_double
            elif char == "'" and not in_double:
                in_single = not in_single

            i += 1

        # If we end with either quote style still open, we have unclosed quotes
        return in_single or in_double
