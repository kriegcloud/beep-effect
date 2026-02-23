"""
Command-line interface for universal agent sync tool.

This module provides the CLI entry point for the sync tool, handling:
- Argument parsing
- Format registry initialization
- Adapter registration
- Orchestrator configuration
- User interaction

The CLI maintains backward compatibility with the original sync_custom_agents.py
while enabling new multi-format capabilities.
"""

from .main import main

__all__ = ['main']
