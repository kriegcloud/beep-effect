"""
Gemini slash command (custom command) config type handler.

Handles conversion of slash command configurations between Gemini TOML format
and canonical representation.

Gemini uses TOML format for custom commands with the following features:
- TOML file format (.toml extension)
- Namespace support via directory structure (git/review.toml → "git:review")
- Placeholder syntax: {{args}}, !{cmd}, @{file}
"""

import sys
import re
from typing import Any, Dict, Optional, List
from pathlib import Path
from core.canonical_models import CanonicalSlashCommand, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler

# Python 3.11+ has built-in tomllib (read-only)
if sys.version_info >= (3, 11):
    import tomllib
else:
    try:
        import tomli as tomllib
    except ImportError:
        raise ImportError("TOML support requires tomli for Python < 3.11")

# For writing TOML
try:
    import tomli_w
except ImportError:
    raise ImportError("TOML writing requires tomli-w package")


class GeminiSlashCommandHandler(ConfigTypeHandler):
    """Handler for Gemini custom command files (.toml format)."""

    @property
    def config_type(self) -> ConfigType:
        return ConfigType.SLASH_COMMAND

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalSlashCommand:
        """
        Convert Gemini TOML custom command to canonical.

        Parses TOML format with:
        - Required 'prompt' field (the command instructions)
        - Optional 'description' field
        - Extracts namespace from file path (e.g., git/review.toml → "git:review")
        - Preserves Gemini-specific placeholders in metadata
        """
        # Parse TOML content
        try:
            data = tomllib.loads(content)
        except Exception as e:
            raise ValueError(f"Invalid TOML syntax: {e}")

        # Validate required fields
        if 'prompt' not in data:
            raise ValueError("Missing required 'prompt' field in TOML")

        prompt = data['prompt']
        description = data.get('description', '')

        # Extract name and namespace from multiple sources (priority order):
        # 1. From TOML data (for round-trip fidelity)
        # 2. From file path (derived from filename and directory structure)
        # 3. Use 'untitled' as fallback (for string parsing without file_path)
        name = data.get('name', '')
        namespace = ''

        if not name and file_path:
            # Get relative path components for namespace
            # Example: commands/git/review.toml → name="git:review", namespace="git:review"
            parts = file_path.parts

            # Find 'commands' directory in path
            try:
                commands_idx = parts.index('commands')
                # Everything after 'commands' and before filename is namespace
                namespace_parts = parts[commands_idx + 1:-1]
                base_name = file_path.stem  # Filename without .toml extension

                if namespace_parts:
                    # Create colon-separated namespace
                    namespace = ':'.join(namespace_parts)
                    name = f"{namespace}:{base_name}"
                else:
                    name = base_name
            except (ValueError, IndexError):
                # 'commands' not in path, just use filename
                name = file_path.stem

        # If still no name, use fallback
        if not name:
            name = 'untitled'

        # Extract placeholders for metadata
        shell_placeholders = self._extract_shell_placeholders(prompt)
        file_placeholders = self._extract_file_placeholders(prompt)
        has_args_placeholder = '{{args}}' in prompt

        # Create canonical slash command
        slash_command = CanonicalSlashCommand(
            name=name,
            description=description,
            instructions=prompt,
            source_format='gemini'
        )

        # Preserve Gemini-specific metadata
        # Store the full name as namespace when it contains colon (namespaced command)
        if ':' in name:
            slash_command.add_metadata('gemini_namespace', name)
        if shell_placeholders:
            slash_command.add_metadata('gemini_shell_placeholders', shell_placeholders)
        if file_placeholders:
            slash_command.add_metadata('gemini_file_placeholders', file_placeholders)
        slash_command.add_metadata('gemini_args_placeholder', has_args_placeholder)

        return slash_command

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical slash command to Gemini TOML format.

        Generates TOML with:
        - 'name' field (for round-trip fidelity)
        - 'description' field (if present)
        - 'prompt' field with multiline triple-quoted string
        - Preserves placeholders from metadata
        """
        if not isinstance(canonical_obj, CanonicalSlashCommand):
            raise ValueError("Expected CanonicalSlashCommand")

        # Build TOML data structure (field order matters for readability)
        data = {}

        # Add name for round-trip fidelity (optional in Gemini, usually from filename)
        if canonical_obj.name and canonical_obj.name != 'untitled':
            data['name'] = canonical_obj.name

        # Add description if present
        if canonical_obj.description:
            data['description'] = canonical_obj.description

        # Add prompt (instructions)
        data['prompt'] = canonical_obj.instructions

        # Generate TOML string using tomli_w
        # Use multiline_strings=True to format multiline content with triple quotes
        toml_str = tomli_w.dumps(data, multiline_strings=True)

        return toml_str

    def _extract_shell_placeholders(self, text: str) -> List[str]:
        """
        Extract shell command placeholders from text.

        Shell placeholders use syntax: !{command}
        Example: !{git status}, !{tree -L 3}

        Returns:
            List of shell placeholder strings (including the !{...} wrapper)
        """
        pattern = r'!\{[^}]+\}'
        matches = re.findall(pattern, text)
        return matches

    def _extract_file_placeholders(self, text: str) -> List[str]:
        """
        Extract file embedding placeholders from text.

        File placeholders use syntax: @{file}
        Example: @{test.py}, @{{{args}}}

        Returns:
            List of file placeholder strings (including the @{...} wrapper)
        """
        pattern = r'@\{[^}]+\}'
        matches = re.findall(pattern, text)
        return matches
