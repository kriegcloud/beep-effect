"""
Core module for universal agent sync architecture.

This module provides the foundational components for syncing configuration
between different AI coding agents (Claude Code, GitHub Copilot, Cursor, etc.).

Key components:
- Canonical data models (universal representation)
- Format adapter interface (contract for converters)
- Format registry (manages available adapters)
- Sync orchestrator (coordinates sync operations)
- State manager (tracks sync history)
"""

from .canonical_models import CanonicalAgent, CanonicalPermission, CanonicalSlashCommand, ConfigType
from .adapter_interface import FormatAdapter
from .registry import FormatRegistry
from .orchestrator import UniversalSyncOrchestrator
from .state_manager import SyncStateManager
from .profile_paths import ProfilePathResolver

__all__ = [
    'CanonicalAgent',
    'CanonicalPermission',
    'CanonicalSlashCommand',
    'ConfigType',
    'FormatAdapter',
    'FormatRegistry',
    'UniversalSyncOrchestrator',
    'SyncStateManager',
    'ProfilePathResolver',
]
