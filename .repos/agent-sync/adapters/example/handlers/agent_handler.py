"""
Example agent config type handler template.

This handler demonstrates how to convert agent configurations between
your format and canonical representation.

Handlers focus on ONE config type. If your format supports multiple config
types (agents, permissions, prompts), create separate handler files for each.
"""

from typing import Any, Dict, Optional
from pathlib import Path
from core.canonical_models import CanonicalAgent, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler


class ExampleAgentHandler(ConfigTypeHandler):
    """
    Handler for Example format agent files.

    TODO: Update the docstring to describe your format:
    - File structure (e.g., ".agent.json with JSON format")
    - Special fields or conventions
    - Model name mappings if applicable
    """

    # TODO: If your format uses different model names than canonical (sonnet/opus/haiku),
    # define mappings here. Remove if not needed.
    # MODEL_TO_CANONICAL = {
    #     'your-sonnet-name': 'sonnet',
    #     'your-opus-name': 'opus',
    #     'your-haiku-name': 'haiku',
    # }
    #
    # MODEL_FROM_CANONICAL = {
    #     'sonnet': 'Your Sonnet Name',
    #     'opus': 'Your Opus Name',
    #     'haiku': 'Your Haiku Name',
    # }

    @property
    def config_type(self) -> ConfigType:
        """This handler processes AGENT config type."""
        return ConfigType.AGENT

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalAgent:
        """
        Convert your format's agent file to canonical representation.

        Implementation steps:
        1. Parse the content (YAML, JSON, custom format, etc.)
        2. Extract standard fields (name, description, instructions, tools, model)
        3. Normalize model names to canonical form
        4. Store format-specific fields in metadata for round-trip preservation
        5. Return CanonicalAgent instance

        Example patterns:

        For YAML frontmatter + Markdown (like Claude/Copilot):
            frontmatter, body = parse_yaml_frontmatter(content)
            agent = CanonicalAgent(
                name=frontmatter.get('name', ''),
                description=frontmatter.get('description', ''),
                instructions=body,
                tools=frontmatter.get('tools', []),
                model=self._normalize_model(frontmatter.get('model')),
                source_format='example'
            )

        For pure JSON:
            import json
            data = json.loads(content)
            agent = CanonicalAgent(
                name=data.get('name', ''),
                description=data.get('description', ''),
                instructions=data.get('instructions', ''),
                tools=data.get('tools', []),
                model=self._normalize_model(data.get('model')),
                source_format='example'
            )

        Preserve format-specific fields:
            if 'unique_field' in frontmatter:
                agent.add_metadata('example_unique_field', frontmatter['unique_field'])
        """
        # TODO: Implement parsing logic
        raise NotImplementedError("ExampleAgentHandler is a template - implement to_canonical()")

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical agent to your format's file content.

        Implementation steps:
        1. Validate canonical_obj is CanonicalAgent
        2. Build format-specific structure
        3. Map canonical fields to your format's fields
        4. Restore format-specific fields from metadata
        5. Serialize to string

        Example patterns:

        For YAML frontmatter + Markdown:
            frontmatter = {
                'name': canonical_obj.name,
                'description': canonical_obj.description,
                'tools': canonical_obj.tools,
                'model': self._denormalize_model(canonical_obj.model)
            }
            # Restore format-specific metadata
            if canonical_obj.get_metadata('example_unique_field'):
                frontmatter['unique_field'] = canonical_obj.get_metadata('example_unique_field')
            return build_yaml_frontmatter(frontmatter, canonical_obj.instructions)

        For pure JSON:
            import json
            data = {
                'name': canonical_obj.name,
                'description': canonical_obj.description,
                'instructions': canonical_obj.instructions,
                'tools': canonical_obj.tools,
                'model': self._denormalize_model(canonical_obj.model)
            }
            return json.dumps(data, indent=2)
        """
        if not isinstance(canonical_obj, CanonicalAgent):
            raise ValueError("Expected CanonicalAgent")

        options = options or {}

        # TODO: Implement serialization logic
        raise NotImplementedError("ExampleAgentHandler is a template - implement from_canonical()")

    # Helper methods (optional - customize for your format)

    def _normalize_model(self, model: Optional[str]) -> Optional[str]:
        """
        Convert format-specific model names to canonical form.

        Canonical model names: sonnet, opus, haiku

        If your format already uses these names, just lowercase and return.
        If your format uses different names, map them using MODEL_TO_CANONICAL dict.

        Example:
            if not model:
                return None
            return self.MODEL_TO_CANONICAL.get(model.lower(), model.lower())
        """
        if not model:
            return None
        # TODO: Implement model normalization or remove if not needed
        return model.lower()

    def _denormalize_model(self, model: Optional[str]) -> Optional[str]:
        """
        Convert canonical model names to format-specific names.

        Example:
            if not model:
                return None
            return self.MODEL_FROM_CANONICAL.get(model.lower(), model)
        """
        if not model:
            return None
        # TODO: Implement model denormalization or remove if not needed
        return model
