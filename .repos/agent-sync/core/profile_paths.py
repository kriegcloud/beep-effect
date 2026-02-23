"""
Profile path resolver for platform-specific configuration directories.

This module provides a centralized way to resolve paths to AI tool configuration
directories across different platforms (Windows, macOS, Linux).
"""

import os
import platform
from pathlib import Path
from typing import Dict, Optional

from .canonical_models import ConfigType


class ProfilePathResolver:
    """
    Resolves profile paths for AI tools across platforms.

    Provides a unified interface for resolving configuration directories
    for Claude Code, GitHub Copilot, Gemini CLI, and other tools.

    Usage:
        resolver = ProfilePathResolver()
        claude_path = resolver.get_claude_profile_path()
        copilot_path = resolver.get_copilot_profile_path()
        agents_dir = resolver.get_config_subdir('claude', ConfigType.AGENT)
    """

    # Subdirectory mappings for each format and config type
    _SUBDIR_MAP: Dict[str, Dict[ConfigType, Optional[str]]] = {
        'claude': {
            ConfigType.AGENT: 'agents',
            ConfigType.SLASH_COMMAND: 'commands',
            ConfigType.PERMISSION: None,  # settings.json in root
        },
        'copilot': {
            ConfigType.AGENT: 'prompts',  # VS Code uses prompts/ for both agents and commands
            ConfigType.SLASH_COMMAND: 'prompts',
            ConfigType.PERMISSION: None,  # settings.json in root
        },
        'gemini': {
            ConfigType.SLASH_COMMAND: 'commands',
            # Gemini doesn't support AGENT or PERMISSION
        },
    }

    def __init__(self):
        """Initialize profile path resolver with platform detection."""
        self._platform = platform.system()  # 'Windows', 'Darwin', 'Linux'

    def get_claude_profile_path(self) -> Path:
        """
        Get the Claude Code profile directory path.

        Returns:
            Path to ~/.claude/ (same on all platforms)
        """
        return Path.home() / '.claude'

    def get_copilot_profile_path(self) -> Path:
        """
        Get the GitHub Copilot (VS Code) profile directory path.

        Returns:
            Platform-specific path to VS Code User directory:
            - Windows: %APPDATA%\\Code\\User\\
            - macOS: ~/Library/Application Support/Code/User/
            - Linux: ~/.config/Code/User/

        Raises:
            ValueError: If platform is not supported
        """
        if self._platform == 'Windows':
            appdata = os.environ.get('APPDATA')
            if appdata:
                return Path(appdata) / 'Code' / 'User'
            # Fallback if APPDATA not set
            return Path.home() / 'AppData' / 'Roaming' / 'Code' / 'User'
        elif self._platform == 'Darwin':  # macOS
            return Path.home() / 'Library' / 'Application Support' / 'Code' / 'User'
        elif self._platform == 'Linux':
            return Path.home() / '.config' / 'Code' / 'User'
        else:
            raise ValueError(f"Unsupported platform: {self._platform}")

    def get_gemini_profile_path(self) -> Path:
        """
        Get the Gemini CLI profile directory path.

        Returns:
            Path to ~/.gemini/ (same on all platforms)
        """
        return Path.home() / '.gemini'

    def get_profile_path(self, format_name: str) -> Path:
        """
        Get the profile directory path for a given format.

        Args:
            format_name: Format identifier ('claude', 'copilot', 'gemini')

        Returns:
            Path to the format's profile directory

        Raises:
            ValueError: If format_name is not recognized
        """
        format_lower = format_name.lower()
        if format_lower == 'claude':
            return self.get_claude_profile_path()
        elif format_lower == 'copilot':
            return self.get_copilot_profile_path()
        elif format_lower == 'gemini':
            return self.get_gemini_profile_path()
        else:
            raise ValueError(
                f"Unknown format: '{format_name}'. "
                f"Supported formats: claude, copilot, gemini"
            )

    def get_config_subdir(self, format_name: str, config_type: ConfigType) -> Path:
        """
        Get the subdirectory path for a specific config type within a format's profile.

        Args:
            format_name: Format identifier ('claude', 'copilot', 'gemini')
            config_type: The type of configuration (AGENT, PERMISSION, SLASH_COMMAND)

        Returns:
            Full path to the config type subdirectory.
            For PERMISSION, returns the base profile path (settings.json lives there).

        Raises:
            ValueError: If format_name is not recognized or config_type not supported
        """
        format_lower = format_name.lower()
        base_path = self.get_profile_path(format_lower)

        if format_lower not in self._SUBDIR_MAP:
            raise ValueError(
                f"Unknown format: '{format_name}'. "
                f"Supported formats: claude, copilot, gemini"
            )

        subdir_config = self._SUBDIR_MAP[format_lower]
        if config_type not in subdir_config:
            raise ValueError(
                f"Format '{format_name}' does not support config type '{config_type.value}'"
            )

        subdir = subdir_config[config_type]
        if subdir is None:
            # PERMISSION type - settings file lives in base directory
            return base_path
        return base_path / subdir

    def get_all_config_subdirs(self, format_name: str) -> Dict[ConfigType, Path]:
        """
        Get all config subdirectories for a format.

        Args:
            format_name: Format identifier ('claude', 'copilot', 'gemini')

        Returns:
            Dictionary mapping ConfigType to full paths

        Raises:
            ValueError: If format_name is not recognized
        """
        format_lower = format_name.lower()
        if format_lower not in self._SUBDIR_MAP:
            raise ValueError(
                f"Unknown format: '{format_name}'. "
                f"Supported formats: claude, copilot, gemini"
            )

        result = {}
        for config_type in self._SUBDIR_MAP[format_lower]:
            result[config_type] = self.get_config_subdir(format_lower, config_type)
        return result
