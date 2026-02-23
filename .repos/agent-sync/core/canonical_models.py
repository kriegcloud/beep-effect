"""
Canonical data models for universal configuration representation.

This module defines the "lingua franca" data structures that all format-specific
adapters convert to/from. This hub-and-spoke approach allows N formats to be
supported with 2N converters instead of N² converters.

Design principles:
- Core fields: Common to ALL formats (name, description, etc.)
- Metadata dict: Preserves format-specific fields for round-trip fidelity
- Source tracking: Helps with intelligent conversion decisions
- Version tracking: Enables schema evolution

Each config type (agents, permissions, prompts) gets its own canonical model.
"""

from dataclasses import dataclass, field
from typing import Optional, List, Dict, Any, Union
from enum import Enum


class ConfigType(Enum):
    """Types of configuration that can be synced."""
    AGENT = "agent"
    PERMISSION = "permission"
    SLASH_COMMAND = "slash_command"


@dataclass
class MetadataMixin:
    """Mixin for handling format-specific metadata."""
    
    def add_metadata(self, key: str, value: Any):
        """
        Store format-specific field that may not have equivalents in other formats.
        """
        self.metadata[key] = value

    def get_metadata(self, key: str, default=None):
        """Retrieve format-specific metadata with optional default."""
        return self.metadata.get(key, default)

    def has_metadata(self, key: str) -> bool:
        """Check if metadata key exists."""
        return key in self.metadata


@dataclass
class CanonicalAgent(MetadataMixin):
    """
    Canonical representation of an AI agent configuration.

    This is the universal format that all agent formats (Claude .md, Copilot .agent.md,
    Cursor .json, etc.) convert to and from.

    Attributes:
        name: Agent identifier (used for file matching)
        description: Human-readable description of agent purpose
        instructions: Full markdown instructions/system prompt
        tools: List of available tools (normalized names)
        model: Model identifier in canonical form (sonnet, opus, haiku, etc.)
        metadata: Format-specific fields preserved for round-trip conversion
        source_format: Which format this was originally parsed from
        version: Schema version for future compatibility
    """
    # Core fields (supported by all formats)
    name: str
    description: str
    instructions: str  # Markdown body content

    # Tools/capabilities
    tools: List[str] = field(default_factory=list)

    # Model configuration (normalized to canonical names)
    model: Optional[str] = None

    # Extended attributes (format-specific, preserved for round-trips)
    metadata: Dict[str, Any] = field(default_factory=dict)

    # Tracking
    source_format: Optional[str] = None
    version: str = "1.0"

    def __post_init__(self):
        """Validate required fields."""
        if not self.name:
            raise ValueError("CanonicalAgent must have a non-empty name")
        if not self.description:
            raise ValueError("CanonicalAgent must have a non-empty description")
        if not self.instructions:
            raise ValueError("CanonicalAgent must have non-empty instructions")


@dataclass
class CanonicalPermission(MetadataMixin):
    """
    Canonical representation of permission/security configuration.

    Different tools handle permissions differently:
    - Claude: permissionMode in agents, or settings.json
    - Copilot: Doesn't have explicit permission model
    - Cursor: Privacy settings, allowed directories

    Attributes:
        allow: List of explicitly allowed operations/paths
        deny: List of explicitly denied operations/paths
        ask: List of operations that require user confirmation
        default_mode: Default permission behavior. Valid values: 'allow', 'deny', 'ask', or None.
        metadata: Format-specific permission settings
        source_format: Original format
    """
    allow: List[str] = field(default_factory=list)
    deny: List[str] = field(default_factory=list)
    ask: List[str] = field(default_factory=list)
    default_mode: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    source_format: Optional[str] = None
    version: str = "1.0"


@dataclass
class CanonicalSlashCommand(MetadataMixin):
    """
    Canonical representation of a slash command / prompt file.

    Slash commands are reusable prompt templates that can be invoked via special syntax:
    - Claude Code: Slash commands (.md files in .claude/commands/)
    - Copilot: Prompt files (.prompt.md files in .github/prompts/)

    Attributes:
        name: Command identifier (from filename or frontmatter)
        description: Brief description of what the command does
        instructions: Markdown body content with command instructions
        argument_hint: Optional usage guidance for command arguments
        model: Optional model selection (requires name mapping between formats)
        allowed_tools: Optional tool restrictions (Claude) or tool list (Copilot)
        metadata: Format-specific fields preserved for round-trip conversion
        source_format: Original format (claude, copilot, etc.)
        version: Schema version for future compatibility

    Examples:
        Claude slash command:
            name: "commit"
            description: "Create intelligent git commits"
            instructions: "Create a git commit based on: $ARGUMENTS"
            argument_hint: "[description] | [multi-commit request]"
            model: "haiku"
            allowed_tools: ["Bash(git:*)", "Read", "Write"]

        Copilot prompt file:
            name: "explain-code"
            description: "Generate clear code explanations"
            instructions: "Explain the following code: ${input:code}"
            argument_hint: "code snippet to explain"
            model: "gpt-4o"
            metadata: {"copilot_agent": "ask", "copilot_tools": ["githubRepo"]}
    """
    # Core fields (universally supported)
    name: str
    description: str
    instructions: str  # Markdown body content

    # Optional fields (format-dependent)
    argument_hint: Optional[str] = None
    model: Optional[str] = None
    allowed_tools: List[str] = field(default_factory=list)

    # Extended attributes (format-specific, preserved for round-trips)
    metadata: Dict[str, Any] = field(default_factory=dict)

    # Tracking
    source_format: Optional[str] = None
    version: str = "1.0"

    def __post_init__(self):
        """Validate required fields."""
        if not self.name:
            raise ValueError("CanonicalSlashCommand must have a non-empty name")
        # Note: description is optional in some formats (e.g., Gemini)
        # Format-specific adapters can validate it if needed
        if not self.instructions:
            raise ValueError("CanonicalSlashCommand must have non-empty instructions")

        if self.allowed_tools is None:
             self.allowed_tools = []


# Type alias for all canonical models
CanonicalConfig = Union[CanonicalAgent, CanonicalPermission, CanonicalSlashCommand]