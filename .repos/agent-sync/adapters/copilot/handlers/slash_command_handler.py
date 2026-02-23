"""
Copilot slash command (prompt file) config type handler.

Handles conversion of slash command configurations between Copilot format
and canonical representation.
"""

from typing import Any, Dict, Optional, List
from pathlib import Path
from core.canonical_models import CanonicalSlashCommand, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler
from adapters.shared.frontmatter import parse_yaml_frontmatter, build_yaml_frontmatter


class CopilotSlashCommandHandler(ConfigTypeHandler):
    """Handler for Copilot prompt files (.prompt.md with optional YAML frontmatter)."""

    @property
    def config_type(self) -> ConfigType:
        return ConfigType.SLASH_COMMAND

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalSlashCommand:
        """
        Convert Copilot prompt file to canonical.

        Parses YAML frontmatter and markdown body for prompt files.
        Frontmatter is optional - if not present, entire content is treated as instructions.
        """
        # Try to parse frontmatter, but handle case where it's missing
        try:
            frontmatter, body = parse_yaml_frontmatter(content)
        except ValueError:
            # No frontmatter found, treat entire content as body
            frontmatter = {}
            body = content.strip()

        # Validate frontmatter - check for obvious syntax errors like unclosed quotes
        if frontmatter and not isinstance(frontmatter, dict):
            raise ValueError(f"Invalid frontmatter format: expected dict, got {type(frontmatter).__name__}")

        # Check for unclosed quotes in the original YAML content if frontmatter was found
        if '---' in content[:100]:  # Only check if frontmatter exists
            yaml_section = content.split('---')[1] if len(content.split('---')) > 1 else ''
            if self._has_unclosed_quotes(yaml_section):
                raise ValueError("Invalid YAML: unclosed quotes in frontmatter")

        # Create canonical slash command
        cmd = CanonicalSlashCommand(
            name=frontmatter.get('name', ''),
            description=frontmatter.get('description', ''),
            instructions=body,
            argument_hint=frontmatter.get('argument-hint'),
            model=frontmatter.get('model'),
            allowed_tools=frontmatter.get('tools') or [],
            source_format='copilot'
        )

        # Preserve Copilot-specific fields in metadata
        if frontmatter and 'agent' in frontmatter:
            cmd.add_metadata('copilot_agent', frontmatter['agent'])

        return cmd

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical slash command to Copilot format.

        Generates YAML frontmatter with Copilot-specific fields.
        """
        if not isinstance(canonical_obj, CanonicalSlashCommand):
            raise ValueError("Expected CanonicalSlashCommand")

        options = options or {}

        # Build frontmatter
        frontmatter = {}

        # Add name if present
        if canonical_obj.name:
            frontmatter['name'] = canonical_obj.name

        # Add description if present
        if canonical_obj.description:
            frontmatter['description'] = canonical_obj.description

        # Add argument-hint if present
        if canonical_obj.argument_hint:
            frontmatter['argument-hint'] = canonical_obj.argument_hint

        # Add model if present
        if canonical_obj.model:
            frontmatter['model'] = canonical_obj.model

        # Add tools if present
        if canonical_obj.allowed_tools:
            frontmatter['tools'] = canonical_obj.allowed_tools

        # Restore Copilot-specific metadata
        if canonical_obj.has_metadata('copilot_agent'):
            frontmatter['agent'] = canonical_obj.get_metadata('copilot_agent')

        return build_yaml_frontmatter(frontmatter, canonical_obj.instructions)

    def _has_unclosed_quotes(self, yaml_content: str) -> bool:
        """
        Check for unclosed quotes in YAML content.

        Note: This is a simple heuristic and does not support multiline strings (|, >).
        It handles comments by ignoring text after # until newline.

        Args:
            yaml_content: YAML frontmatter content (without --- delimiters)

        Returns:
            True if there are unclosed quotes, False otherwise
        """
        in_single = False
        in_double = False
        i = 0
        length = len(yaml_content)

        while i < length:
            char = yaml_content[i]

            # Handle comments: if # and not in quotes, skip to newline
            if char == '#' and not in_single and not in_double:
                while i < length and yaml_content[i] != '\n':
                    i += 1
                continue

            # Handle escapes
            if char == '\\' and i + 1 < length:
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
