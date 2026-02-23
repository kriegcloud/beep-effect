"""
Copilot agent config type handler.

Handles conversion of agent configurations between Copilot format
and canonical representation.
"""

from typing import Any, Dict, Optional
from pathlib import Path
from core.canonical_models import CanonicalAgent, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler
from adapters.shared.frontmatter import parse_yaml_frontmatter, build_yaml_frontmatter


class CopilotAgentHandler(ConfigTypeHandler):
    """Handler for Copilot agent files (.agent.md)."""

    # Model name mappings (from class level of original CopilotAdapter)
    MODEL_TO_CANONICAL = {
        'claude sonnet 4': 'sonnet',
        'claude opus 4': 'opus',
        'claude haiku 4': 'haiku',
    }

    MODEL_FROM_CANONICAL = {
        'sonnet': 'Claude Sonnet 4',
        'opus': 'Claude Opus 4',
        'haiku': 'Claude Haiku 4',
    }

    @property
    def config_type(self) -> ConfigType:
        return ConfigType.AGENT

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalAgent:
        """
        Convert Copilot agent file to canonical.

        Parses YAML frontmatter and markdown body, extracts fields,
        and creates CanonicalAgent with preserved metadata.
        """
        frontmatter, body = parse_yaml_frontmatter(content)

        # Create canonical agent
        tools = frontmatter.get('tools', [])
        if tools and not isinstance(tools, list):
            raise ValueError(f"Tools must be a list, got {type(tools).__name__}")

        agent = CanonicalAgent(
            name=frontmatter.get('name', ''),
            description=frontmatter.get('description', ''),
            instructions=body,
            tools=tools,
            model=self._normalize_model(frontmatter.get('model')),
            source_format='copilot'
        )

        # Preserve Copilot-specific fields in metadata
        if 'argument-hint' in frontmatter:
            agent.add_metadata('copilot_argument_hint', frontmatter['argument-hint'])

        if 'handoffs' in frontmatter:
            agent.add_metadata('copilot_handoffs', frontmatter['handoffs'])

        if 'target' in frontmatter:
            agent.add_metadata('copilot_target', frontmatter['target'])

        if 'mcp-servers' in frontmatter:
            agent.add_metadata('copilot_mcp_servers', frontmatter['mcp-servers'])

        return agent

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical agent to Copilot format.

        Generates YAML frontmatter with Copilot-specific fields and
        markdown body. Options can enable optional fields like argument-hint.
        """
        if not isinstance(canonical_obj, CanonicalAgent):
            raise ValueError("Expected CanonicalAgent")

        options = options or {}

        # Build frontmatter
        frontmatter = {
            'name': canonical_obj.name,
            'description': canonical_obj.description,
        }

        # Tools as array
        if canonical_obj.tools:
            frontmatter['tools'] = canonical_obj.tools

        # Model (convert to Copilot full names)
        if canonical_obj.model:
            frontmatter['model'] = self._denormalize_model(canonical_obj.model)

        # Always add target for Copilot
        frontmatter['target'] = canonical_obj.get_metadata('copilot_target', 'vscode')

        # Optional: Add argument-hint if requested or preserved
        if options.get('add_argument_hint') or canonical_obj.get_metadata('copilot_argument_hint'):
            hint = canonical_obj.get_metadata('copilot_argument_hint', canonical_obj.description)
            frontmatter['argument-hint'] = hint

        # Optional: Add handoffs if requested or preserved
        if options.get('add_handoffs') or canonical_obj.get_metadata('copilot_handoffs'):
            frontmatter['handoffs'] = canonical_obj.get_metadata('copilot_handoffs',
                [{'label': 'Next Step', 'agent': 'agent', 'prompt': 'Continue', 'send': False}])

        # MCP servers if preserved
        if canonical_obj.get_metadata('copilot_mcp_servers'):
            frontmatter['mcp-servers'] = canonical_obj.get_metadata('copilot_mcp_servers')

        return build_yaml_frontmatter(frontmatter, canonical_obj.instructions)

    def _normalize_model(self, model: Optional[str]) -> Optional[str]:
        """Convert Copilot model names to canonical form."""
        if not model:
            return None
        return self.MODEL_TO_CANONICAL.get(model.lower(), model.lower())

    def _denormalize_model(self, model: str) -> str:
        """Convert canonical model names to Copilot form."""
        return self.MODEL_FROM_CANONICAL.get(model.lower(), model)
