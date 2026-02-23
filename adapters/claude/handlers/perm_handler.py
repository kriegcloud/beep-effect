"""
Claude permission config type handler.

Handles conversion of permission configurations between Claude format
(JSON settings files) and canonical representation.
"""

import json
from typing import Any, Dict, Optional
from pathlib import Path
from core.canonical_models import CanonicalPermission, ConfigType
from adapters.shared.config_type_handler import ConfigTypeHandler


class ClaudePermissionHandler(ConfigTypeHandler):
    """Handler for Claude permission files (settings.json)."""

    @property
    def config_type(self) -> ConfigType:
        return ConfigType.PERMISSION

    def to_canonical(self, content: str, file_path: Optional[Path] = None) -> CanonicalPermission:
        """
        Convert Claude settings JSON to canonical permission.

        Parses JSON for permissions.
        """
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            raise ValueError("Invalid JSON in settings file")

        permissions = data.get('permissions', {})
        # Handle case where permissions might be missing or empty
        if not permissions:
            permissions = {}

        return CanonicalPermission(
            allow=permissions.get('allow') or [],
            deny=permissions.get('deny') or [],
            ask=permissions.get('ask') or [],
            source_format='claude'
        )

    def from_canonical(self, canonical_obj: Any,
                      options: Optional[Dict[str, Any]] = None) -> str:
        """
        Convert canonical permission to Claude settings JSON.

        Generates JSON for permissions.
        """
        if not isinstance(canonical_obj, CanonicalPermission):
            raise ValueError("Expected CanonicalPermission for PERMISSION config type")

        data = {
            "permissions": {
                "allow": canonical_obj.allow,
                "deny": canonical_obj.deny,
                "ask": canonical_obj.ask
            }
        }
        return json.dumps(data, indent=2)
