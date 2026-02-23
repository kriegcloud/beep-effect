"""
Claude agent config type handler.

Handles conversion of agent configurations between Claude format
and canonical representation.
"""

from typing import Any, Dict, Optional, List
from pathlib import Path
from core.canonical_models import CanonicalAgent, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler
from adapters.shared.frontmatter import parse_yaml_frontmatter, build_yaml_frontmatter
from adapters.shared.utils import parse_tool_list


class ClaudeAgentHandler(ConfigTypeHandler):
    """Handler for Claude agent files (.md with YAML frontmatter)."""

    @property
    def config_type(self) -> ConfigType:
        return ConfigType.AGENT

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalAgent:
        """
        Convert Claude agent file to canonical.

        Parses YAML frontmatter and markdown body for agents.
        """
        frontmatter, body = parse_yaml_frontmatter(content)

        # Create canonical agent
        agent = CanonicalAgent(
            name=frontmatter.get('name', ''),
            description=frontmatter.get('description', ''),
            instructions=body,
            tools=parse_tool_list(frontmatter.get('tools', '')),
            model=self._normalize_model(frontmatter.get('model')),
            source_format='claude'
        )

        # Preserve Claude-specific fields in metadata
        if 'permissionMode' in frontmatter:
            agent.add_metadata('claude_permission_mode', frontmatter['permissionMode'])

        if 'skills' in frontmatter:
            agent.add_metadata('claude_skills', frontmatter['skills'])

        return agent

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical agent to Claude format.

        Generates YAML frontmatter with Claude-specific fields.
        """
        if not isinstance(canonical_obj, CanonicalAgent):
            raise ValueError("Expected CanonicalAgent")

        options = options or {}

        # Build frontmatter
        frontmatter = {
            'name': canonical_obj.name,
            'description': canonical_obj.description,
        }

        # Tools as comma-separated string
        if canonical_obj.tools:
            frontmatter['tools'] = ', '.join(canonical_obj.tools)

        # Model
        if canonical_obj.model:
            frontmatter['model'] = canonical_obj.model

        # Restore Claude-specific metadata
        if canonical_obj.get_metadata('claude_permission_mode'):
            frontmatter['permissionMode'] = canonical_obj.get_metadata('claude_permission_mode')

        if canonical_obj.get_metadata('claude_skills'):
            frontmatter['skills'] = canonical_obj.get_metadata('claude_skills')

        return build_yaml_frontmatter(frontmatter, canonical_obj.instructions)

    def _normalize_model(self, model: Optional[str]) -> Optional[str]:
        """
        Normalize model name to canonical form.

        Claude already uses short names (sonnet, opus, haiku) which
        are the canonical form, so just lowercase and return.
        """
        if not model:
            return None
        return model.lower()
