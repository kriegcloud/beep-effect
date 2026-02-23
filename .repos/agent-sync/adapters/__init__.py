"""
Format adapters for converting between tool-specific formats and canonical representation.

This module contains concrete implementations of FormatAdapter for each supported
AI coding tool. Each adapter knows how to:
- Parse the tool's configuration format
- Convert to canonical representation
- Convert from canonical back to tool format
- Preserve format-specific fields via metadata

Available adapters:
- ClaudeAdapter: Claude Code (.md files for agents, settings.json for permissions)
- CopilotAdapter: GitHub Copilot (.agent.md files)
- GeminiAdapter: Google Gemini CLI (.toml files for custom commands)
- ExampleAdapter: Template for new implementations

Adding a new adapter:
1. Copy adapters/example/ directory to adapters/yourformat/
2. Rename classes and implement TODOs in adapter.py and handlers/
3. Register with FormatRegistry in your application
"""

from .claude.adapter import ClaudeAdapter
from .copilot.adapter import CopilotAdapter
from .gemini.adapter import GeminiAdapter
from .example.adapter import ExampleAdapter

__all__ = [
    'ClaudeAdapter',
    'CopilotAdapter',
    'GeminiAdapter',
    'ExampleAdapter',
]
